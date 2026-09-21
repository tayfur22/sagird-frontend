/**
 * Minimal, dependency-free classnames joiner. Falsy values are skipped.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
