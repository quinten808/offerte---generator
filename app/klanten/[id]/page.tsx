"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { deleteCustomer, getCustomerById } from "@/app/lib/supabase/customers";
import type { Customer } from "@/app/types/customer";

export default function KlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCustomer = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setCustomer(await getCustomerById(id));
    } catch (reason) {
      setCustomer(undefined);
      setError(reason instanceof Error ? reason.message : "Klant laden is niet gelukt.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialCustomer() {
      try {
        const nextCustomer = await getCustomerById(id);
        if (isActive) setCustomer(nextCustomer);
      } catch (reason) {
        if (isActive) {
          setCustomer(undefined);
          setError(reason instanceof Error ? reason.message : "Klant laden is niet gelukt.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadInitialCustomer();
    return () => {
      isActive = false;
    };
  }, [id]);

  async function removeCustomer() {
    if (!customer || !window.confirm(`Weet u zeker dat u ${customer.name} wilt verwijderen?`)) return;
    setIsDeleting(true);
    setActionError("");
    try {
      await deleteCustomer(customer.id);
      router.push("/klanten");
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Klant verwijderen is niet gelukt.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <p className="text-sm text-slate-500">Klant laden...</p>;
  if (error) return <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{error}</p><button className="mt-3 font-semibold underline" onClick={() => void loadCustomer()} type="button">Opnieuw proberen</button></section>;
  if (!customer) return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-semibold">Klant niet gevonden</h1><Link className="mt-4 inline-block text-blue-700" href="/klanten">Terug naar klanten</Link></section>;

  const details = [["Naam", customer.name], ["Bedrijfsnaam", customer.company || "—"], ["E-mail", customer.email], ["Telefoon", customer.phone || "—"], ["Adres", customer.streetAndNumber], ["Postcode en plaats", `${customer.postalCode} ${customer.city}`]];
  return <section className="max-w-3xl"><Link className="text-sm font-medium text-blue-700" href="/klanten">← Terug naar klanten</Link><header className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-blue-700">Klant</p><h1 className="mt-2 text-3xl font-semibold">{customer.name}</h1></div><div className="flex gap-3"><Link className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold" href={`/klanten/${customer.id}/bewerken`}>Bewerken</Link><button className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60" disabled={isDeleting} onClick={() => void removeCustomer()} type="button">{isDeleting ? "Verwijderen..." : "Verwijderen"}</button></div></header>{actionError && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{actionError}</p>}<div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><dl className="grid gap-5 sm:grid-cols-2">{details.map(([label, value]) => <div key={label}><dt className="text-sm font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm">{value}</dd></div>)}</dl></div><Link className="mt-6 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white" href="/offertes">Nieuwe offerte voor deze klant</Link></section>;
}
