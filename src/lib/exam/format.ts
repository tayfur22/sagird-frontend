import { t } from "@/lib/i18n/t";

const EMPTY_VALUE = "—";

const dateTimeFormatter = new Intl.DateTimeFormat("az-AZ", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formats an ISO instant as a human-readable date+time ("—" for null/invalid). */
export function formatExamDateTime(iso: string | null): string {
  if (!iso) return EMPTY_VALUE;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : dateTimeFormatter.format(date);
}

const priceFormatterCache = new Map<string, Intl.NumberFormat>();

/** Formats a price using the exam's own currency (e.g. "9.99 AZN"). */
export function formatExamPrice(price: number, currency: string): string {
  let formatter = priceFormatterCache.get(currency);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat("az-AZ", { style: "currency", currency });
    } catch {
      // Intl doesn't recognize the currency code: fall back to a plain number + code.
      formatter = undefined;
    }
    if (formatter) priceFormatterCache.set(currency, formatter);
  }
  return formatter ? formatter.format(price) : `${price.toFixed(2)} ${currency}`;
}

/** Human-readable duration, e.g. "90 dəqiqə". */
export function formatDurationMinutes(minutes: number): string {
  return t.exam.detail.durationValue.replace("{minutes}", String(minutes));
}

/** ISO instant -> value for an <input type="datetime-local"> (local time, no timezone/seconds). */
export function toDateTimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** <input type="datetime-local"> value -> ISO instant, or null for an empty/invalid value. */
export function fromDateTimeLocalValue(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
