"use client";

import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { ProfileForm } from "@/components/auth/ProfileForm";
import styles from "@/components/auth/AuthForms.module.css";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n/t";

export default function StudentProfilePage() {
  const { user } = useAuth();
  if (!user) return null; // RequireAuth in the layout guarantees a user; this satisfies the type.

  return (
    <div className={styles.stack}>
      <h1 className={styles.heading}>{t.profile.title}</h1>
      {/* key: reset form state if the cached user is replaced (e.g. after re-login). */}
      <ProfileForm key={user.id} user={user} />
      <ChangePasswordForm />
    </div>
  );
}
