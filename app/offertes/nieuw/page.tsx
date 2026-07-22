"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuoteForm } from "@/app/components/quote-form";
import { createEmptyQuote } from "@/app/components/quote-form";
import { useCompanySettings } from "@/app/hooks/use-company-settings";
import { createQuote } from "@/app/lib/quote-storage";
import type { QuoteInput } from "@/app/types/quote";
export default function NieuweOffertePage() { const router = useRouter(); const settings = useCompanySettings(); const initialValues = createEmptyQuote(settings); function save(input: QuoteInput) { const quote = createQuote(input); router.push(`/offertes/${quote.id}`); } return <section className="max-w-4xl"><Link className="text-sm font-medium text-blue-700" href="/offertes">← Terug naar offertes</Link><header className="mt-6 border-b border-slate-200 pb-6"><p className="text-sm font-medium text-blue-700">Offertes</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Nieuwe offerte</h1><p className="mt-3 text-sm text-slate-600">Stel uw offerte samen en controleer de berekening.</p></header><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><QuoteForm initialValues={initialValues} key={`${settings.defaultValidityDays}-${settings.defaultPaymentTermDays}-${settings.defaultVatRate}-${settings.defaultClosingText}-${settings.terms}`} onSubmit={save} submitLabel="Offerte opslaan" /></div></section>; }
