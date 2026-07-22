import type { Quote, QuoteInput } from "@/app/types/quote";

const storageKey = "offertegenerator.quotes.v1";
const serverQuotes: Quote[] = [];
const invalidQuotes: Quote[] = [];
let cachedQuotes: Quote[] | null = null;
let cachedStorageValue: string | null | undefined;
const isBrowser = () => typeof window !== "undefined";

function writeQuotes(quotes: Quote[]) { if (isBrowser()) { const value = JSON.stringify(quotes); cachedQuotes = quotes; cachedStorageValue = value; window.localStorage.setItem(storageKey, value); window.dispatchEvent(new Event("quotes-changed")); } }
export function getServerQuotes() { return serverQuotes; }
export function getQuotes(): Quote[] {
  if (!isBrowser()) return serverQuotes;
  const value = window.localStorage.getItem(storageKey);
  if (value === cachedStorageValue && cachedQuotes !== null) return cachedQuotes;
  if (value === null) { cachedStorageValue = null; cachedQuotes = serverQuotes; return serverQuotes; }
  try { const parsed: unknown = JSON.parse(value); cachedStorageValue = value; cachedQuotes = Array.isArray(parsed) ? (parsed as Quote[]) : invalidQuotes; return cachedQuotes; }
  catch { cachedStorageValue = value; cachedQuotes = invalidQuotes; return cachedQuotes; }
}
export function subscribeToQuotes(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === storageKey) callback(); };
  window.addEventListener("quotes-changed", callback); window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener("quotes-changed", callback); window.removeEventListener("storage", onStorage); };
}
function newId() { return window.crypto?.randomUUID?.() ?? `offerte-${Date.now()}`; }
function nextNumber(quotes: Quote[]) { const year = new Date().getFullYear(); const prefix = `OFF-${year}-`; const used = new Set(quotes.map((quote) => quote.number)); let sequence = Math.max(0, ...quotes.filter((quote) => quote.number.startsWith(prefix)).map((quote) => Number.parseInt(quote.number.slice(prefix.length), 10) || 0)) + 1; let number = `${prefix}${String(sequence).padStart(4, "0")}`; while (used.has(number)) { sequence += 1; number = `${prefix}${String(sequence).padStart(4, "0")}`; } return number; }
export function createQuote(input: QuoteInput) { const quotes = getQuotes(); const quote: Quote = { ...input, id: newId(), number: nextNumber(quotes), createdAt: new Date().toISOString() }; writeQuotes([...quotes, quote]); return quote; }
export function getQuote(id: string) { return getQuotes().find((quote) => quote.id === id); }
export function updateQuote(id: string, input: QuoteInput) { const quotes = getQuotes(); const existing = quotes.find((quote) => quote.id === id); if (!existing) return undefined; const quote = { ...existing, ...input }; writeQuotes(quotes.map((item) => item.id === id ? quote : item)); return quote; }
export function deleteQuote(id: string) { const quotes = getQuotes(); const remaining = quotes.filter((quote) => quote.id !== id); if (remaining.length === quotes.length) return false; writeQuotes(remaining); return true; }
