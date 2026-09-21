"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { authApi } from "@/lib/auth/auth-api";
import { useAuth } from "@/lib/auth/AuthProvider";
import { isValidPhone } from "@/lib/auth/validation";
import { t } from "@/lib/i18n/t";
import { apiErrorMessage, fieldErrorsFrom, validationMessage } from "@/lib/i18n/translate-error";
import type { User } from "@/types/auth";
import styles from "./AuthForms.module.css";

const GRADE_OPTIONS = Array.from({ length: 11 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}`,
}));

export function ProfileForm({ user }: { user: User }) {
  const { setUser } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [grade, setGrade] = useState(user.grade ? String(user.grade) : "");
  const [school, setSchool] = useState(user.school ?? "");
  const [city, setCity] = useState(user.city ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const clientErrors: Record<string, string> = {};
    if (!firstName.trim()) clientErrors.firstName = validationMessage("REQUIRED");
    if (!lastName.trim()) clientErrors.lastName = validationMessage("REQUIRED");
    if (phone.trim() && !isValidPhone(phone)) clientErrors.phone = validationMessage("INVALID_PHONE");
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        grade: grade ? Number(grade) : null,
        school: school.trim() || null,
        city: city.trim() || null,
      });
      setUser(updated);
      showToast(t.profile.saved, "success");
    } catch (error) {
      const serverFieldErrors = fieldErrorsFrom(error);
      setErrors(serverFieldErrors);
      setFormError(Object.keys(serverFieldErrors).length > 0 ? null : apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title={t.profile.personalInfo}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}
        <Input label={t.profile.email} value={user.email} helpText={t.profile.emailHelp} disabled readOnly />
        <div className={styles.row}>
          <Input
            label={t.profile.firstName}
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            errorText={errors.firstName}
            required
          />
          <Input
            label={t.profile.lastName}
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            errorText={errors.lastName}
            required
          />
        </div>
        <div className={styles.row}>
          <Input
            label={t.profile.phone}
            type="tel"
            autoComplete="tel"
            placeholder={t.profile.phonePlaceholder}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            errorText={errors.phone}
          />
          <Select
            label={t.profile.grade}
            placeholder={t.profile.gradePlaceholder}
            options={GRADE_OPTIONS}
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            errorText={errors.grade}
          />
        </div>
        <div className={styles.row}>
          <Input
            label={t.profile.school}
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            errorText={errors.school}
          />
          <Input
            label={t.profile.city}
            value={city}
            onChange={(event) => setCity(event.target.value)}
            errorText={errors.city}
          />
        </div>
        <div className={styles.actions}>
          <Button type="submit" loading={saving}>
            {t.profile.save}
          </Button>
        </div>
      </form>
    </Card>
  );
}
