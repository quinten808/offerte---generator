"use client";

import Link from "next/link";
import { useState } from "react";
import { useSupabaseQuotes } from "@/app/hooks/use-supabase-quotes";
import { formatCurrency, quoteTotals } from "@/app/lib/quote-calculations";
import { deleteQuote } from "@/app/lib/supabase/quotes";

export default function OffertesPage() {
  const { quotes, isLoading, error, refresh } = useSupabaseQuotes();
  const [message, setMessage] = useState("");

  async function remove(id: string, number: string) {
    if (!window.confirm(`Weet u zeker dat u offerte ${number} wilt verwijderen?`)) return;

    try {
      await deleteQuote(id);
      setMessage(`Offerte ${number} is verwijderd.`);
      await refresh();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Offerte verwijderen is niet gelukt.");
    }
  }

  return (
    <>
      <header className="flex items-end justify-between border-b border-slate-200 pb-7">
        <div>
          <p className="text-sm font-medium text-blue-700">Offertes</p>
          <h1 className="mt-2 text-3xl font-semibold">Uw offertes</h1>
        </div>
        <Link className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white" href="/offertes/nieuw">
          Nieuwe offerte
        </Link>
      </header>

      {message && <p className="mt-5 rounded border p-3 text-sm">{message}</p>}

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500">Offertes laden...</p>
      ) : error ? (
        <div className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>{error}</p>
          <button className="mt-3 underline" onClick={() => void refresh()} type="button">Opnieuw proberen</button>
        </div>
      ) : quotes.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Nog geen offertes. Maak uw eerste offerte aan.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-[700px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Nummer</th><th className="px-4 py-3">Titel</th><th className="px-4 py-3">Datum</th><th className="px-4 py-3">Totaal</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr className="border-t" key={quote.id}>
                  <td className="px-4 py-3">{quote.number}</td><td className="px-4 py-3">{quote.title}</td><td className="px-4 py-3">{quote.date}</td><td className="px-4 py-3">{formatCurrency(quoteTotals(quote.items).totalCents)}</td><td className="px-4 py-3">{quote.status}</td>
                  <td className="px-4 py-3 text-right"><Link className="text-blue-700" href={`/offertes/${quote.id}`}>Bekijken</Link><button className="ml-3 text-red-700" onClick={() => void remove(quote.id, quote.number)} type="button">Verwijderen</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
