"use client";

import { useCallback, useEffect, useState } from "react";
import { listCustomers } from "@/app/lib/supabase/customers";
import type { Customer } from "@/app/types/customer";

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : "Klanten laden is niet gelukt.";
}

export function useSupabaseCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCustomers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const nextCustomers = await listCustomers();
      setCustomers(nextCustomers);
    } catch (reason) {
      setCustomers([]);
      setError(errorMessage(reason));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialCustomers() {
      try {
        const nextCustomers = await listCustomers();
        if (isActive) setCustomers(nextCustomers);
      } catch (reason) {
        if (isActive) {
          setCustomers([]);
          setError(errorMessage(reason));
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadInitialCustomers();
    return () => {
      isActive = false;
    };
  }, []);

  return { customers, isLoading, error, refresh: refreshCustomers };
}
