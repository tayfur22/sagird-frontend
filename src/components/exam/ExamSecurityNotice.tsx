"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamSecurityState } from "@/hooks/useExamSecurity";
import styles from "./ExamSecurityNotice.module.css";

interface ExamSecurityNoticeProps {
  security: ExamSecurityState;
}

/**
 * Calm, non-accusatory anti-cheat notices for the active exam (spec
 * sections 12/22/25): a fullscreen prompt when required and not active, a
 * warning once the backend reports WARNING, and a non-blocking connection
 * note on a transient report failure. Renders nothing in the normal state.
 */
export function ExamSecurityNotice({ security }: ExamSecurityNoticeProps) {
  const t = useTranslation();
  const { securityState, fullscreenRequired, fullscreenActive, enterFullscreen, connectionWarning } = security;

  const showFullscreenPrompt = fullscreenRequired && !fullscreenActive;
  const showWarning = securityState?.securityStatus === "WARNING";

  if (!showFullscreenPrompt && !showWarning && !connectionWarning) return null;

  return (
    <div className={styles.notices}>
      {showFullscreenPrompt && (
        <Alert variant="info" title={t.attempt.security.fullscreenRequired}>
          <p>{t.attempt.security.fullscreenExit}</p>
          <Button variant="secondary" size="sm" onClick={enterFullscreen} className={styles.action}>
            {t.attempt.security.enterFullscreen}
          </Button>
        </Alert>
      )}
      {showWarning && (
        <Alert variant="warning" title={t.attempt.security.title}>
          <p>{t.attempt.security.warning}</p>
          <p>{t.attempt.security.warningDetails}</p>
        </Alert>
      )}
      {connectionWarning && (
        <Alert variant="info" title={t.attempt.security.title}>
          <p>{t.attempt.security.securityConnectionError}</p>
        </Alert>
      )}
    </div>
  );
}
