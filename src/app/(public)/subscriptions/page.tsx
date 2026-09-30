"use client";

import { PublicSubscriptionPlans } from "@/components/subscription/PublicSubscriptionPlans";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "../exams/page.module.css";

/** Public /subscriptions: plan + price visible without login. */
export default function PublicSubscriptionsPage() {
  const t = useTranslation();

  return (
    <div className="container">
      <div className={styles.wrap}>
        <div>
          <h1 className={styles.heading}>{t.subscription.public.title}</h1>
          <p className={styles.subtitle}>{t.subscription.public.subtitle}</p>
        </div>

        <PublicSubscriptionPlans />
      </div>
    </div>
  );
}
