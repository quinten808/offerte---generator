"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CustomerForm } from "@/app/components/customer-form";
import { getCustomerById, updateCustomer } from "@/app/lib/supabase/customers";
import type { Customer, CustomerInput } from "@/app/types/customer";

export default function KlantBewerkenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

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

  async function save(values: CustomerInput) {
    setSaveError("");
    try {
      const updated = await updateCustomer(id, values);
      if (!updated) {
        setSaveError("Klant niet gevonden of u heeft geen toegang.");
        return;
      }
      router.push(`/klanten/${updated.id}`);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Klant bijwerken is niet gelukt.");
    }
  }

  if (isLoading) return <p className="text-sm text-slate-500">Klant laden...</p>;
  if (error) return <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{error}</p><button className="mt-3 font-semibold underline" onClick={() => void loadCustomer()} type="button">Opnieuw proberen</button></section>;
  if (!customer) return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-semibold">Klant niet gevonden</h1><Link className="mt-4 inline-block text-blue-700" href="/klanten">Terug naar klanten</Link></section>;

  const initialValues: CustomerInput = { name: customer.name, company: customer.company, email: customer.email, phone: customer.phone, streetAndNumber: customer.streetAndNumber, postalCode: customer.postalCode, city: customer.city };
  return <section className="max-w-3xl"><Link className="text-sm font-medium text-blue-700" href={`/klanten/${id}`}>← Terug naar klant</Link><header className="mt-6 border-b border-slate-200 pb-6"><p className="text-sm font-medium text-blue-700">Klanten</p><h1 className="mt-2 text-3xl font-semibold">Klant bewerken</h1></header><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">{saveError && <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{saveError}</p>}<CustomerForm initialValues={initialValues} key={customer.id} onSubmit={save} submitLabel="Wijzigingen opslaan" /></div></section>;
}
