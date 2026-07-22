"use client";
import { useSyncExternalStore } from "react";
import { getQuotes, getServerQuotes, subscribeToQuotes } from "@/app/lib/quote-storage";
export function useQuotes() { return useSyncExternalStore(subscribeToQuotes, getQuotes, getServerQuotes); }
