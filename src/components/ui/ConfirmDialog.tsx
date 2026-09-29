"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { Button, type ButtonVariant } from "./Button";
import { Modal } from "./Modal";
import styles from "./ConfirmDialog.module.css";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  /** While true the confirm button shows a spinner and the dialog cannot be dismissed. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Yes/no confirmation built on Modal. Dismissal (Escape, overlay click,
 * Cancel) is blocked while `loading`, so an in-flight request can't be
 * abandoned or fired twice. Modal re-runs its focus effect whenever its
 * `onClose` identity changes, so a stable handler is passed to it.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslation();
  const onCancelRef = useRef(onCancel);
  const loadingRef = useRef(loading);

  useEffect(() => {
    onCancelRef.current = onCancel;
    loadingRef.current = loading;
  }, [onCancel, loading]);

  const handleClose = useCallback(() => {
    if (!loadingRef.current) onCancelRef.current();
  }, []);

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
          {cancelLabel ?? t.common.cancel}
        </Button>
        <Button type="button" variant={confirmVariant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
