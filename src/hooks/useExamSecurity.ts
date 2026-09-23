"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { attemptApi } from "@/lib/attempt/attempt-api";
import { NetworkError } from "@/lib/api/errors";
import type { AttemptSecurityEventType, SecurityStateResponse } from "@/types/attempt-security";

/** Two reports of the same event type within this window are collapsed client-side (mirrors the backend's own dedupe window, spec section 15). */
const RESEND_THROTTLE_MS = 3000;
/** A visibilitychange immediately followed by a blur (or vice versa) is one browser action, not two (spec section 6). */
const VISIBILITY_BLUR_GRACE_MS = 500;
/** Lightweight, infrequent DevTools heuristic - a size check every 10s, never a tight poll (spec section 10). */
const DEVTOOLS_CHECK_INTERVAL_MS = 10000;
const DEVTOOLS_SIZE_THRESHOLD_PX = 160;

export interface ExamSecurityState {
  /** The backend's last authoritative security state, or null before the first event/report. */
  securityState: SecurityStateResponse | null;
  /** True while fullscreen is required for this exam and the document is not currently in fullscreen. */
  fullscreenRequired: boolean;
  fullscreenActive: boolean;
  /** Re-requests fullscreen; must be called from a user gesture (e.g. a button click) since browsers reject unsolicited requests. */
  enterFullscreen: () => void;
  /** True while the most recent event report failed for a transient network reason (not a real backend answer). */
  connectionWarning: boolean;
  /** Attach to the DOM node that wraps the active exam UI - copy/paste/context-menu restrictions are scoped to it only. */
  containerRef: RefObject<HTMLDivElement>;
}

/**
 * Phase 12B signal/reporting layer for Phase 12A's anti-cheat backend.
 * Registers browser listeners scoped to the active exam only, reports the
 * supported events, and exposes whatever security state the backend last
 * returned. Never computes a violation count or termination decision
 * itself - the backend response is the only source of truth.
 */
export function useExamSecurity(
  attemptId: string,
  active: boolean,
  fullscreenRequired: boolean
): ExamSecurityState {
  const [securityState, setSecurityState] = useState<SecurityStateResponse | null>(null);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [connectionWarning, setConnectionWarning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const lastSentAtRef = useRef<Partial<Record<AttemptSecurityEventType, number>>>({});
  const inFlightRef = useRef<Partial<Record<AttemptSecurityEventType, boolean>>>({});
  const lastVisibilityChangeAtRef = useRef(0);
  const wasFullscreenRef = useRef(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const report = useCallback(
    (eventType: AttemptSecurityEventType, metadata?: string) => {
      if (!activeRef.current) return;
      if (inFlightRef.current[eventType]) return;
      const now = Date.now();
      const lastSentAt = lastSentAtRef.current[eventType] ?? 0;
      if (now - lastSentAt < RESEND_THROTTLE_MS) return;

      lastSentAtRef.current[eventType] = now;
      inFlightRef.current[eventType] = true;

      attemptApi
        .reportSecurityEvent(attemptId, { eventType, metadata })
        .then((response) => {
          if (!activeRef.current) return;
          setSecurityState(response);
          setConnectionWarning(false);
          // The backend already terminated the attempt (or otherwise made it unusable) -
          // stop reporting further events for the rest of this mount.
          if (response.terminated) {
            activeRef.current = false;
          }
        })
        .catch((err: unknown) => {
          if (!activeRef.current) return;
          if (err instanceof NetworkError) {
            // Transient failure only - never fabricate a state or assume termination (spec section 16).
            setConnectionWarning(true);
          }
          // Any other (structured) API error - e.g. the attempt just became unusable through
          // another path - is left for the exam page's own attempt refresh to surface.
        })
        .finally(() => {
          inFlightRef.current[eventType] = false;
        });
    },
    [attemptId]
  );

  // Tab visibility (spec section 5).
  useEffect(() => {
    if (!active) return;
    function onVisibilityChange() {
      lastVisibilityChangeAtRef.current = Date.now();
      if (document.visibilityState === "hidden") {
        report("TAB_HIDDEN");
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [active, report]);

  // Window blur (spec section 6) - suppressed when it's just the counterpart of a visibilitychange we already reported.
  useEffect(() => {
    if (!active) return;
    function onBlur() {
      if (Date.now() - lastVisibilityChangeAtRef.current < VISIBILITY_BLUR_GRACE_MS) return;
      report("WINDOW_BLUR");
    }
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [active, report]);

  // Copy/paste/context menu (spec section 7/8) - scoped to the exam container only, never the whole document.
  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    if (!node) return;

    function onCopy(event: ClipboardEvent) {
      event.preventDefault();
      report("COPY");
    }
    function onPaste(event: ClipboardEvent) {
      event.preventDefault();
      report("PASTE");
    }
    function onContextMenu(event: MouseEvent) {
      event.preventDefault();
      report("CONTEXT_MENU");
    }

    node.addEventListener("copy", onCopy);
    node.addEventListener("paste", onPaste);
    node.addEventListener("contextmenu", onContextMenu);
    return () => {
      node.removeEventListener("copy", onCopy);
      node.removeEventListener("paste", onPaste);
      node.removeEventListener("contextmenu", onContextMenu);
    };
    // Re-run once the container node actually exists (first render after `active` flips has no node yet).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, report, containerRef.current]);

  // Fullscreen (spec section 9): request once when required + active; report exit; never auto-retry.
  const requestFullscreenOnce = useCallback(() => {
    const el = document.documentElement;
    if (document.fullscreenElement || !el.requestFullscreen) return;
    el.requestFullscreen().catch(() => {
      // Rejected (no user gesture, or the browser/user declined) - handled gracefully, no retry loop.
    });
  }, []);

  useEffect(() => {
    if (!active || !fullscreenRequired) return;
    requestFullscreenOnce();
  }, [active, fullscreenRequired, requestFullscreenOnce]);

  useEffect(() => {
    if (!active) return;
    function onFullscreenChange() {
      const isFullscreen = Boolean(document.fullscreenElement);
      setFullscreenActive(isFullscreen);
      if (!isFullscreen && wasFullscreenRef.current && fullscreenRequired) {
        report("FULLSCREEN_EXIT");
      }
      wasFullscreenRef.current = isFullscreen;
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    onFullscreenChange();
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [active, fullscreenRequired, report]);

  // DevTools (spec section 10) - a lightweight, infrequent heuristic only; never trusted, just a signal.
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > DEVTOOLS_SIZE_THRESHOLD_PX || heightDiff > DEVTOOLS_SIZE_THRESHOLD_PX) {
        report("DEVTOOLS_DETECTED");
      }
    }, DEVTOOLS_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [active, report]);

  // Reset all local security state when this hook stops being active (attempt no longer in progress, or unmounted).
  useEffect(() => {
    if (active) return;
    setSecurityState(null);
    setConnectionWarning(false);
  }, [active]);

  return {
    securityState,
    fullscreenRequired,
    fullscreenActive,
    enterFullscreen: requestFullscreenOnce,
    connectionWarning,
    containerRef,
  };
}
