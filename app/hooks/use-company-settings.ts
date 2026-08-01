"use client";

import { useCallback, useEffect, useState } from "react";
import { getCompanySettings } from "@/app/lib/supabase/company-settings";
import { defaultCompanySettings } from "@/app/types/company-settings";
import type { CompanySettings } from "@/app/types/company-settings";

function message(reason: unknown) {
  return reason instanceof Error ? reason.message : "Bedrijfsinstellingen laden is niet gelukt.";
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
  const [hasSettings, setHasSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const nextSettings = await getCompanySettings();
      setSettings(nextSettings ?? defaultCompanySettings);
      setHasSettings(Boolean(nextSettings));
    } catch (reason) {
      setSettings(defaultCompanySettings);
      setHasSettings(false);
      setError(message(reason));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialSettings() {
      try {
        const nextSettings = await getCompanySettings();
        if (isActive) {
          setSettings(nextSettings ?? defaultCompanySettings);
          setHasSettings(Boolean(nextSettings));
        }
      } catch (reason) {
        if (isActive) {
          setSettings(defaultCompanySettings);
          setHasSettings(false);
          setError(message(reason));
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadInitialSettings();
    return () => {
      isActive = false;
    };
  }, []);

  return { settings, hasSettings, isLoading, error, refresh };
}
