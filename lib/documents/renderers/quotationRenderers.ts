/**
 * Unified Quotation PDF Renderers (5 Distinct Premium Designs)
 * 1. Modern Corporate Estimate (quotation-corporate / quotation-classic)
 * 2. Contemporary Minimal (quotation-minimal / quotation-modern)
 * 3. Executive Luxury Quotation (quotation-executive)
 * 4. B2B Commercial Proposal (quotation-proposal)
 * 5. Branded Creative Proposal (quotation-creative)
 */

import { jsPDF } from "jspdf";
import { QuotationDocumentData } from "../types";
import {
  callAutoTable,
  formatCurrency,
  formatDate,
  addPageNumbersAndFooters,
  drawBadge,
  drawInfoCard,
  drawBrandedHeader,
  drawQrCode,
  resolveImageBase64,
  generateQrCodeDataUrl,
  hexToRgb,
} from "../pdfUtils";

/**
 * 1. Modern Corporate Estimate (Template 1)
 */
export async function renderQuotationCorporate(data: QuotationDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = hexToRgb(data.company.primaryColor || "#0284C7"); // Sky 600
  const currency = data.company.currency || "KES";

  const [logoImg, qrDataUrl] = await Promise.all([
    resolveImageBase64(data.company.logoUrl),
    generateQrCodeDataUrl(`https://salesmanpro.site/verify/quote/${data.quotationNumber}?company=${encodeURIComponent(data.company.name)}`),
  ]);

  // Header Brand Area
  const { logoEndX } = drawBrandedHeader(doc, data.company, logoImg, 14, 14, 40, 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(data.company.name, logoEndX + 2, 20);

  if (data.company.tagline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(data.company.tagline, logoEndX + 2, 25);
  }

  // Quotation Title & Meta (Right Aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("QUOTATION", pageWidth - 14, 20, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(data.quotationNumber, pageWidth - 14, 26, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Issue Date: ${formatDate(data.issueDate)}`, pageWidth - 14, 31, { align: "right" });
  doc.text(`Valid Until: ${formatDate(data.expiryDate)}`, pageWidth - 14, 36, { align: "right" });

  const statusVariant =
    data.status === "ACCEPTED" ? "SUCCESS" : data.status === "EXPIRED" ? "DANGER" : "INFO";
  drawBadge(doc, data.status, pageWidth - 32, 42, statusVariant);

  // Hairline Divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(14, 47, pageWidth - 14, 47);

  // Address Cards
  const companyLocation = [data.company.address, data.company.city, data.company.country].filter(Boolean).join(", ");
  const companyLines = [
    companyLocation || "Head Office",
    `Tel: ${data.company.contactPhone || "—"}`,
    `Email: ${data.company.contactEmail || "—"}`,
    data.company.website ? `Web: ${data.company.website}` : "",
  ].filter(Boolean);

  const customerLines = [
    data.customer.name,
    data.customer.address || "Client Account",
    data.customer.phone ? `Phone: ${data.customer.phone}` : "",
    data.customer.email ? `Email: ${data.customer.email}` : "",
  ].filter(Boolean);

  const cardWidth = (pageWidth - 32) / 2;
  drawInfoCard(doc, 14, 51, cardWidth, 27, "Prepared By (Consultant / Vendor)", companyLines, primaryColor);
  drawInfoCard(doc, 14 + cardWidth + 4, 51, cardWidth, 27, "Quotation Prepared For", customerLines, [203, 213, 225]);

  // Items Table
  const tableRows = data.items.map((it) => [
    it.sku || "—",
    it.description,
    it.quantity.toString(),
    formatCurrency(it.unitPrice, currency),
    it.discount ? `${it.discount}%` : "—",
    it.taxRate ? `${it.taxRate}%` : "0%",
    formatCurrency(it.lineTotal, currency),
  ]);

  callAutoTable(doc, {
    startY: 83,
    head: [["Item Reference", "Scope & Description", "Qty", "Unit Price", "Discount", "Tax", "Estimated Amount"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 26, font: "courier", fontSize: 8 },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 14 },
      3: { halign: "right", cellWidth: 28 },
      4: { halign: "center", cellWidth: 16 },
      5: { halign: "center", cellWidth: 14 },
      6: { halign: "right", cellWidth: 32, fontStyle: "bold" },
    },
    styles: { fontSize: 8, cellPadding: 2.8, overflow: "linebreak" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Financial Breakdown (Right Column)
  const totalsX = pageWidth - 80;
  let curY = finalY;

  const printLine = (lbl: string, val: string, bold = false, col?: [number, number, number]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    if (col) doc.setTextColor(...col);
    else doc.setTextColor(30, 41, 59);
    doc.text(lbl, totalsX, curY);
    doc.text(val, pageWidth - 14, curY, { align: "right" });
    curY += 5;
  };

  printLine("Scope Subtotal:", formatCurrency(data.subtotal, currency));
  if (data.discountTotal > 0) printLine("Total Discount:", `-${formatCurrency(data.discountTotal, currency)}`, false, [225, 29, 72]);
  printLine("Estimated Tax / VAT:", formatCurrency(data.taxTotal, currency));

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(totalsX, curY - 1, pageWidth - 14, curY - 1);
  curY += 1.5;

  printLine("ESTIMATED TOTAL:", formatCurrency(data.grandTotal, currency), true, primaryColor);

  // Left Section: Validity Alert, QR Code, Notes
  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, 14, finalY, 18, "Scan to Verify Quote");
  }

  const notesX = qrDataUrl ? 38 : 14;
  const notesW = totalsX - notesX - 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("TERMS, VALIDITY & DELIVERABLES", notesX, finalY + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const termsText = data.terms || `This quotation is valid until ${formatDate(data.expiryDate)}. Prices are subject to final project scope confirmation.`;
  const splitTerms = doc.splitTextToSize(termsText, notesW);
  doc.text(splitTerms, notesX, finalY + 7);

  // Client Acceptance Section
  const acceptY = Math.max(curY + 8, finalY + 26);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, acceptY, pageWidth - 28, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text("CLIENT ACCEPTANCE & AUTHORIZATION", 20, acceptY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("I hereby accept and approve the scope, pricing, and terms outlined in this quotation:", 20, acceptY + 11);

  // Signature lines
  const sigLineW = 60;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);

  // Client Signature
  doc.line(20, acceptY + 20, 20 + sigLineW, acceptY + 20);
  doc.setFontSize(7);
  doc.text("Authorized Client Signature", 20, acceptY + 24);

  // Printed Name
  doc.line(20 + sigLineW + 12, acceptY + 20, 20 + sigLineW * 2 + 12, acceptY + 20);
  doc.text("Printed Name & Title", 20 + sigLineW + 12, acceptY + 24);

  // Date
  doc.line(20 + sigLineW * 2 + 24, acceptY + 20, pageWidth - 20, acceptY + 20);
  doc.text("Date of Acceptance", 20 + sigLineW * 2 + 24, acceptY + 24);

  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}

/**
 * 2. Contemporary Minimal Quotation (Template 2)
 */
export async function renderQuotationMinimal(data: QuotationDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const currency = data.company.currency || "KES";
  const accentColor = hexToRgb(data.company.accentColor || "#0284C7");

  const [logoImg, qrDataUrl] = await Promise.all([
    resolveImageBase64(data.company.logoUrl),
    generateQrCodeDataUrl(`https://salesmanpro.site/verify/quote/${data.quotationNumber}`),
  ]);

  // Top Dark Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setFillColor(...accentColor);
  doc.rect(0, 40, pageWidth, 2, "F");

  const { logoEndX } = drawBrandedHeader(doc, data.company, logoImg, 14, 10, 38, 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(data.company.name, logoEndX + 2, 19);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text([data.company.address, data.company.contactPhone].filter(Boolean).join("  •  "), logoEndX + 2, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...accentColor);
  doc.text("ESTIMATE", pageWidth - 14, 19, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(data.quotationNumber, pageWidth - 14, 26, { align: "right" });

  // Expiry Alert Strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 46, pageWidth - 28, 14, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`PROPOSAL FOR: ${data.customer.name}`, 20, 52.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued: ${formatDate(data.issueDate)}  |  Valid Until: ${formatDate(data.expiryDate)}`, 20, 57);

  drawBadge(doc, data.status, pageWidth - 32, 53, data.status === "ACCEPTED" ? "SUCCESS" : "INFO");

  // Items
  const tableRows = data.items.map((it) => [
    it.description,
    it.quantity.toString(),
    formatCurrency(it.unitPrice, currency),
    it.discount ? `${it.discount}%` : "—",
    formatCurrency(it.lineTotal, currency),
  ]);

  callAutoTable(doc, {
    startY: 65,
    head: [["Deliverable / Scope", "Qty", "Unit Rate", "Disc", "Subtotal"]],
    body: tableRows,
    theme: "plain",
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "center", cellWidth: 16 },
      2: { halign: "right", cellWidth: 32 },
      3: { halign: "center", cellWidth: 18 },
      4: { halign: "right", cellWidth: 36, fontStyle: "bold" },
    },
    styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2 },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const totalsX = pageWidth - 76;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Estimated Total:", totalsX, finalY + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(data.grandTotal, currency), pageWidth - 14, finalY + 5, { align: "right" });

  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, 14, finalY, 16, "Verification QR");
  }

  // Acceptance block
  const acceptY = finalY + 16;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, acceptY, pageWidth - 14, acceptY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("CLIENT APPROVAL SIGNATURE:", 14, acceptY + 6);

  doc.setDrawColor(148, 163, 184);
  doc.line(70, acceptY + 6, 130, acceptY + 6);
  doc.text("DATE:", 140, acceptY + 6);
  doc.line(152, acceptY + 6, pageWidth - 14, acceptY + 6);

  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}

/**
 * 3. Executive Luxury Quotation (Template 3)
 */
export async function renderQuotationExecutive(data: QuotationDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const currency = data.company.currency || "KES";
  const goldColor: [number, number, number] = [180, 83, 9];
  const charcoalColor: [number, number, number] = [15, 23, 42];

  const [logoImg, qrDataUrl] = await Promise.all([
    resolveImageBase64(data.company.logoUrl),
    generateQrCodeDataUrl(`https://salesmanpro.site/verify/quote/${data.quotationNumber}?exec=true`),
  ]);

  doc.setFillColor(...goldColor);
  doc.rect(0, 0, pageWidth, 4, "F");

  const { logoEndX } = drawBrandedHeader(doc, data.company, logoImg, 14, 10, 40, 16);

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...charcoalColor);
  doc.text(data.company.name, logoEndX + 2, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(data.company.tagline || "Executive Commercial Proposal", logoEndX + 2, 23.5);

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...goldColor);
  doc.text("FORMAL QUOTATION", pageWidth - 14, 18, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(data.quotationNumber, pageWidth - 14, 24, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issue Date: ${formatDate(data.issueDate)}  |  Expiry: ${formatDate(data.expiryDate)}`, pageWidth - 14, 29, { align: "right" });

  // Divider
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.6);
  doc.line(14, 38, pageWidth - 14, 38);

  // Client Box
  doc.setFillColor(250, 250, 249);
  doc.setDrawColor(231, 229, 228);
  doc.roundedRect(14, 42, pageWidth - 28, 20, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...goldColor);
  doc.text("CLIENT PROPOSAL DOSSIER", 20, 48);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.customer.name, 20, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text([data.customer.address, data.customer.phone, data.customer.email].filter(Boolean).join("  •  "), 20, 59);

  // Items
  const tableRows = data.items.map((it) => [
    it.sku || "—",
    it.description,
    it.quantity.toString(),
    formatCurrency(it.unitPrice, currency),
    formatCurrency(it.lineTotal, currency),
  ]);

  callAutoTable(doc, {
    startY: 68,
    head: [["Ref", "Engagement Deliverable / Scope", "Qty", "Unit Price", "Total Price"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: charcoalColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 24, font: "courier", fontSize: 8 },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 16 },
      3: { halign: "right", cellWidth: 32 },
      4: { halign: "right", cellWidth: 36, fontStyle: "bold" },
    },
    styles: { fontSize: 8, cellPadding: 3, lineColor: [231, 229, 228] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const totalsX = pageWidth - 80;

  doc.setFillColor(250, 250, 249);
  doc.setDrawColor(...goldColor);
  doc.roundedRect(totalsX - 4, finalY, 70, 22, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL ENGAGEMENT ESTIMATE:", totalsX, finalY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...goldColor);
  doc.text(formatCurrency(data.grandTotal, currency), totalsX, finalY + 14);

  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, 14, finalY, 18, "Executive Verification");
  }

  // Formal Acceptance
  const acceptY = finalY + 28;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, acceptY, pageWidth - 14, acceptY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("OFFICIAL CLIENT CONFIRMATION & APPROVAL", 14, acceptY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Signature: __________________________    Name: __________________________    Date: ______________", 14, acceptY + 13);

  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}

/**
 * 4. B2B Commercial Proposal (Template 4)
 */
export async function renderQuotationProposal(data: QuotationDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = hexToRgb(data.company.primaryColor || "#7C3AED");
  const currency = data.company.currency || "KES";

  const [logoImg, qrDataUrl] = await Promise.all([
    resolveImageBase64(data.company.logoUrl),
    generateQrCodeDataUrl(`https://salesmanpro.site/verify/proposal/${data.quotationNumber}`),
  ]);

  // Modern Purple B2B Hero Banner
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, 12, pageWidth - 28, 30, 2.5, 2.5, "F");

  const { logoEndX } = drawBrandedHeader(doc, data.company, logoImg, 20, 17, 36, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(data.company.name, logoEndX + 2, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(233, 213, 255);
  doc.text("Commercial B2B Deliverables Proposal", logoEndX + 2, 31);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("PROPOSAL", pageWidth - 22, 25, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(233, 213, 255);
  doc.text(data.quotationNumber, pageWidth - 22, 31, { align: "right" });

  // Client dossier
  doc.setFillColor(250, 245, 255);
  doc.roundedRect(14, 46, pageWidth - 28, 16, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text("COMMERCIAL PARTNER / CLIENT:", 20, 52);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.customer.name, 20, 58);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Proposal Valid Until: ${formatDate(data.expiryDate)}`, pageWidth - 22, 55, { align: "right" });

  // Items
  const tableRows = data.items.map((it) => [
    it.description,
    it.quantity.toString(),
    formatCurrency(it.unitPrice, currency),
    it.discount ? `${it.discount}%` : "0%",
    formatCurrency(it.lineTotal, currency),
  ]);

  callAutoTable(doc, {
    startY: 66,
    head: [["Deliverable / Milestone", "Units", "Rate", "Disc", "Milestone Total"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "center", cellWidth: 16 },
      2: { halign: "right", cellWidth: 30 },
      3: { halign: "center", cellWidth: 16 },
      4: { halign: "right", cellWidth: 34, fontStyle: "bold" },
    },
    styles: { fontSize: 8, cellPadding: 2.8 },
    alternateRowStyles: { fillColor: [253, 244, 255] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;
  const totalsX = pageWidth - 76;

  doc.setFillColor(...primaryColor);
  doc.roundedRect(totalsX - 4, finalY, 66, 24, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(233, 213, 255);
  doc.text("TOTAL CONTRACT ESTIMATE", totalsX + 2, finalY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(formatCurrency(data.grandTotal, currency), totalsX + 2, finalY + 15);

  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, 14, finalY, 18, "Proposal Verification");
  }

  // Acceptance block
  const acceptY = finalY + 30;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, acceptY, pageWidth - 14, acceptY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text("CLIENT ACCEPTANCE & COMMENCEMENT SIGN-OFF", 14, acceptY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Client Signatory: ________________________   Title: ___________________   Date: _____________", 14, acceptY + 13);

  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}

/**
 * 5. Branded Creative Proposal (Template 5)
 */
export async function renderQuotationCreative(data: QuotationDocumentData): Promise<jsPDF> {
  return renderQuotationProposal(data);
}

// Backward-compatibility aliases
export const renderQuotationClassic = renderQuotationCorporate;
export const renderQuotationModern = renderQuotationMinimal;
