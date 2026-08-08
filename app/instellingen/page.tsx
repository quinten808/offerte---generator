"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useCompanyLogoUrl } from "@/app/hooks/use-company-logo-url";
import { useCompanySettings } from "@/app/hooks/use-company-settings";
import { deleteCompanyLogo, saveCompanySettings, uploadCompanyLogo } from "@/app/lib/supabase/company-settings";
import type { CompanySettings } from "@/app/types/company-settings";

const inputClass = "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100";
const labelClass = "text-sm font-medium text-slate-700";
const acceptedLogoTypes = ["image/png", "image/jpeg", "image/webp"];

function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Het logo kon niet worden gelezen."));
    reader.onerror = () => reject(new Error("Het logo kon niet worden gelezen."));
    reader.readAsDataURL(file);
  });
}

function SettingsForm({ initialSettings, onSave }: { initialSettings: CompanySettings; onSave: (settings: CompanySettings) => Promise<CompanySettings> }) {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [pendingLogo, setPendingLogo] = useState<File>();
  const [localPreview, setLocalPreview] = useState<string>();
  const { url: storedLogoUrl, error: logoLoadError } = useCompanyLogoUrl(settings.logoPath);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoError, setLogoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);
  const submitLock = useRef(false);
  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings) || Boolean(pendingLogo);
  const previewUrl = localPreview ?? storedLogoUrl;

  const update = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage("");
  };

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!settings.companyName.trim()) nextErrors.companyName = "Vul de bedrijfsnaam in.";
    if (settings.email && !/^\S+@\S+\.\S+$/.test(settings.email)) nextErrors.email = "Vul een geldig e-mailadres in.";
    if (!Number.isInteger(settings.defaultValidityDays) || settings.defaultValidityDays < 1) nextErrors.defaultValidityDays = "Vul een positief geheel getal in.";
    if (!Number.isInteger(settings.defaultPaymentTermDays) || settings.defaultPaymentTermDays < 1) nextErrors.defaultPaymentTermDays = "Vul een positief geheel getal in.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || submitLock.current || !validate()) return;
    submitLock.current = true;
    setIsSubmitting(true);
    setMessage("");
    try {
      let nextSettings = { ...settings, companyName: settings.companyName.trim(), email: settings.email.trim() };
      const previousPath = savedSettings.logoPath;
      if (pendingLogo) {
        const path = await uploadCompanyLogo(pendingLogo);
        nextSettings = { ...nextSettings, logoPath: path };
      }
      const saved = await onSave(nextSettings);
      let cleanupFailed = false;
      if (pendingLogo && previousPath && previousPath !== saved.logoPath) {
        try { await deleteCompanyLogo(previousPath); } catch { cleanupFailed = true; }
      }
      setSettings(saved);
      setSavedSettings(saved);
      setPendingLogo(undefined);
      setLocalPreview(undefined);
      setMessage(cleanupFailed ? "Instellingen zijn opgeslagen, maar het vorige logo kon niet worden verwijderd." : "Instellingen zijn opgeslagen.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Bedrijfsinstellingen opslaan is niet gelukt.");
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }

  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!acceptedLogoTypes.includes(file.type)) { setLogoError("Kies een PNG-, JPG-, JPEG- of WEBP-bestand."); return; }
    if (file.size > 1024 * 1024) { setLogoError("Het logo mag maximaal 1 MB groot zijn."); return; }
    try {
      setPendingLogo(file);
      setLocalPreview(await fileToDataUrl(file));
      setLogoError("");
      setMessage("");
    } catch (reason) { setLogoError(reason instanceof Error ? reason.message : "Het logo kon niet worden gelezen."); }
  }

  async function removeLogo() {
    if ((!settings.logoPath && !pendingLogo) || !window.confirm("Weet u zeker dat u het logo wilt verwijderen?")) return;
    setIsRemovingLogo(true);
    setLogoError("");
    try {
      if (settings.logoPath) await deleteCompanyLogo(settings.logoPath);
      const saved = await onSave({ ...settings, logoPath: null });
      setSettings(saved);
      setSavedSettings(saved);
      setPendingLogo(undefined);
      setLocalPreview(undefined);
      setMessage("Logo is verwijderd.");
    } catch (reason) { setLogoError(reason instanceof Error ? reason.message : "Logo verwijderen is niet gelukt."); }
    finally { setIsRemovingLogo(false); }
  }

  return <form className="space-y-8" noValidate onSubmit={save}>
    {message && <p className={`rounded-lg border px-4 py-3 text-sm ${message.includes("opgeslagen") || message.includes("verplaatst") || message === "Logo is verwijderd." ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`} role="status">{message}</p>}
    <section><h2 className="text-lg font-semibold">Bedrijfsgegevens</h2><div className="mt-4 grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className={labelClass}>Bedrijfsnaam <span className="text-red-600">*</span></span><input aria-invalid={Boolean(errors.companyName)} className={inputClass} onChange={(event) => update("companyName", event.target.value)} value={settings.companyName} />{errors.companyName && <p className="mt-1 text-sm text-red-700">{errors.companyName}</p>}</label><label><span className={labelClass}>Naam eigenaar/contactpersoon</span><input className={inputClass} onChange={(event) => update("contactName", event.target.value)} value={settings.contactName} /></label><label><span className={labelClass}>E-mailadres</span><input aria-invalid={Boolean(errors.email)} className={inputClass} onChange={(event) => update("email", event.target.value)} type="email" value={settings.email} />{errors.email && <p className="mt-1 text-sm text-red-700">{errors.email}</p>}</label><label><span className={labelClass}>Telefoonnummer</span><input className={inputClass} onChange={(event) => update("phone", event.target.value)} type="tel" value={settings.phone} /></label><label><span className={labelClass}>Website <span className="text-slate-400">(optioneel)</span></span><input className={inputClass} onChange={(event) => update("website", event.target.value)} placeholder="https://" type="url" value={settings.website} /></label></div></section>
    <section><h2 className="text-lg font-semibold">Adresgegevens</h2><div className="mt-4 grid gap-5 sm:grid-cols-2"><label><span className={labelClass}>Straat</span><input className={inputClass} onChange={(event) => update("street", event.target.value)} value={settings.street} /></label><label><span className={labelClass}>Huisnummer</span><input className={inputClass} onChange={(event) => update("houseNumber", event.target.value)} value={settings.houseNumber} /></label><label><span className={labelClass}>Postcode</span><input className={inputClass} onChange={(event) => update("postalCode", event.target.value)} value={settings.postalCode} /></label><label><span className={labelClass}>Plaats</span><input className={inputClass} onChange={(event) => update("city", event.target.value)} value={settings.city} /></label><label><span className={labelClass}>Land</span><input className={inputClass} onChange={(event) => update("country", event.target.value)} value={settings.country} /></label></div></section>
    <section><h2 className="text-lg font-semibold">Administratieve gegevens</h2><div className="mt-4 grid gap-5 sm:grid-cols-3"><label><span className={labelClass}>KvK-nummer</span><input className={inputClass} onChange={(event) => update("chamberOfCommerce", event.target.value)} value={settings.chamberOfCommerce} /></label><label><span className={labelClass}>Btw-nummer</span><input className={inputClass} onChange={(event) => update("vatNumber", event.target.value)} value={settings.vatNumber} /></label><label><span className={labelClass}>IBAN</span><input className={inputClass} onChange={(event) => update("iban", event.target.value)} value={settings.iban} /></label></div></section>
    <section><h2 className="text-lg font-semibold">Offerte-instellingen</h2><div className="mt-4 grid gap-5 sm:grid-cols-2"><label><span className={labelClass}>Standaard geldigheidsduur (dagen)</span><input aria-invalid={Boolean(errors.defaultValidityDays)} className={inputClass} min="1" onChange={(event) => update("defaultValidityDays", Number(event.target.value))} type="number" value={settings.defaultValidityDays} />{errors.defaultValidityDays && <p className="mt-1 text-sm text-red-700">{errors.defaultValidityDays}</p>}</label><label><span className={labelClass}>Standaard betalingstermijn (dagen)</span><input aria-invalid={Boolean(errors.defaultPaymentTermDays)} className={inputClass} min="1" onChange={(event) => update("defaultPaymentTermDays", Number(event.target.value))} type="number" value={settings.defaultPaymentTermDays} />{errors.defaultPaymentTermDays && <p className="mt-1 text-sm text-red-700">{errors.defaultPaymentTermDays}</p>}</label><label><span className={labelClass}>Standaard btw-percentage</span><select className={inputClass} onChange={(event) => update("defaultVatRate", Number(event.target.value) as CompanySettings["defaultVatRate"])} value={settings.defaultVatRate}><option value={0}>0%</option><option value={9}>9%</option><option value={21}>21%</option></select></label><label className="sm:col-span-2"><span className={labelClass}>Standaard slottekst</span><textarea className={inputClass} onChange={(event) => update("defaultClosingText", event.target.value)} rows={3} value={settings.defaultClosingText} /></label><label className="sm:col-span-2"><span className={labelClass}>Algemene of aanvullende voorwaarden</span><textarea className={inputClass} onChange={(event) => update("terms", event.target.value)} rows={4} value={settings.terms} /></label></div></section>
    <section><h2 className="text-lg font-semibold">Huisstijl</h2><div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm text-slate-600">Upload een PNG, JPG, JPEG of WEBP van maximaal 1 MB.</p><input accept="image/png,image/jpeg,image/webp" className="mt-4 block text-sm" disabled={isSubmitting} onChange={(event) => void uploadLogo(event)} type="file" />{logoError && <p className="mt-2 text-sm text-red-700">{logoError}</p>}{logoLoadError && !localPreview && <p className="mt-2 text-sm text-amber-800">{logoLoadError} De pagina blijft zonder logo bruikbaar.</p>}{previewUrl && <div className="mt-5"><img /* eslint-disable-line @next/next/no-img-element -- private signed Storage URL */ alt="Logo-preview" className="max-h-32 max-w-xs rounded-lg border border-slate-200 bg-white p-2" src={previewUrl} /><button className="mt-3 block text-sm font-medium text-red-700 disabled:opacity-60" disabled={isRemovingLogo || isSubmitting} onClick={() => void removeLogo()} type="button">{isRemovingLogo ? "Logo verwijderen..." : "Logo verwijderen"}</button></div>}</div></section>
    {isDirty && <p className="text-sm text-amber-700">U heeft niet-opgeslagen wijzigingen.</p>}
    <button className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting || isRemovingLogo} type="submit">{isSubmitting && pendingLogo ? "Logo uploaden..." : isSubmitting ? "Opslaan..." : "Instellingen opslaan"}</button>
  </form>;
}

export default function InstellingenPage() {
  const { settings, isLoading, error, refresh } = useCompanySettings();

  async function save(settingsToSave: CompanySettings) {
    const saved = await saveCompanySettings(settingsToSave);
    void refresh();
    return saved;
  }

  return <section className="max-w-4xl"><header className="border-b border-slate-200 pb-6"><p className="text-sm font-medium text-blue-700">Instellingen</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Bedrijfsinstellingen</h1><p className="mt-3 text-sm text-slate-600">Deze gegevens worden gebruikt op nieuwe offertes en documenten.</p></header><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">{isLoading ? <p className="text-sm text-slate-500">Bedrijfsinstellingen laden...</p> : error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p><button className="mt-3 font-semibold underline" onClick={() => void refresh()} type="button">Opnieuw proberen</button></div> : <SettingsForm initialSettings={settings} key={JSON.stringify(settings)} onSave={save} />}</div></section>;
}
