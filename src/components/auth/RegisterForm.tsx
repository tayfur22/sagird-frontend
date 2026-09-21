"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/AuthProvider";
import { homePathForRole, isValidEmail, passwordIssues } from "@/lib/auth/validation";
import { t } from "@/lib/i18n/t";
import { apiErrorMessage, fieldErrorsFrom, validationMessage } from "@/lib/i18n/translate-error";
import { AuthCard } from "./AuthCard";
import styles from "./AuthForms.module.css";
import { PasswordRules } from "./PasswordRules";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): Record<string, string> {
    const result: Record<string, string> = {};
    if (!firstName.trim()) result.firstName = validationMessage("REQUIRED");
    if (!lastName.trim()) result.lastName = validationMessage("REQUIRED");
    if (!email.trim()) result.email = validationMessage("REQUIRED");
    else if (!isValidEmail(email)) result.email = validationMessage("INVALID_EMAIL");

    const issues = passwordIssues(password);
    const firstIssue = issues[0];
    if (!password) result.password = validationMessage("REQUIRED");
    else if (firstIssue) result.password = validationMessage(firstIssue);

    if (!confirmPassword) result.confirmPassword = validationMessage("REQUIRED");
    else if (confirmPassword !== password) result.confirmPassword = validationMessage("PASSWORDS_MISMATCH");
    return result;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      const user = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      router.replace(homePathForRole(user.role));
    } catch (error) {
      const serverFieldErrors = fieldErrorsFrom(error);
      setErrors(serverFieldErrors);
      // A duplicate email is best shown on the email field itself.
      if (ApiError.isApiError(error) && error.code === "EMAIL_ALREADY_EXISTS") {
        setErrors({ email: apiErrorMessage(error) });
        setFormError(null);
      } else {
        setFormError(Object.keys(serverFieldErrors).length > 0 ? null : apiErrorMessage(error));
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title={t.auth.register.title}
      subtitle={t.auth.register.subtitle}
      footer={
        <>
          {t.auth.register.haveAccount} <Link href="/login">{t.auth.register.loginLink}</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}
        <div className={styles.row}>
          <Input
            label={t.auth.register.firstName}
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            errorText={errors.firstName}
            required
          />
          <Input
            label={t.auth.register.lastName}
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            errorText={errors.lastName}
            required
          />
        </div>
        <Input
          label={t.auth.register.email}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          errorText={errors.email}
          required
        />
        <Input
          label={t.auth.register.password}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errorText={errors.password}
          required
        />
        <PasswordRules password={password} />
        <Input
          label={t.auth.register.confirmPassword}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          errorText={errors.confirmPassword}
          required
        />
        <Button type="submit" fullWidth loading={submitting}>
          {t.auth.register.submit}
        </Button>
      </form>
    </AuthCard>
  );
}
