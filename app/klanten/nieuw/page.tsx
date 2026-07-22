"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerForm } from "@/app/components/customer-form";
import { createCustomer } from "@/app/lib/customer-storage";
import type { CustomerInput } from "@/app/types/customer";

export default function NieuweKlantPage() {
  const router = useRouter();

  function handleSubmit(values: CustomerInput) {
    const customer = createCustomer(values);
    router.push(`/klanten/${customer.id}`);
  }

  return (
    <section className="max-w-3xl">
      <Link className="text-sm font-medium text-blue-700 hover:text-blue-900" href="/klanten">← Terug naar klanten</Link>
      <header className="mt-6 border-b border-slate-200 pb-6"><p className="text-sm font-medium text-blue-700">Klanten</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Nieuwe klant</h1><p className="mt-3 text-sm text-slate-600">Vul de gegevens van uw klant in.</p></header>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><CustomerForm onSubmit={handleSubmit} submitLabel="Klant opslaan" /></div>
    </section>
  );
}
