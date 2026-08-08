"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuoteForm, createEmptyQuote } from "@/app/components/quote-form";
import { useCompanySettings } from "@/app/hooks/use-company-settings";
import { createQuote } from "@/app/lib/supabase/quotes";
import type { QuoteInput } from "@/app/types/quote";

function NieuweOfferteForm(){const router=useRouter();const params=useSearchParams();const {settings,isLoading,error,refresh}=useCompanySettings();const [saveError,setSaveError]=useState("");const initial={...createEmptyQuote(settings),customerId:params.get("customerId")??""};async function save(input:QuoteInput){setSaveError("");try{const quote=await createQuote(input);router.push(`/offertes/${quote.id}`);}catch(reason){setSaveError(reason instanceof Error?reason.message:"Offerte opslaan is niet gelukt.");throw reason;}}return <section className="max-w-4xl"><Link className="text-sm font-medium text-blue-700" href="/offertes">← Terug naar offertes</Link><header className="mt-6 border-b border-slate-200 pb-6"><p className="text-sm font-medium text-blue-700">Offertes</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Nieuwe offerte</h1></header><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">{saveError&&<p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{saveError}</p>}{isLoading?<p className="text-sm text-slate-500">Bedrijfsinstellingen laden...</p>:error?<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p><button className="mt-3 font-semibold underline" onClick={()=>void refresh()} type="button">Opnieuw proberen</button></div>:<QuoteForm initialValues={initial} key={`${params.get("customerId")}-${settings.defaultValidityDays}-${settings.defaultPaymentTermDays}-${settings.defaultVatRate}`} onSubmit={save} submitLabel="Offerte opslaan" />}</div></section>;}
export default function NieuweOffertePage(){return <Suspense fallback={<p className="text-sm text-slate-500">Offerteformulier laden...</p>}><NieuweOfferteForm /></Suspense>;}
