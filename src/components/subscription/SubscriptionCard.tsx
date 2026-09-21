import { Card } from "@/components/ui/Card";
import { formatRemaining, formatSubscriptionDate } from "@/lib/subscription/format";
import { t } from "@/lib/i18n/t";
import type { SubscriptionResponse } from "@/types/subscription";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";
import styles from "./SubscriptionCard.module.css";

export function SubscriptionCard({ subscription }: { subscription: SubscriptionResponse }) {
  const remaining = subscription.active ? formatRemaining(subscription.endAt) : null;

  return (
    <Card>
      <div className={styles.header}>
        <span className={styles.plan}>{t.subscription.plans[subscription.plan]}</span>
        <SubscriptionStatusBadge subscription={subscription} />
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t.subscription.startDate}</span>
          <span className={styles.fieldValue}>{formatSubscriptionDate(subscription.startAt)}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t.subscription.endDate}</span>
          <span className={styles.fieldValue}>{formatSubscriptionDate(subscription.endAt)}</span>
        </div>
        {subscription.status === "CANCELLED" && subscription.cancelledAt && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.subscription.cancelledAt}</span>
            <span className={styles.fieldValue}>{formatSubscriptionDate(subscription.cancelledAt)}</span>
          </div>
        )}
      </div>

      {remaining && (
        <div className={styles.remaining}>
          {t.subscription.remainingLabel} <span className={styles.remainingValue}>{remaining}</span>
        </div>
      )}
    </Card>
  );
}