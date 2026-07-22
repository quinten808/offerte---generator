import type { QuoteItem } from "@/app/types/quote";

export function formatCurrency(cents: number) { return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100); }
export function lineTotalCents(item: QuoteItem) { return Math.round(item.quantity * item.pricePerUnitCents); }
export function quoteTotals(items: QuoteItem[]) {
  const subtotalCents = items.reduce((sum, item) => sum + lineTotalCents(item), 0);
  const vatByRate = ([0, 9, 21] as const).map((rate) => ({ rate, cents: items.filter((item) => item.vatRate === rate).reduce((sum, item) => sum + Math.round(lineTotalCents(item) * rate / 100), 0) }));
  const vatCents = vatByRate.reduce((sum, vat) => sum + vat.cents, 0);
  return { subtotalCents, vatByRate, vatCents, totalCents: subtotalCents + vatCents };
}
export function parseEuroToCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized || !/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}
export function centsToEuro(cents: number) { return (cents / 100).toFixed(2).replace(".", ","); }
