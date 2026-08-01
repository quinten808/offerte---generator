"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomerForm } from "@/app/components/customer-form";
import { createCustomer } from "@/app/lib/supabase/customers";
import type { CustomerInput } from "@/app/types/customer";
export default function NieuweKlantPage() { const router = useRouter(); const [error, setError] = useState(""); async function save(values: CustomerInput) { setError(""); try { const customer = await createCustomer(values); router.push(`/klanten/${customer.id}`); } catch (reason) { setError(reason instanceof Error ? reason.message : "Klant opslaan of tonen is niet gelukt."); } } return <section className="max-w-3xl"><Link className="text-sm font-medium text-blue-700" href="/klanten">← Terug naar klanten</Link><header className="mt-6 border-b border-slate-200 pb-6"><p className="text-sm font-medium text-blue-700">Klanten</p><h1 className="mt-2 text-3xl font-semibold">Nieuwe klant</h1></header><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">{error && <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<CustomerForm onSubmit={save} submitLabel="Klant opslaan" /></div></section>; }
