"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CustomerForm } from "@/app/components/customer-form";
import { useCustomers } from "@/app/hooks/use-customers";
import { updateCustomer } from "@/app/lib/customer-storage";
import type { CustomerInput } from "@/app/types/customer";

export default function KlantBewerkenPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customers = useCustomers();
  const customer = customers.find(({ id }) => id === params.id);
  function handleSubmit(values: CustomerInput) { if (updateCustomer(params.id, values)) router.push(`/klanten/${params.id}`); }

  if (!customer) return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-semibold text-slate-950">Klant niet gevonden</h1><Link className="mt-4 inline-block text-sm font-medium text-blue-700" href="/klanten">Terug naar klanten</Link></section>;

  const initialValues = { name: customer.name, company: customer.company, email: customer.email, phone: customer.phone, streetAndNumber: customer.streetAndNumber, postalCode: customer.postalCode, city: customer.city };
  return <section className="max-w-3xl"><Link className="text-sm font-medium text-blue-700 hover:text-blue-900" href={`/klanten/${customer.id}`}>← Terug naar klant</Link><header className="mt-6 border-b border-slate-200 pb-6"><p className="text-sm font-medium text-blue-700">Klanten</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Klant bewerken</h1><p className="mt-3 text-sm text-slate-600">Pas de gegevens van {customer.name} aan.</p></header><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><CustomerForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Wijzigingen opslaan" /></div></section>;
}
