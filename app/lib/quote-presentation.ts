import type { Quote, QuoteStatus } from "@/app/types/quote";

const dateKey = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
export function quoteDeadlineState(quote: Pick<Quote, "status" | "validUntil">) {
  if (quote.status !== "Concept" && quote.status !== "Verzonden") return null;
  const deadline = new Date(`${quote.validUntil}T00:00:00`).getTime();
  const days = Math.round((deadline - dateKey()) / 86_400_000);
  if (days < 0) return "Verlopen" as const;
  if (days <= 7) return "Verloopt binnenkort" as const;
  return null;
}
export function statusClass(status: QuoteStatus) { return ({ Concept:"bg-slate-100 text-slate-700", Verzonden:"bg-blue-100 text-blue-800", Geaccepteerd:"bg-green-100 text-green-800", Afgewezen:"bg-red-100 text-red-800" })[status]; }
