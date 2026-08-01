"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { QuoteForm } from "@/app/components/quote-form";
import { getQuoteById, updateQuote } from "@/app/lib/supabase/quotes";
import type { Quote, QuoteInput } from "@/app/types/quote";

function toInput(quote: Quote): QuoteInput {
  return { customerId: quote.customerId, title: quote.title, date: quote.date, validUntil: quote.validUntil, description: quote.description, status: quote.status, items: quote.items, remarks: quote.remarks, paymentTermDays: quote.paymentTermDays, terms: quote.terms };
}

export default function OfferteBewerkenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuote = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try { setQuote(await getQuoteById(id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Offerte laden is niet gelukt."); }
    finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialQuote() {
      try {
        const nextQuote = await getQuoteById(id);
        if (isActive) setQuote(nextQuote);
      } catch (reason) {
        if (isActive) setError(reason instanceof Error ? reason.message : "Offerte laden is niet gelukt.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadInitialQuote();
    return () => { isActive = false; };
  }, [id]);

  async function save(input: QuoteInput) {
    try {
      await updateQuote(id, input);
      router.push(`/offertes/${id}`);
    } catch (reason) {
      throw new Error(reason instanceof Error ? reason.message : "Offerte opslaan is niet gelukt.");
    }
  }

  if (isLoading) return <p className="text-sm text-slate-500">Offerte laden...</p>;
  if (error) return <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{error}</p><button className="mt-3 underline" onClick={() => void loadQuote()} type="button">Opnieuw proberen</button></section>;
  if (!quote) return <section className="rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-semibold">Offerte niet gevonden</h1><Link className="mt-4 inline-block text-blue-700" href="/offertes">Terug naar offertes</Link></section>;

  return <section className="max-w-4xl"><Link className="text-sm font-medium text-blue-700" href={`/offertes/${id}`}>← Terug naar offerte</Link><header className="mt-6 border-b border-slate-200 pb-6"><p className="text-sm font-medium text-blue-700">{quote.number}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Offerte bewerken</h1></header><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><QuoteForm initialValues={toInput(quote)} onSubmit={save} submitLabel="Wijzigingen opslaan" /></div></section>;
}
