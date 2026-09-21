/**
 * Client-side mirror of the backend rules (see StrongPassword on the
 * server). The server remains the authority; this only gives instant
 * feedback. Codes match the backend's so one translation table serves both.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export type PasswordIssue =
  | "PASSWORD_TOO_SHORT"
  | "PASSWORD_TOO_LONG"
  | "PASSWORD_NEEDS_LOWERCASE"
  | "PASSWORD_NEEDS_UPPERCASE"
  | "PASSWORD_NEEDS_DIGIT";

export function passwordIssues(password: string): PasswordIssue[] {
  const issues: PasswordIssue[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) issues.push("PASSWORD_TOO_SHORT");
  if (password.length > PASSWORD_MAX_LENGTH) issues.push("PASSWORD_TOO_LONG");
  if (!/\p{Ll}/u.test(password)) issues.push("PASSWORD_NEEDS_LOWERCASE");
  if (!/\p{Lu}/u.test(password)) issues.push("PASSWORD_NEEDS_UPPERCASE");
  if (!/\d/.test(password)) issues.push("PASSWORD_NEEDS_DIGIT");
  return issues;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const PHONE_PATTERN = /^\+?[0-9 ()-]{7,20}$/;

export function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone.trim());
}

/**
 * Only allow same-site relative redirects after login (prevents open
 * redirects via `?next=https://evil.example`).
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return null;
  }
  return next;
}

export function homePathForRole(role: "STUDENT" | "ADMIN"): string {
  return role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard";
}
