export const quoteStatuses = ["Concept", "Verzonden", "Geaccepteerd", "Afgewezen"] as const;
export const units = ["uur", "stuk", "m²", "meter", "dag", "vast bedrag"] as const;
export type QuoteStatus = (typeof quoteStatuses)[number];
export type Unit = (typeof units)[number];

export type QuoteItem = { id: string; description: string; quantity: number; unit: Unit; pricePerUnitCents: number; vatRate: 0 | 9 | 21 };
export type Quote = { id: string; number: string; customerId: string; title: string; date: string; validUntil: string; description: string; status: QuoteStatus; items: QuoteItem[]; remarks: string; paymentTermDays: number; terms: string; createdAt: string };
export type QuoteInput = Omit<Quote, "id" | "number" | "createdAt">;
