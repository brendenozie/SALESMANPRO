/**
 * Invoice PDF Renderers (3 Distinct Designs)
 * 1. Classic Corporate (invoice-classic)
 * 2. Modern Tech Slate (invoice-modern)
 * 3. Executive Minimalist (invoice-executive)
 */

import { jsPDF } from "jspdf";
import { InvoiceDocumentData } from "../types";
import {
  callAutoTable,
  formatCurrency,
  formatDate,
  addPageNumbersAndFooters,
  drawBadge,
  drawInfoCard,
  hexToRgb,
} from "../pdfUtils";

/**
 * 1. Classic Corporate Invoice
 */
export function renderInvoiceClassic(data: InvoiceDocumentData): jsPDF {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = hexToRgb(data.company.primaryColor || "#2563EB");
  const currency = data.company.currency || "KES";

  // Header Brand Area
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text(data.company.name, 14, 20);

  if (data.company.tagline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(data.company.tagline, 14, 25);
  }

  // Invoice Title & Meta (Right Aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("INVOICE", pageWidth - 14, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No: ${data.invoiceNumber}`, pageWidth - 14, 26, { align: "right" });
  doc.text(`Issue Date: ${formatDate(data.issueDate)}`, pageWidth - 14, 31, { align: "right" });
  doc.text(`Due Date: ${formatDate(data.dueDate)}`, pageWidth - 14, 36, { align: "right" });

  const statusVariant =
    data.status === "PAID" ? "SUCCESS" : data.status === "OVERDUE" ? "DANGER" : "WARNING";
  drawBadge(doc, data.status, pageWidth - 32, 42, statusVariant);

  // Divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(14, 46, pageWidth - 14, 46);

  // Address Cards
  const companyLines = [
    data.company.address || "",
    `Phone: ${data.company.contactPhone || "—"}`,
    `Email: ${data.company.contactEmail || "—"}`,
    data.company.taxPin ? `Tax PIN: ${data.company.taxPin}` : "",
  ].filter(Boolean);

  const customerLines = [
    data.customer.name,
    data.customer.billingAddress || "",
    data.customer.phone ? `Phone: ${data.customer.phone}` : "",
    data.customer.email ? `Email: ${data.customer.email}` : "",
    data.customer.taxId ? `KRA / Tax ID: ${data.customer.taxId}` : "",
  ].filter(Boolean);

  drawInfoCard(doc, 14, 50, (pageWidth - 32) / 2, 28, "Billed From", companyLines);
  drawInfoCard(
    doc,
    14 + (pageWidth - 32) / 2 + 4,
    50,
    (pageWidth - 32) / 2,
    28,
    "Billed To (Customer)",
    customerLines
  );

  // Itemized Table
  const tableRows = data.items.map((it) => [
    it.sku || "—",
    it.description,
    it.quantity.toString(),
    formatCurrency(it.unitPrice, currency),
    it.discount ? `${it.discount}%` : "0%",
    it.taxRate ? `${it.taxRate}%` : "0%",
    formatCurrency(it.lineTotal, currency),
  ]);

  callAutoTable(doc, {
    startY: 83,
    head: [["SKU", "Description", "Qty", "Unit Price", "Disc", "Tax", "Amount"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 24, font: "courier", fontSize: 8 },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 14 },
      3: { halign: "right", cellWidth: 26 },
      4: { halign: "center", cellWidth: 14 },
      5: { halign: "center", cellWidth: 14 },
      6: { halign: "right", cellWidth: 28, fontStyle: "bold" },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      overflow: "linebreak",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Financial Breakdown (Right Column)
  const totalsX = pageWidth - 80;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  let curY = finalY;
  const printLine = (label: string, val: string, isBold: boolean = false, textColor?: [number, number, number]) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    if (textColor) doc.setTextColor(...textColor);
    else doc.setTextColor(30, 41, 59);
    doc.text(label, totalsX, curY);
    doc.text(val, pageWidth - 14, curY, { align: "right" });
    curY += 5;
  };

  printLine("Subtotal:", formatCurrency(data.subtotal, currency));
  if (data.discountTotal > 0) {
    printLine("Discount Total:", `-${formatCurrency(data.discountTotal, currency)}`, false, [225, 29, 72]);
  }
  printLine("Value Added Tax (VAT):", formatCurrency(data.taxTotal, currency));

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(totalsX, curY - 1, pageWidth - 14, curY - 1);
  curY += 1.5;

  printLine("Grand Total:", formatCurrency(data.grandTotal, currency), true, primaryColor);
  printLine("Amount Paid:", formatCurrency(data.amountPaid, currency), false, [5, 150, 105]);

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(totalsX, curY - 1, pageWidth - 14, curY - 1);
  curY += 2;

  printLine("Balance Due:", formatCurrency(data.amountDue, currency), true, [225, 29, 72]);

  // Payment Instructions & Notes (Left Column)
  let leftY = finalY;
  const leftWidth = totalsX - 22;

  if (data.paymentInstructions) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("PAYMENT INSTRUCTIONS", 14, leftY);
    leftY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitInstr = doc.splitTextToSize(data.paymentInstructions, leftWidth);
    doc.text(splitInstr, 14, leftY);
    leftY += splitInstr.length * 4 + 4;
  }

  if (data.terms) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("TERMS & CONDITIONS", 14, leftY);
    leftY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const splitTerms = doc.splitTextToSize(data.terms, leftWidth);
    doc.text(splitTerms, 14, leftY);
  }

  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}

/**
 * 2. Modern Tech Slate Invoice
 */
export function renderInvoiceModern(data: InvoiceDocumentData): jsPDF {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const currency = data.company.currency || "KES";

  // Top Dark Slate Full-Width Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 42, "F");

  // Accent Line under banner
  doc.setFillColor(99, 102, 241); // Indigo 500
  doc.rect(0, 42, pageWidth, 2, "F");

  // Company Brand in banner
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(data.company.name, 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  const contactText = `${data.company.address || ""} | ${data.company.contactPhone || ""} | ${data.company.contactEmail || ""}`;
  doc.text(contactText, 14, 25);

  // Large Invoice Header (Right of banner)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(99, 102, 241);
  doc.text("TAX INVOICE", pageWidth - 14, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(data.invoiceNumber, pageWidth - 14, 25, { align: "right" });

  // Status & Date Strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 48, pageWidth - 28, 16, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text("ISSUE DATE", 20, 54);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(data.issueDate), 20, 59);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("DUE DATE", 65, 54);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(data.dueDate), 65, 59);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("CURRENCY", 110, 54);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(currency, 110, 59);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("STATUS", 150, 54);
  const statusVar = data.status === "PAID" ? "SUCCESS" : data.status === "OVERDUE" ? "DANGER" : "WARNING";
  drawBadge(doc, data.status, 150, 60, statusVar);

  // Customer Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 68, pageWidth - 28, 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(99, 102, 241);
  doc.text("CLIENT / BILLED TO:", 20, 74);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.customer.name, 20, 80);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const custContact = [data.customer.email, data.customer.phone, data.customer.taxId ? `PIN: ${data.customer.taxId}` : ""].filter(Boolean).join("  •  ");
  doc.text(custContact, 20, 85);

  // Modern Table
  const tableRows = data.items.map((it, idx) => [
    (idx + 1).toString(),
    it.description,
    it.quantity.toString(),
    formatCurrency(it.unitPrice, currency),
    it.discount ? `${it.discount}%` : "—",
    formatCurrency(it.lineTotal, currency),
  ]);

  callAutoTable(doc, {
    startY: 92,
    head: [["#", "Item & Description", "Qty", "Unit Price", "Discount", "Total"]],
    body: tableRows,
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 16 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "center", cellWidth: 20 },
      5: { halign: "right", cellWidth: 32, fontStyle: "bold" },
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Modern Bottom Summary Card
  const boxX = pageWidth - 85;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(boxX, finalY, 71, 40, 2, 2, "FD");

  let sumY = finalY + 6;
  const printRow = (label: string, val: string, isBig: boolean = false, col?: [number, number, number]) => {
    doc.setFont("helvetica", isBig ? "bold" : "normal");
    doc.setFontSize(isBig ? 10 : 8);
    doc.setTextColor(...(col || [51, 65, 85]));
    doc.text(label, boxX + 4, sumY);
    doc.text(val, boxX + 67, sumY, { align: "right" });
    sumY += isBig ? 7 : 5;
  };

  printRow("Subtotal:", formatCurrency(data.subtotal, currency));
  printRow("Tax (VAT):", formatCurrency(data.taxTotal, currency));
  printRow("Total Amount:", formatCurrency(data.grandTotal, currency), true, [15, 23, 42]);
  printRow("Amount Paid:", formatCurrency(data.amountPaid, currency), false, [5, 150, 105]);
  printRow("Balance Due:", formatCurrency(data.amountDue, currency), true, [225, 29, 72]);

  // Left terms
  if (data.notes || data.paymentInstructions) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("NOTES & INSTRUCTIONS", 14, finalY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const combined = [data.notes, data.paymentInstructions].filter(Boolean).join("\n");
    const splitNotes = doc.splitTextToSize(combined, boxX - 22);
    doc.text(splitNotes, 14, finalY + 11);
  }

  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}

/**
 * 3. Executive Minimalist Invoice
 */
export function renderInvoiceExecutive(data: InvoiceDocumentData): jsPDF {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currency = data.company.currency || "KES";

  // Clean Double Border
  doc.setDrawColor(4, 120, 87); // Emerald 700
  doc.setLineWidth(0.6);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setLineWidth(0.2);
  doc.rect(9.5, 9.5, pageWidth - 19, pageHeight - 19);

  // Executive Header
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(4, 120, 87);
  doc.text(data.company.name.toUpperCase(), 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`${data.company.address || ""} • Tel: ${data.company.contactPhone || ""} • ${data.company.contactEmail || ""}`, 14, 25);

  // Top Right Meta Box
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text("COMMERCIAL INVOICE", pageWidth - 14, 20, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text(`NO: ${data.invoiceNumber}`, pageWidth - 14, 25, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`DATE: ${formatDate(data.issueDate)}`, pageWidth - 14, 30, { align: "right" });
  doc.text(`DUE: ${formatDate(data.dueDate)}`, pageWidth - 14, 35, { align: "right" });

  // Bill To / Ship To Grid
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(14, 40, pageWidth - 14, 40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text("ACCOUNT / BILLED PARTY:", 14, 45);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text(data.customer.name, 14, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  if (data.customer.billingAddress) doc.text(data.customer.billingAddress, 14, 54);
  if (data.customer.phone || data.customer.email) {
    doc.text(`${data.customer.phone || ""}  |  ${data.customer.email || ""}`, 14, 58);
  }

  // Items Table
  const tableRows = data.items.map((it) => [
    it.sku || "—",
    it.description,
    it.quantity.toString(),
    formatCurrency(it.unitPrice, currency),
    formatCurrency(it.lineTotal, currency),
  ]);

  callAutoTable(doc, {
    startY: 63,
    head: [["CODE / SKU", "SPECIFICATION & DESCRIPTION", "QTY", "UNIT RATE", "EXTENDED TOTAL"]],
    body: tableRows,
    headStyles: {
      fillColor: [4, 120, 87],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      font: "times",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 26, font: "courier", fontSize: 8 },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 16 },
      3: { halign: "right", cellWidth: 32 },
      4: { halign: "right", cellWidth: 34, fontStyle: "bold" },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
    },
    alternateRowStyles: {
      fillColor: [245, 250, 247],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const totalsX = pageWidth - 78;

  let ty = finalY;
  const addTotalRow = (lbl: string, val: string, bold: boolean = false, col?: [number, number, number]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 9.5 : 8.5);
    doc.setTextColor(...(col || [40, 40, 40]));
    doc.text(lbl, totalsX, ty);
    doc.text(val, pageWidth - 14, ty, { align: "right" });
    ty += 5.5;
  };

  addTotalRow("Subtotal:", formatCurrency(data.subtotal, currency));
  addTotalRow("Taxes Applicable:", formatCurrency(data.taxTotal, currency));
  addTotalRow("Gross Invoiced:", formatCurrency(data.grandTotal, currency), true, [4, 120, 87]);
  addTotalRow("Remittances Recorded:", formatCurrency(data.amountPaid, currency));
  addTotalRow("Outstanding Remittance:", formatCurrency(data.amountDue, currency), true, [180, 20, 20]);

  // Authorization Sign-off
  const signY = pageHeight - 32;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(14, signY, 70, signY);
  doc.line(pageWidth - 70, signY, pageWidth - 14, signY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text("FOR APEX GLOBAL / AUTHORIZED SIGNATORY", 14, signY + 4);
  doc.text("CUSTOMER ACCEPTANCE / STAMP", pageWidth - 14, signY + 4, { align: "right" });

  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}
