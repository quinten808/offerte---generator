"use client";

import Link from "next/link";
import { useCompanySettings } from "@/app/hooks/use-company-settings";
import { useCompanyLogoUrl } from "@/app/hooks/use-company-logo-url";
import { useSupabaseCustomers } from "@/app/hooks/use-supabase-customers";
import { useSupabaseQuotes } from "@/app/hooks/use-supabase-quotes";

export default function DashboardPage() {
  const { customers, isLoading: isLoadingCustomers } = useSupabaseCustomers();
  const { quotes, isLoading: isLoadingQuotes } = useSupabaseQuotes();
  const { settings } = useCompanySettings();
  const { url: logoUrl } = useCompanyLogoUrl(settings);
  const cards = [
    { label: "Klanten", value: isLoadingCustomers ? "—" : customers.length, description: "klanten in uw overzicht" },
    { label: "Offertes", value: isLoadingQuotes ? "—" : quotes.length, description: "opgeslagen offertes" },
    { label: "Concepten", value: isLoadingQuotes ? "—" : quotes.filter((quote) => quote.status === "Concept").length, description: "klaar om af te ronden" },
  ];

  return <><header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between"><div className="flex items-start gap-4">{logoUrl && <img /* eslint-disable-line @next/next/no-img-element -- private signed Storage URL */ alt="Bedrijfslogo" className="max-h-14 max-w-28 rounded border border-slate-200 bg-white p-1 object-contain" src={logoUrl} />}<div><p className="mb-2 text-sm font-medium text-blue-700">Dashboard</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Welkom bij {settings.companyName || "je offertegenerator"}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Hier vindt u in één oogopslag de voortgang van uw klanten en offertes.</p>{!settings.companyName && <Link className="mt-2 inline-block text-sm font-medium text-blue-700" href="/instellingen">Bedrijfsgegevens instellen</Link>}</div></div><Link className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800" href="/offertes/nieuw">Nieuwe offerte</Link></header><section aria-label="Overzicht" className="mt-8 grid gap-4 sm:grid-cols-3">{cards.map((card) => <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={card.label}><p className="text-sm font-medium text-slate-600">{card.label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p><p className="mt-2 text-sm text-slate-500">{card.description}</p></article>)}</section></>;
}
