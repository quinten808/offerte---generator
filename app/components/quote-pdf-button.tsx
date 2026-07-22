"use client";
import { useState } from "react";
import { useCompanySettings } from "@/app/hooks/use-company-settings";
import { downloadQuotePdf } from "@/app/lib/quote-pdf";
import type { Customer } from "@/app/types/customer";
import type { Quote } from "@/app/types/quote";

export function QuotePdfButton({ quote, customer }: { quote: Quote; customer?: Customer }) { const company = useCompanySettings(); const [error, setError] = useState(""); const [isGenerating, setIsGenerating] = useState(false); async function generate() { if (!customer) { setError("Deze offerte heeft geen beschikbare klant."); return; } setIsGenerating(true); setError(""); try { await downloadQuotePdf({ quote, customer, company }); } catch (reason) { setError(reason instanceof Error ? reason.message : "De PDF kon niet worden gemaakt."); } finally { setIsGenerating(false); } } return <div><button className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60" disabled={isGenerating} onClick={generate} type="button">{isGenerating ? "PDF maken..." : "PDF downloaden"}</button>{error && <p className="mt-2 max-w-xs text-sm text-red-700" role="alert">{error}</p>}</div>; }
