"use client";
import { useCallback, useEffect, useState } from "react";
import { listQuotes } from "@/app/lib/supabase/quotes";
import type { Quote } from "@/app/types/quote";
export function useSupabaseQuotes() { const [quotes,setQuotes]=useState<Quote[]>([]); const [isLoading,setIsLoading]=useState(true); const [error,setError]=useState(""); const refresh=useCallback(async()=>{setIsLoading(true);setError("");try{setQuotes(await listQuotes());}catch(reason){setQuotes([]);setError(reason instanceof Error?reason.message:"Offertes laden is niet gelukt.");}finally{setIsLoading(false);}},[]); useEffect(()=>{let active=true; (async()=>{try{const next=await listQuotes();if(active)setQuotes(next);}catch(reason){if(active)setError(reason instanceof Error?reason.message:"Offertes laden is niet gelukt.");}finally{if(active)setIsLoading(false);}})();return()=>{active=false;};},[]); return {quotes,isLoading,error,refresh}; }
