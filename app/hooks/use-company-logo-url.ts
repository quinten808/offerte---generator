"use client";

import { useEffect, useState } from "react";
import { getCompanyLogoUrl } from "@/app/lib/supabase/company-settings";
import type { CompanySettings } from "@/app/types/company-settings";

export function useCompanyLogoUrl(settings: Pick<CompanySettings, "logoPath" | "logoDataUrl">) {
  const [url, setUrl] = useState<string | null>(settings.logoDataUrl);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(settings.logoPath));

  useEffect(() => {
    let isActive = true;

    async function loadLogo() {
      setError("");
      if (!settings.logoPath) {
        if (isActive) {
          setUrl(settings.logoDataUrl);
          setIsLoading(false);
        }
        return;
      }

      try {
        const signedUrl = await getCompanyLogoUrl(settings.logoPath);
        if (isActive) setUrl(signedUrl);
      } catch (reason) {
        if (isActive) {
          setUrl(settings.logoDataUrl);
          setError(reason instanceof Error ? reason.message : "Logo laden is niet gelukt.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadLogo();
    return () => { isActive = false; };
  }, [settings.logoDataUrl, settings.logoPath]);

  return { url, error, isLoading };
}
