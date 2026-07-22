"use client";
import { useSyncExternalStore } from "react";
import { getCompanySettings, getServerCompanySettings, subscribeToCompanySettings } from "@/app/lib/company-settings-storage";
export function useCompanySettings() { return useSyncExternalStore(subscribeToCompanySettings, getCompanySettings, getServerCompanySettings); }
