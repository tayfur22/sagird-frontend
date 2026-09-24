"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { attemptApi } from "@/lib/attempt/attempt-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExplanationLocale } from "@/types/attempt-result";
import styles from "./ExplanationSection.module.css";

interface ExplanationSectionProps {
  attemptId: string;
  questionId: string;
}

type Status = "idle" | "loading" | "success" | "error";

/**
 * Phase 14B: the collapsed-by-default "show explanation" control on one
 * question of the detailed result review, and the panel it reveals. The
 * only place in the frontend that ever calls
 * GET .../questions/{questionId}/explanation (Phase 14A) - never rendered
 * on the active-exam question UI, and never fetched until the student
 * actually asks for it (spec: "Performance").
 * <p>
 * State is local to this one question, exactly as specced ("State
 * management"): loading/success/error plus which locale the currently
 * shown content was loaded for. No global explanation store.
 */
export function ExplanationSection({ attemptId, questionId }: ExplanationSectionProps) {
  const t = useTranslation();
  const d = t.attempt.detailedResult.explanation;
  const { locale } = useLocale();

  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [content, setContent] = useState<string | null>(null);
  const [loadedLocale, setLoadedLocale] = useState<ExplanationLocale | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const panelId = `explanation-panel-${questionId}`;

  // Fetches once per (question, locale): skips if content already loaded
  // for the currently active UI locale (reuse/caching), but re-fetches
  // automatically if the interface language changes while the panel is
  // open or was previously loaded (spec: "Locale request"/"Caching") -
  // never silently keeps showing content in the old locale.
  useEffect(() => {
    if (!expanded) return;
    if (status === "success" && loadedLocale === locale) return;

    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    attemptApi
      .getExplanation(attemptId, questionId, locale)
      .then((response) => {
        if (cancelled) return;
        setContent(response.content);
        setLoadedLocale(response.locale);
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setErrorMessage(apiErrorMessage(err));
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // retryToken intentionally triggers a re-run without changing any other dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, locale, retryToken]);

  function toggle() {
    setExpanded((value) => !value);
  }

  function retry() {
    setRetryToken((value) => value + 1);
  }

  const showFallbackNotice = status === "success" && loadedLocale !== null && loadedLocale !== locale;

  return (
    <div className={styles.root}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        loading={status === "loading"}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={toggle}
      >
        {expanded ? d.hideAction : d.showAction}
      </Button>

      {expanded && (
        <div id={panelId} role="region" className={styles.panel}>
          {status === "loading" && (
            <div className={styles.loadingRows} aria-live="polite" aria-busy="true">
              <Skeleton width="90%" height={14} />
              <Skeleton width="75%" height={14} />
              <Skeleton width="55%" height={14} />
            </div>
          )}

          {status === "error" && errorMessage && (
            <Alert variant="error">
              <p>{errorMessage}</p>
              <div className={styles.errorActions}>
                <Button variant="secondary" size="sm" onClick={retry}>
                  {t.common.retry}
                </Button>
              </div>
            </Alert>
          )}

          {status === "success" && content !== null && (
            <div className={styles.body}>
              <span className={styles.heading}>{d.heading}</span>
              {showFallbackNotice && loadedLocale && (
                <p className={styles.fallbackNotice}>{d.fallbackNotice.replace("{locale}", t.language[loadedLocale])}</p>
              )}
              <p className={styles.text}>{content}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
