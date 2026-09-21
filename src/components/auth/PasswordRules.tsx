import { t } from "@/lib/i18n/t";
import { PASSWORD_MIN_LENGTH, passwordIssues } from "@/lib/auth/validation";
import { cn } from "@/lib/utils/cn";
import styles from "./AuthForms.module.css";

/** Live checklist of the password policy, so users see what is still missing. */
export function PasswordRules({ password }: { password: string }) {
  const issues = passwordIssues(password);
  const rules = [
    { key: "minLength", label: t.auth.passwordRules.minLength, met: password.length >= PASSWORD_MIN_LENGTH },
    { key: "lowercase", label: t.auth.passwordRules.lowercase, met: !issues.includes("PASSWORD_NEEDS_LOWERCASE") },
    { key: "uppercase", label: t.auth.passwordRules.uppercase, met: !issues.includes("PASSWORD_NEEDS_UPPERCASE") },
    { key: "digit", label: t.auth.passwordRules.digit, met: !issues.includes("PASSWORD_NEEDS_DIGIT") },
  ];

  return (
    <div>
      <div className={styles.rulesTitle}>{t.auth.passwordRules.title}</div>
      <ul className={styles.rules}>
        {rules.map((rule) => (
          <li key={rule.key} className={cn(styles.rule, rule.met && styles.ruleMet)} data-met={rule.met}>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
