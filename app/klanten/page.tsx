"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCustomers } from "@/app/hooks/use-customers";
import { deleteCustomer } from "@/app/lib/customer-storage";
import type { Customer } from "@/app/types/customer";

export default function KlantenPage() {
  const customers = useCustomers();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.company, customer.email, customer.phone, customer.city].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [customers, query]);

  function handleDelete(customer: Customer) {
    if (!window.confirm(`Weet u zeker dat u ${customer.name} wilt verwijderen?`)) return;
    if (deleteCustomer(customer.id)) {
      setMessage(`${customer.name} is verwijderd.`);
    }
  }

  return (
    <>
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-700">Klanten</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Uw klanten</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Beheer hier de gegevens van uw klanten.</p>
        </div>
        <Link className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2" href="/klanten/nieuw">Nieuwe klant</Link>
      </header>

      <section className="mt-8">
        {message && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{message}</p>}
        <label className="block max-w-md">
          <span className="sr-only">Zoek klanten</span>
          <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" onChange={(event) => setQuery(event.target.value)} placeholder="Zoek op naam, bedrijf, e-mail of plaats" type="search" value={query} />
        </label>

        {filteredCustomers.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">{customers.length === 0 ? "Nog geen klanten" : "Geen klanten gevonden"}</h2>
            <p className="mt-2 text-sm text-slate-600">{customers.length === 0 ? "Voeg uw eerste klant toe om te beginnen." : "Probeer een andere zoekterm."}</p>
            {customers.length === 0 && <Link className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white" href="/klanten/nieuw">Nieuwe klant</Link>}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-3 font-medium">Naam</th><th className="px-5 py-3 font-medium">Bedrijf</th><th className="px-5 py-3 font-medium">E-mail</th><th className="px-5 py-3 font-medium">Telefoon</th><th className="px-5 py-3 font-medium">Plaats</th><th className="px-5 py-3 text-right font-medium">Acties</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => (
                    <tr className="text-slate-700" key={customer.id}>
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-950">{customer.name}</td>
                      <td className="whitespace-nowrap px-5 py-4">{customer.company || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4">{customer.email}</td>
                      <td className="whitespace-nowrap px-5 py-4">{customer.phone || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4">{customer.city}</td>
                      <td className="whitespace-nowrap px-5 py-4"><div className="flex justify-end gap-3 text-sm font-medium"><Link className="text-blue-700 hover:text-blue-900" href={`/klanten/${customer.id}`}>Bekijken</Link><Link className="text-slate-700 hover:text-slate-950" href={`/klanten/${customer.id}/bewerken`}>Bewerken</Link><button className="text-red-700 hover:text-red-900" onClick={() => handleDelete(customer)} type="button">Verwijderen</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
