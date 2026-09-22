"use client";

import { Modal } from "@/components/ui/Modal";
import { formatAmount, formatPaymentDate, providerLabel } from "@/lib/payment/format";
import { t } from "@/lib/i18n/t";
import type { PaymentResponse } from "@/types/payment";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import styles from "./PaymentDetailModal.module.css";

/**
 * Read-only detail view for one of the student's own payments (backed by
 * GET /api/v1/payments/me/{id}, so ownership is already enforced server-side).
 * Never shows card/CVV data - there is none in the PaymentResponse to begin with.
 */
export function PaymentDetailModal({ payment, onClose }: { payment: PaymentResponse | null; onClose: () => void }) {
  return (
    <Modal open={payment !== null} onClose={onClose} title={t.payment.detail.title}>
      {payment && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.payment.detail.id}</span>
            <span className={styles.fieldValue}>{payment.id}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.payment.detail.status}</span>
            <div className={styles.statusRow}>
              <PaymentStatusBadge status={payment.status} />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.payment.detail.plan}</span>
            <span className={styles.fieldValue}>{t.subscription.plans[payment.plan]}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.payment.detail.amount}</span>
            <span className={styles.fieldValue}>{formatAmount(payment.amount, payment.currency)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.payment.detail.provider}</span>
            <span className={styles.fieldValue}>{providerLabel(payment.provider)}</span>
          </div>
          {payment.failureReason && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t.payment.detail.failureReason}</span>
              <span className={styles.fieldValue}>{payment.failureReason}</span>
            </div>
          )}
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.payment.detail.paidAt}</span>
            <span className={styles.fieldValue}>{formatPaymentDate(payment.paidAt)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.payment.detail.createdAt}</span>
            <span className={styles.fieldValue}>{formatPaymentDate(payment.createdAt)}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}