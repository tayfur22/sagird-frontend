import { t } from "@/lib/i18n/t";

const EMPTY_VALUE = "—";

const dateFormatter = new Intl.DateTimeFormat("az-AZ", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formats an ISO instant as a human-readable date+time ("—" for null/invalid). */
export function formatPaymentDate(iso: string | null): string {
  if (!iso) return EMPTY_VALUE;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : dateFormatter.format(date);
}

const amountFormatterCache = new Map<string, Intl.NumberFormat>();

/** Formats an amount using the payment's own currency (e.g. "9.99 AZN"). */
export function formatAmount(amount: number, currency: string): string {
  let formatter = amountFormatterCache.get(currency);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat("az-AZ", { style: "currency", currency });
    } catch {
      // Intl doesn't recognize the currency code: fall back to a plain number + code.
      formatter = undefined;
    }
    if (formatter) amountFormatterCache.set(currency, formatter);
  }
  return formatter ? formatter.format(amount) : `${amount.toFixed(2)} ${currency}`;
}

export function providerLabel(provider: string | null): string {
  return provider ?? t.payment.providerUnknown;
}