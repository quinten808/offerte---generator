"use client";

import { useEffect, useState } from "react";
import { getCompanyLogoUrl } from "@/app/lib/supabase/company-settings";

export function useCompanyLogoUrl(logoPath: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(logoPath));

  useEffect(() => {
    let isActive = true;

    async function loadLogo() {
      await Promise.resolve();
      if (!logoPath) {
        if (isActive) { setUrl(null); setError(""); setIsLoading(false); }
        return;
      }

      if (isActive) { setIsLoading(true); setError(""); }
      try {
        const signedUrl = await getCompanyLogoUrl(logoPath);
        if (isActive) setUrl(signedUrl);
      } catch (reason) {
        if (isActive) { setUrl(null); setError(reason instanceof Error ? reason.message : "Logo laden is niet gelukt."); }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadLogo();
    return () => { isActive = false; };
  }, [logoPath]);

  return { url, error, isLoading };
}
