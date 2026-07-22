import { defaultCompanySettings } from "@/app/types/company-settings";
import type { CompanySettings } from "@/app/types/company-settings";

const storageKey = "offertegenerator.company-settings.v1";
let cachedSettings: CompanySettings | null = null;
let cachedStorageValue: string | null | undefined;
const isBrowser = () => typeof window !== "undefined";

export function getServerCompanySettings() { return defaultCompanySettings; }
export function getCompanySettings(): CompanySettings {
  if (!isBrowser()) return defaultCompanySettings;
  const value = window.localStorage.getItem(storageKey);
  if (value === cachedStorageValue && cachedSettings) return cachedSettings;
  if (value === null) { cachedStorageValue = null; cachedSettings = defaultCompanySettings; return defaultCompanySettings; }
  try { const parsed: unknown = JSON.parse(value); cachedStorageValue = value; cachedSettings = parsed && typeof parsed === "object" ? { ...defaultCompanySettings, ...(parsed as Partial<CompanySettings>) } : defaultCompanySettings; return cachedSettings; }
  catch { cachedStorageValue = value; cachedSettings = defaultCompanySettings; return defaultCompanySettings; }
}
export function saveCompanySettings(settings: CompanySettings) { const value = JSON.stringify(settings); cachedSettings = settings; cachedStorageValue = value; window.localStorage.setItem(storageKey, value); window.dispatchEvent(new Event("company-settings-changed")); }
export function subscribeToCompanySettings(callback: () => void) { const onStorage = (event: StorageEvent) => { if (event.key === storageKey) callback(); }; window.addEventListener("company-settings-changed", callback); window.addEventListener("storage", onStorage); return () => { window.removeEventListener("company-settings-changed", callback); window.removeEventListener("storage", onStorage); }; }
