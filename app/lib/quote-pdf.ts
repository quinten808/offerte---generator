import { formatCurrency, lineTotalCents, quoteTotals } from "@/app/lib/quote-calculations";
import type { CompanySettings } from "@/app/types/company-settings";
import type { Customer } from "@/app/types/customer";
import type { Quote } from "@/app/types/quote";

type PdfData = { quote: Quote; customer: Customer; company: CompanySettings };
const formatDate = (value: string) => new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(new Date(`${value}T12:00:00`));
const safeFilename = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
const imageFormat = (dataUrl: string) => dataUrl.match(/^data:image\/(png|jpeg|webp)/i)?.[1]?.toUpperCase() ?? "PNG";
const formatPostalCode = (value: string) => { const compact = value.replace(/\s/g, "").toUpperCase(); const match = compact.match(/^(\d{4})([A-Z]{2})$/); return match ? `${match[1]} ${match[2]}` : value; };
const formatPhone = (value: string) => { const digits = value.replace(/\D/g, ""); const local = digits.startsWith("0031") ? `0${digits.slice(4)}` : digits.startsWith("31") ? `0${digits.slice(2)}` : digits; return /^06\d{8}$/.test(local) ? `${local.slice(0, 2)} ${local.slice(2)}` : value; };

export async function downloadQuotePdf({ quote, customer, company }: PdfData) {
  if (!company.companyName.trim()) throw new Error("Vul eerst de bedrijfsnaam in bij Instellingen.");
  if (!customer) throw new Error("De klant van deze offerte ontbreekt.");

  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const pdf = new jsPDF({ format: "a4", unit: "mm" });
  const totals = quoteTotals(quote.items);
  const margin = 16;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = 18;
  const addParagraph = (title: string, text: string) => {
    if (!text.trim()) return;
    const lines = pdf.splitTextToSize(text, contentWidth);
    if (y + lines.length * 5 + 12 > 280) { pdf.addPage(); y = 18; }
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text(title, margin, y); y += 6;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text(lines, margin, y); y += lines.length * 5 + 7;
  };

  if (company.logoDataUrl) {
    try { pdf.addImage(company.logoDataUrl, imageFormat(company.logoDataUrl), margin, y, 42, 22); } catch { /* Een onbruikbaar logo blokkeert de offerte niet. */ }
  }
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(18); pdf.text(company.companyName, company.logoDataUrl ? 64 : margin, y + 7);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5);
  const companyLines = [company.contactName, `${company.street} ${company.houseNumber}`.trim(), `${company.postalCode} ${company.city}`.trim(), company.phone, company.email, company.website].filter(Boolean);
  pdf.text(companyLines, company.logoDataUrl ? 64 : margin, y + 13);
  y += Math.max(30, companyLines.length * 4.4 + 16);
  pdf.setDrawColor(203, 213, 225); pdf.line(margin, y, pageWidth - margin, y); y += 10;

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(20); pdf.text("Offerte", margin, y); y += 8;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
  pdf.text([`Offertenummer: ${quote.number}`, `Datum: ${formatDate(quote.date)}`, `Geldig tot: ${formatDate(quote.validUntil)}`], margin, y); y += 18;

  const customerLines = [customer.name, customer.company, customer.streetAndNumber, `${formatPostalCode(customer.postalCode)} ${customer.city}`.trim(), customer.email, formatPhone(customer.phone)].filter(Boolean);
  const customerBlockHeight = Math.max(18, customerLines.length * 4.4 + 12);
  pdf.setFillColor(241, 245, 249); pdf.rect(margin, y, contentWidth, customerBlockHeight, "F");
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text("Aan", margin + 5, y + 7); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
  pdf.text(customerLines, margin + 5, y + 13); y += customerBlockHeight + 9;
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(13); pdf.text(quote.title, margin, y); y += 8;
  addParagraph("Werkzaamheden", quote.description);

  autoTable(pdf, { startY: y, margin: { left: margin, right: margin }, head: [["Omschrijving", "Aantal", "Prijs p.e.", "Btw", "Bedrag excl. btw"]], body: quote.items.map((item) => [item.description || "-", `${item.quantity} ${item.unit}`, formatCurrency(item.pricePerUnitCents), `${item.vatRate}%`, formatCurrency(lineTotalCents(item))]), styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3, valign: "top" }, headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold" }, columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 25 }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } }, theme: "grid" });
  y = ((pdf as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 8;
  if (y > 250) { pdf.addPage(); y = 18; }
  const totalsRows = [["Subtotaal excl. btw", formatCurrency(totals.subtotalCents)], ...totals.vatByRate.filter((vat) => vat.cents > 0).map((vat) => [`Btw ${vat.rate}%`, formatCurrency(vat.cents)]), ["Totaal btw", formatCurrency(totals.vatCents)], ["Totaal incl. btw", formatCurrency(totals.totalCents)]];
  autoTable(pdf, { startY: y, margin: { left: 115, right: margin }, body: totalsRows, styles: { font: "helvetica", fontSize: 9, cellPadding: 2.5 }, columnStyles: { 0: { fontStyle: "normal" }, 1: { halign: "right" } }, didParseCell: (data) => { if (data.row.index === totalsRows.length - 1) { data.cell.styles.fontStyle = "bold"; data.cell.styles.fillColor = [241, 245, 249]; } }, theme: "plain" });
  y = ((pdf as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 10;
  addParagraph("Opmerkingen", quote.remarks);
  addParagraph("Betalingstermijn", `Betaling binnen ${quote.paymentTermDays} dagen na factuurdatum.`);
  addParagraph("Voorwaarden", quote.terms);
  const footer = [company.chamberOfCommerce && `KvK ${company.chamberOfCommerce}`, company.vatNumber && `Btw ${company.vatNumber}`, company.iban && `IBAN ${company.iban}`].filter(Boolean).join("  |  ");
  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) { pdf.setPage(page); pdf.setDrawColor(203, 213, 225); pdf.line(margin, 287, pageWidth - margin, 287); pdf.setFontSize(7.5); pdf.setTextColor(100); pdf.text(footer, margin, 292); pdf.text(`Pagina ${page} van ${pageCount}`, pageWidth - margin, 292, { align: "right" }); }
  pdf.save(`Offerte-${safeFilename(quote.number)}-${safeFilename(customer.name)}.pdf`);
}
