"use client";

import { useState } from "react";
import { useCompanySettings } from "@/app/hooks/use-company-settings";
import { getCompanyLogoUrl } from "@/app/lib/supabase/company-settings";
import { downloadQuotePdf } from "@/app/lib/quote-pdf";
import type { Customer } from "@/app/types/customer";
import type { Quote } from "@/app/types/quote";

async function imageUrlToDataUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("De logo-afbeelding kon niet worden gedownload.");
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Het logo kon niet worden gelezen."));
    reader.onerror = () => reject(new Error("Het logo kon niet worden gelezen."));
    reader.readAsDataURL(blob);
  });
}

export function QuotePdfButton({ quote, customer }: { quote: Quote; customer?: Customer }) {
  const { settings: company, isLoading: isLoadingSettings, error: settingsError } = useCompanySettings();
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function generate() {
    if (!customer) { setError("Deze offerte heeft geen beschikbare klant."); return; }
    if (settingsError || !company.companyName) { setError(settingsError || "Vul eerst uw bedrijfsnaam in bij Instellingen."); return; }

    setIsGenerating(true);
    setError("");
    let logoWarning = "";
    let logoImageData: string | undefined;
    if (company.logoPath) {
      try { logoImageData = await imageUrlToDataUrl(await getCompanyLogoUrl(company.logoPath)); }
      catch (reason) { logoWarning = reason instanceof Error ? `Logo kon niet worden geladen; de PDF is zonder logo gemaakt. (${reason.message})` : "Logo kon niet worden geladen; de PDF is zonder logo gemaakt."; }
    }

    try {
      await downloadQuotePdf({ quote, customer, company, logoImageData });
      if (logoWarning) setError(logoWarning);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "De PDF kon niet worden gemaakt.");
    } finally {
      setIsGenerating(false);
    }
  }

  return <div><button className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60" disabled={isGenerating || isLoadingSettings} onClick={() => void generate()} type="button">{isGenerating ? "PDF maken..." : isLoadingSettings ? "Instellingen laden..." : "PDF downloaden"}</button>{error && <p className="mt-2 max-w-xs text-sm text-red-700" role="alert">{error}</p>}</div>;
}
