"use client";

import { Modal } from "@/components/ui/Modal";
import { ButtonLink } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./SecurityTerminatedModal.module.css";

/**
 * Critical, non-dismissible state shown the moment the backend reports an
 * attempt as security-terminated (spec section 13). Uses the existing
 * accessible Modal component; the only way out is the navigation action -
 * there is nothing to locally retry or undo.
 */
export function SecurityTerminatedModal() {
  const t = useTranslation();

  return (
    <Modal open onClose={() => undefined} title={t.attempt.security.terminated}>
      <p className={styles.text}>{t.attempt.security.terminatedDetails}</p>
      <div className={styles.actions}>
        <ButtonLink href="/student/exams" variant="primary">
          {t.attempt.security.returnToExams}
        </ButtonLink>
      </div>
    </Modal>
  );
}
