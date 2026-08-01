import { createClient } from "@/lib/supabase/client";
import type { Customer, CustomerInput } from "@/app/types/customer";

type CustomerRow = { id: string; name: string; company_name: string | null; email: string; phone: string | null; street: string | null; house_number: string | null; postal_code: string | null; city: string | null; created_at: string };
const localImportKey = "offertegenerator.customers.supabase-imported.v1";
const splitAddress = (value: string) => { const match = value.trim().match(/^(.*?)(?:\s+(\d+\S*))?$/); return { street: match?.[1] || value.trim(), house_number: match?.[2] || null }; };
const toCustomer = (row: CustomerRow): Customer => ({ id: row.id, name: row.name, company: row.company_name ?? "", email: row.email, phone: row.phone ?? "", streetAndNumber: [row.street, row.house_number].filter(Boolean).join(" "), postalCode: row.postal_code ?? "", city: row.city ?? "", createdAt: row.created_at });
const toRow = (input: CustomerInput, userId: string) => { const address = splitAddress(input.streetAndNumber); return { user_id: userId, name: input.name.trim(), company_name: input.company.trim() || null, email: input.email.trim(), phone: input.phone.trim() || null, street: address.street || null, house_number: address.house_number, postal_code: input.postalCode.trim() || null, city: input.city.trim() || null }; };
async function currentUserId() { const { data, error } = await createClient().auth.getUser(); if (error || !data.user) throw new Error("Uw sessie is verlopen. Log opnieuw in."); return data.user.id; }
export async function listCustomers() {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), 10_000);
  const isDevelopment = process.env.NODE_ENV === "development";

  try {
    if (isDevelopment) console.debug("[customers] Supabase-lijst laden gestart");
    const { data, error } = await createClient()
      .from("customers")
      .select("id,name,company_name,email,phone,street,house_number,postal_code,city,created_at")
      .order("created_at", { ascending: false })
      .abortSignal(abortController.signal);

    if (error) throw new Error(`Klanten laden is niet gelukt: ${error.message}`);
    const customers = (data ?? []).map((row) => toCustomer(row as CustomerRow));
    if (isDevelopment) console.debug("[customers] Supabase-lijst laden voltooid", customers.length);
    return customers;
  } catch (reason) {
    if (abortController.signal.aborted) {
      throw new Error("Klanten laden duurt langer dan 10 seconden. Controleer uw internetverbinding en Supabase-configuratie.");
    }
    throw reason instanceof Error ? reason : new Error("Klanten laden is niet gelukt.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
export async function getCustomerById(id: string) { const { data, error } = await createClient().from("customers").select("id,name,company_name,email,phone,street,house_number,postal_code,city,created_at").eq("id", id).maybeSingle(); if (error) throw new Error("Klant laden is niet gelukt."); return data ? toCustomer(data as CustomerRow) : undefined; }
export async function createCustomer(input: CustomerInput) { const userId = await currentUserId(); const { data, error } = await createClient().from("customers").insert(toRow(input, userId)).select("id,name,company_name,email,phone,street,house_number,postal_code,city,created_at").single(); if (error || !data) throw new Error("Klant opslaan is niet gelukt."); return toCustomer(data as CustomerRow); }
export async function updateCustomer(id: string, input: CustomerInput) { const userId = await currentUserId(); const { data, error } = await createClient().from("customers").update(toRow(input, userId)).eq("id", id).select("id,name,company_name,email,phone,street,house_number,postal_code,city,created_at").maybeSingle(); if (error) throw new Error("Klant bijwerken is niet gelukt."); return data ? toCustomer(data as CustomerRow) : undefined; }
export async function deleteCustomer(id: string) { const { error } = await createClient().from("customers").delete().eq("id", id); if (error) throw new Error("Klant verwijderen is niet gelukt."); }
export function getImportedLocalCustomerIds() { try { return new Set<string>(JSON.parse(window.localStorage.getItem(localImportKey) ?? "[]")); } catch { return new Set<string>(); } }
export async function importLocalCustomers(customers: Customer[]) { const userId = await currentUserId(); const importedIds = getImportedLocalCustomerIds(); const seen = new Set<string>(); const candidates = customers.filter((customer) => { const key = `${customer.email.toLowerCase()}|${customer.name.toLowerCase()}`; if (importedIds.has(customer.id) || seen.has(key)) return false; seen.add(key); return true; }); if (!candidates.length) return 0; const { error } = await createClient().from("customers").insert(candidates.map((customer) => toRow(customer, userId))); if (error) throw new Error("Lokale klanten importeren is niet gelukt."); window.localStorage.setItem(localImportKey, JSON.stringify([...importedIds, ...candidates.map((customer) => customer.id)])); return candidates.length; }
