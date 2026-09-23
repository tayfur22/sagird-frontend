/** Mirrors az.sagird.modules.attempt.entity.AttemptSecurityStatus (Phase 12A). */
export type AttemptSecurityStatus = "NORMAL" | "WARNING" | "TERMINATED";

/**
 * The subset of az.sagird.modules.attempt.entity.AttemptSecurityEventType
 * (Phase 12A) that this phase's browser-side signal layer can actually
 * observe and report. MULTIPLE_SESSION, CLIENT_TIME_MISMATCH and
 * SUSPICIOUS_REQUEST are also valid backend event types but are never
 * fired from here - the frontend only ever *consumes* the security state
 * that results from them (spec section 11), it never invents client-side
 * detection for them.
 */
export type AttemptSecurityEventType =
  | "TAB_HIDDEN"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT"
  | "COPY"
  | "PASTE"
  | "CONTEXT_MENU"
  | "DEVTOOLS_DETECTED";

/** Mirrors az.sagird.modules.attempt.dto.SecurityEventRequest. No timestamp - the server clock is authoritative. */
export interface SecurityEventRequest {
  eventType: AttemptSecurityEventType;
  metadata?: string | null;
}

/**
 * Mirrors az.sagird.modules.attempt.dto.SecurityStateResponse - the only
 * authoritative source for security status/violation count/termination.
 * The frontend never computes any of these fields itself.
 */
export interface SecurityStateResponse {
  securityStatus: AttemptSecurityStatus;
  violationCount: number;
  remainingViolations: number | null;
  terminated: boolean;
}
