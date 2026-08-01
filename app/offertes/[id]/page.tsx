"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuotePdfButton } from "@/app/components/quote-pdf-button";
import { useQuotes } from "@/app/hooks/use-quotes";
import { formatCurrency, lineTotalCents, quoteTotals } from "@/app/lib/quote-calculations";
import { getCustomer } from "@/app/lib/customer-storage";
import { deleteQuote } from "@/app/lib/quote-storage";
import { getCustomerById } from "@/app/lib/supabase/customers";
import type { Customer } from "@/app/types/customer";

export default function OfferteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const quote = useQuotes().find((item) => item.id === id);
  const [customer, setCustomer] = useState<Customer>();
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);

  useEffect(() => {
    if (!quote) return;
    let isActive = true;
    const customerId = quote.customerId;

    async function loadCustomer() {
      let nextCustomer: Customer | undefined;
      try {
        nextCustomer = await getCustomerById(customerId);
      } catch {
        // Een lokale offerte mag ook zonder bereikbare Supabase-klant zichtbaar blijven.
      }
      if (!nextCustomer) nextCustomer = getCustomer(customerId);
      if (isActive) {
        setCustomer(nextCustomer);
        setIsLoadingCustomer(false);
      }
    }

    void loadCustomer();
    return () => {
      isActive = false;
    };
  }, [quote]);

  if (!quote) return <section className="rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-semibold">Offerte niet gevonden</h1><Link className="mt-4 inline-block text-blue-700" href="/offertes">Terug naar offertes</Link></section>;
  const totals = quoteTotals(quote.items);
  function remove() { if (quote && window.confirm(`Weet u zeker dat u ${quote.number} wilt verwijderen?`) && deleteQuote(quote.id)) router.push("/offertes"); }
  return <section className="max-w-4xl"><Link className="text-sm font-medium text-blue-700" href="/offertes">← Terug naar offertes</Link><header className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-6"><div><p className="text-sm font-medium text-blue-700">{quote.number} · {quote.status}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{quote.title}</h1></div><div className="flex flex-wrap gap-3">{isLoadingCustomer ? <span className="px-4 py-2.5 text-sm text-slate-500">Klant laden...</span> : <QuotePdfButton customer={customer} quote={quote} />}<Link className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold" href={`/offertes/${quote.id}/bewerken`}>Bewerken</Link><button className="rounded-lg px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={remove} type="button">Verwijderen</button></div></header><div className="mt-8 grid gap-6 md:grid-cols-3"><section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Klant</h2>{isLoadingCustomer ? <p className="mt-3 text-sm text-slate-500">Klant laden...</p> : customer ? <div className="mt-3 text-sm leading-6 text-slate-600"><p className="font-medium text-slate-950">{customer.name}</p><p>{customer.company}</p><p>{customer.streetAndNumber}</p><p>{customer.postalCode} {customer.city}</p><p>{customer.email}</p><p>{customer.phone}</p></div> : <p className="mt-3 text-sm text-slate-500">Klant niet meer beschikbaar.</p>}</section><section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2"><h2 className="font-semibold">Offertegegevens</h2><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Datum</dt><dd>{quote.date}</dd></div><div><dt className="text-slate-500">Geldig tot</dt><dd>{quote.validUntil}</dd></div><div><dt className="text-slate-500">Betalingstermijn</dt><dd>{quote.paymentTermDays} dagen</dd></div></dl>{quote.description && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">{quote.description}</p>}</section></div><section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[680px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Omschrijving</th><th className="px-5 py-3">Aantal</th><th className="px-5 py-3">Prijs</th><th className="px-5 py-3">Btw</th><th className="px-5 py-3 text-right">Totaal</th></tr></thead><tbody>{quote.items.map((item) => <tr className="border-t border-slate-100" key={item.id}><td className="px-5 py-4">{item.description || "—"}</td><td className="px-5 py-4">{item.quantity} {item.unit}</td><td className="px-5 py-4">{formatCurrency(item.pricePerUnitCents)}</td><td className="px-5 py-4">{item.vatRate}%</td><td className="px-5 py-4 text-right">{formatCurrency(lineTotalCents(item))}</td></tr>)}</tbody></table></div><div className="ml-auto max-w-sm space-y-2 border-t border-slate-200 p-5 text-sm"><div className="flex justify-between"><span>Subtotaal</span><span>{formatCurrency(totals.subtotalCents)}</span></div>{totals.vatByRate.filter((vat) => vat.cents > 0).map((vat) => <div className="flex justify-between" key={vat.rate}><span>Btw {vat.rate}%</span><span>{formatCurrency(vat.cents)}</span></div>)}<div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold"><span>Totaal</span><span>{formatCurrency(totals.totalCents)}</span></div></div></section>{(quote.remarks || quote.terms) && <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Extra gegevens</h2>{quote.remarks && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{quote.remarks}</p>}{quote.terms && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{quote.terms}</p>}</section>}</section>;
}
