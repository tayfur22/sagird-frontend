/**
 * Server-authoritative countdown helpers. `expiresAt` always comes from the
 * backend; nothing here invents or persists timing on the client. `serverTime`
 * (also backend-supplied, from the same response) lets the visual countdown
 * correct for clock drift between the browser and the server without ever
 * trusting the browser's own clock as a source of truth.
 */

/** Remaining time, in whole seconds, clamped to 0 - never negative. */
export function remainingSeconds(expiresAt: string, referenceNow: number): number {
  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return 0;
  return Math.max(0, Math.round((expiresMs - referenceNow) / 1000));
}

/**
 * Offset (ms) to add to `Date.now()` so it reads as the server's clock,
 * computed once from a response's own `serverTime` field.
 */
export function clockOffsetFrom(serverTime: string): number {
  const serverMs = new Date(serverTime).getTime();
  if (Number.isNaN(serverMs)) return 0;
  return serverMs - Date.now();
}

export type TimerUrgency = "normal" | "warning" | "critical" | "expired";

const WARNING_THRESHOLD_SECONDS = 5 * 60;
const CRITICAL_THRESHOLD_SECONDS = 60;

export function timerUrgency(seconds: number): TimerUrgency {
  if (seconds <= 0) return "expired";
  if (seconds <= CRITICAL_THRESHOLD_SECONDS) return "critical";
  if (seconds <= WARNING_THRESHOLD_SECONDS) return "warning";
  return "normal";
}

/** "mm:ss" for under an hour, "h:mm:ss" beyond that. */
export function formatRemaining(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}
