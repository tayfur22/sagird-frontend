"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { authApi } from "@/lib/auth/auth-api";
import { useAuth } from "@/lib/auth/AuthProvider";
import { passwordIssues } from "@/lib/auth/validation";
import { t } from "@/lib/i18n/t";
import { apiErrorMessage, fieldErrorsFrom, validationMessage } from "@/lib/i18n/translate-error";
import { ApiError } from "@/lib/api/errors";
import styles from "./AuthForms.module.css";
import { PasswordRules } from "./PasswordRules";

export function ChangePasswordForm() {
  const { applySession } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const clientErrors: Record<string, string> = {};
    if (!currentPassword) clientErrors.currentPassword = validationMessage("REQUIRED");
    const firstIssue = passwordIssues(newPassword)[0];
    if (!newPassword) clientErrors.newPassword = validationMessage("REQUIRED");
    else if (firstIssue) clientErrors.newPassword = validationMessage(firstIssue);
    if (!confirmPassword) clientErrors.confirmPassword = validationMessage("REQUIRED");
    else if (confirmPassword !== newPassword) clientErrors.confirmPassword = validationMessage("PASSWORDS_MISMATCH");
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      const session = await authApi.changePassword({ currentPassword, newPassword });
      // The server revoked every old session and issued a new one for this device.
      applySession(session);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast(t.profile.passwordChanged, "success");
    } catch (error) {
      const serverFieldErrors = fieldErrorsFrom(error);
      if (ApiError.isApiError(error) && error.code === "INVALID_CURRENT_PASSWORD") {
        setErrors({ currentPassword: apiErrorMessage(error) });
        setFormError(null);
      } else if (ApiError.isApiError(error) && error.code === "PASSWORD_SAME_AS_CURRENT") {
        setErrors({ newPassword: apiErrorMessage(error) });
        setFormError(null);
      } else {
        setErrors(serverFieldErrors);
        setFormError(Object.keys(serverFieldErrors).length > 0 ? null : apiErrorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title={t.profile.changePassword}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}
        <Input
          label={t.profile.currentPassword}
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          errorText={errors.currentPassword}
          required
        />
        <Input
          label={t.profile.newPassword}
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          errorText={errors.newPassword}
          required
        />
        <PasswordRules password={newPassword} />
        <Input
          label={t.profile.confirmNewPassword}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          errorText={errors.confirmPassword}
          required
        />
        <div className={styles.actions}>
          <Button type="submit" loading={saving}>
            {t.profile.changePasswordSubmit}
          </Button>
        </div>
      </form>
    </Card>
  );
}
