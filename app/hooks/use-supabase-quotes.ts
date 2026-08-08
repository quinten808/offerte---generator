"use client";

import { useCallback, useEffect, useState } from "react";
import { listQuotes } from "@/app/lib/supabase/quotes";
import type { QuoteFilters, QuoteWithCustomer } from "@/app/lib/supabase/quotes";

export function useSupabaseQuotes(filters: QuoteFilters = {}) {
  const [quotes, setQuotes] = useState<QuoteWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const filterKey = JSON.stringify(filters);
  const refresh = useCallback(async () => { setIsLoading(true); setError(""); try { setQuotes(await listQuotes(JSON.parse(filterKey) as QuoteFilters)); } catch (reason) { setQuotes([]); setError(reason instanceof Error ? reason.message : "Offertes laden is niet gelukt."); } finally { setIsLoading(false); } }, [filterKey]);
  useEffect(() => { let active=true; async function load(){ try { const next=await listQuotes(JSON.parse(filterKey) as QuoteFilters); if(active)setQuotes(next); } catch(reason) { if(active){setQuotes([]);setError(reason instanceof Error?reason.message:"Offertes laden is niet gelukt.");} } finally {if(active)setIsLoading(false);} } void load(); return()=>{active=false;}; },[filterKey]);
  return { quotes, isLoading, error, refresh };
}
