"use client";

import { useCallback, useState } from "react";
import { AdminSubscriptionTable } from "@/components/admin/AdminSubscriptionTable";
import { CreateSubscriptionModal } from "@/components/admin/CreateSubscriptionModal";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function AdminSubscriptionsPage() {
  const t = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const closeCreate = useCallback(() => setCreateOpen(false), []);
  const handleCreated = useCallback(() => {
    setCreateOpen(false);
    setRefreshToken((value) => value + 1);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>{t.admin.subscriptions.title}</h1>
          <p className={styles.subtitle}>{t.admin.subscriptions.subtitle}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>{t.admin.subscriptions.create.open}</Button>
      </div>

      <AdminSubscriptionTable refreshToken={refreshToken} />

      <CreateSubscriptionModal open={createOpen} onClose={closeCreate} onCreated={handleCreated} />
    </div>
  );
}
