"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { homePathForRole, isValidEmail, safeNextPath } from "@/lib/auth/validation";
import { t } from "@/lib/i18n/t";
import { apiErrorMessage, fieldErrorsFrom, validationMessage } from "@/lib/i18n/translate-error";
import { AuthCard } from "./AuthCard";
import styles from "./AuthForms.module.css";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = validationMessage("REQUIRED");
    else if (!isValidEmail(email)) nextErrors.email = validationMessage("INVALID_EMAIL");
    if (!password) nextErrors.password = validationMessage("REQUIRED");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      router.replace(safeNextPath(searchParams.get("next")) ?? homePathForRole(user.role));
    } catch (error) {
      const serverFieldErrors = fieldErrorsFrom(error);
      setErrors(serverFieldErrors);
      setFormError(Object.keys(serverFieldErrors).length > 0 ? null : apiErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title={t.auth.login.title}
      subtitle={t.auth.login.subtitle}
      footer={
        <>
          {t.auth.login.noAccount} <Link href="/register">{t.auth.login.registerLink}</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}
        <Input
          label={t.auth.login.email}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          errorText={errors.email}
          required
        />
        <Input
          label={t.auth.login.password}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errorText={errors.password}
          required
        />
        <Button type="submit" fullWidth loading={submitting}>
          {t.auth.login.submit}
        </Button>
      </form>
    </AuthCard>
  );
}
