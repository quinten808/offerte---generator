"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCustomers } from "@/app/hooks/use-customers";

export default function KlantDetailPage() {
  const params = useParams<{ id: string }>();
  const customers = useCustomers();
  const customer = customers.find(({ id }) => id === params.id);

  if (!customer) return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-semibold text-slate-950">Klant niet gevonden</h1><Link className="mt-4 inline-block text-sm font-medium text-blue-700" href="/klanten">Terug naar klanten</Link></section>;

  const details = [["Naam", customer.name], ["Bedrijfsnaam", customer.company || "—"], ["E-mail", customer.email], ["Telefoon", customer.phone || "—"], ["Adres", customer.streetAndNumber], ["Postcode en plaats", `${customer.postalCode} ${customer.city}`]];
  return <section className="max-w-3xl"><Link className="text-sm font-medium text-blue-700 hover:text-blue-900" href="/klanten">← Terug naar klanten</Link><header className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-blue-700">Klant</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{customer.name}</h1></div><Link className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50" href={`/klanten/${customer.id}/bewerken`}>Bewerken</Link></header><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><dl className="grid gap-5 sm:grid-cols-2">{details.map(([label, value]) => <div key={label}><dt className="text-sm font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-950">{value}</dd></div>)}</dl></div><Link className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800" href="/offertes">Nieuwe offerte voor deze klant</Link></section>;
}
