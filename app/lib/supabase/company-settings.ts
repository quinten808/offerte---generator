import type { CompanySettings } from "@/app/types/company-settings";
import { createClient } from "@/lib/supabase/client";

type CompanySettingsRow = {
  user_id: string;
  company_name: string;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  chamber_of_commerce: string | null;
  vat_number: string | null;
  iban: string | null;
  default_validity_days: number;
  default_payment_term_days: number;
  default_vat_percentage: 0 | 9 | 21;
  default_closing_text: string | null;
  terms: string | null;
  logo_data_url: string | null;
};

const columns = "user_id,company_name,owner_name,email,phone,website,street,house_number,postal_code,city,country,chamber_of_commerce,vat_number,iban,default_validity_days,default_payment_term_days,default_vat_percentage,default_closing_text,terms,logo_data_url";

function toSettings(row: CompanySettingsRow): CompanySettings {
  return {
    companyName: row.company_name,
    contactName: row.owner_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    website: row.website ?? "",
    street: row.street ?? "",
    houseNumber: row.house_number ?? "",
    postalCode: row.postal_code ?? "",
    city: row.city ?? "",
    country: row.country ?? "Nederland",
    chamberOfCommerce: row.chamber_of_commerce ?? "",
    vatNumber: row.vat_number ?? "",
    iban: row.iban ?? "",
    defaultValidityDays: row.default_validity_days,
    defaultPaymentTermDays: row.default_payment_term_days,
    defaultVatRate: row.default_vat_percentage,
    defaultClosingText: row.default_closing_text ?? "",
    terms: row.terms ?? "",
    logoDataUrl: row.logo_data_url,
  };
}

function toRow(settings: CompanySettings, userId: string) {
  return {
    user_id: userId,
    company_name: settings.companyName.trim(),
    owner_name: settings.contactName.trim() || null,
    email: settings.email.trim() || null,
    phone: settings.phone.trim() || null,
    website: settings.website.trim() || null,
    street: settings.street.trim() || null,
    house_number: settings.houseNumber.trim() || null,
    postal_code: settings.postalCode.trim() || null,
    city: settings.city.trim() || null,
    country: settings.country.trim() || "Nederland",
    chamber_of_commerce: settings.chamberOfCommerce.trim() || null,
    vat_number: settings.vatNumber.trim() || null,
    iban: settings.iban.trim() || null,
    default_validity_days: settings.defaultValidityDays,
    default_payment_term_days: settings.defaultPaymentTermDays,
    default_vat_percentage: settings.defaultVatRate,
    default_closing_text: settings.defaultClosingText.trim() || null,
    terms: settings.terms.trim() || null,
    logo_data_url: settings.logoDataUrl,
  };
}

async function currentUserId() {
  const { data, error } = await createClient().auth.getUser();
  if (error || !data.user) throw new Error("Uw sessie is verlopen. Log opnieuw in.");
  return data.user.id;
}

export async function getCompanySettings() {
  const userId = await currentUserId();
  const { data, error } = await createClient().from("company_settings").select(columns).eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Bedrijfsinstellingen laden is niet gelukt: ${error.message}`);
  return data ? toSettings(data as CompanySettingsRow) : undefined;
}

export async function saveCompanySettings(settings: CompanySettings) {
  const userId = await currentUserId();
  const { data, error } = await createClient().from("company_settings").upsert(toRow(settings, userId), { onConflict: "user_id" }).select(columns).single();
  if (error || !data) throw new Error(`Bedrijfsinstellingen opslaan is niet gelukt${error ? `: ${error.message}` : "."}`);
  return toSettings(data as CompanySettingsRow);
}

export async function deleteCompanySettings() {
  const userId = await currentUserId();
  const { error } = await createClient().from("company_settings").delete().eq("user_id", userId);
  if (error) throw new Error(`Bedrijfsinstellingen verwijderen is niet gelukt: ${error.message}`);
}
