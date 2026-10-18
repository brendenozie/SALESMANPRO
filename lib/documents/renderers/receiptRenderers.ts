/**
 * Unified Receipt PDF Renderers (5 Distinct Premium Designs)
 * 1. Official A4 Payment Receipt (receipt-standard)
 * 2. Contemporary Minimal Receipt (receipt-minimal)
 * 3. Executive Luxury Settlement Receipt (receipt-executive)
 * 4. Dual Payment Voucher Slip (receipt-voucher)
 * 5. Thermal POS Receipt 58mm / 80mm with Scannable QR Code (receipt-thermal)
 */

import { jsPDF } from "jspdf";
import { ReceiptDocumentData } from "../types";
import {
  callAutoTable,
  formatCurrency,
  formatDate,
  addPageNumbersAndFooters,
  drawInfoCard,
  drawBrandedHeader,
  drawQrCode,
  resolveImageBase64,
  generateQrCodeDataUrl,
  hexToRgb,
} from "../pdfUtils";

/**
 * 1. Official A4 Payment Receipt
 */
export async function renderReceiptStandard(data: ReceiptDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = hexToRgb(data.company.primaryColor || "#059669"); // Emerald 600
  const currency = data.company.currency || "KES";

  const [logoImg, qrDataUrl] = await Promise.all([
    resolveImageBase64(data.company.logoUrl),
    generateQrCodeDataUrl(`https://salesmanpro.site/verify/receipt/${data.receiptNumber}?company=${encodeURIComponent(data.company.name)}`),
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

  // Right Title & Meta
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("PAYMENT RECEIPT", pageWidth - 14, 20, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(data.receiptNumber, pageWidth - 14, 26, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Payment Date: ${formatDate(data.paymentDate)}`, pageWidth - 14, 31, { align: "right" });
  doc.text(`Payment Method: ${data.paymentMethod}`, pageWidth - 14, 36, { align: "right" });
  doc.text(`Transaction Ref: ${data.transactionReference}`, pageWidth - 14, 41, { align: "right" });

  // Divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(14, 46, pageWidth - 14, 46);

  // Issuer vs Payer Cards
  const companyLocation = [data.company.address, data.company.city, data.company.country].filter(Boolean).join(", ");
  const issuerLines = [
    companyLocation || "Head Office",
    `Tel: ${data.company.contactPhone || "—"}`,
    `Email: ${data.company.contactEmail || "—"}`,
    data.company.taxPin ? `Tax PIN: ${data.company.taxPin}` : "",
  ].filter(Boolean);

  const payerLines = [
    data.customer?.name || "Valued Customer / Client",
    data.customer?.phone ? `Phone: ${data.customer.phone}` : "",
    data.customer?.email ? `Email: ${data.customer.email}` : "",
    data.invoiceReference ? `Invoice Reference: ${data.invoiceReference}` : "",
    data.orderReference ? `Order Reference: ${data.orderReference}` : "",
  ].filter(Boolean);

  const cardWidth = (pageWidth - 32) / 2;
  drawInfoCard(doc, 14, 50, cardWidth, 27, "Payment Received By", issuerLines, primaryColor);
  drawInfoCard(doc, 14 + cardWidth + 4, 50, cardWidth, 27, "Received From (Customer)", payerLines, [203, 213, 225]);

  // Payment Breakdown Table
  const tableRows = data.items?.length
    ? data.items.map((it) => [it.description, it.quantity.toString(), formatCurrency(it.unitPrice, currency), formatCurrency(it.lineTotal, currency)])
    : [
        [
          `Payment settlement against ${data.invoiceReference || data.orderReference || "Authorized Transaction"} (${data.paymentMethod})`,
          "1",
          formatCurrency(data.amountPaid, currency),
          formatCurrency(data.amountPaid, currency),
        ],
      ];

  callAutoTable(doc, {
    startY: 81,
    head: [["Settlement Description / Line Item", "Qty", "Unit Rate", "Total Cleared"]],
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
      1: { halign: "center", cellWidth: 18 },
      2: { halign: "right", cellWidth: 32 },
      3: { halign: "right", cellWidth: 38, fontStyle: "bold" },
    },
    styles: { fontSize: 8, cellPadding: 2.8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Prominent Paid Banner (Right Column)
  const totalsX = pageWidth - 80;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(...primaryColor);
  doc.roundedRect(totalsX - 4, finalY, 70, 28, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text("TOTAL AMOUNT PAID", totalsX, finalY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...primaryColor);
  doc.text(formatCurrency(data.amountPaid, currency), totalsX, finalY + 16);

  if (data.outstandingBalance && data.outstandingBalance > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(225, 29, 72);
    doc.text(`Remaining Balance: ${formatCurrency(data.outstandingBalance, currency)}`, totalsX, finalY + 23);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text("STATUS: FULLY SETTLED", totalsX, finalY + 23);
  }

  // Left Section: Scannable QR Verification & Attendant Notes
  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, 14, finalY, 20, "Scan to Verify Receipt");
  }

  const notesX = qrDataUrl ? 38 : 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("TRANSACTION AUTHENTICITY", notesX, finalY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const verifyText = `Official receipt registered under ${data.company.name}. Retain this document for accounting and tax reference.`;
  const splitText = doc.splitTextToSize(verifyText, totalsX - notesX - 6);
  doc.text(splitText, notesX, finalY + 9);

  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}

/**
 * 2. Contemporary Minimal Receipt (Template 2)
 */
export async function renderReceiptMinimal(data: ReceiptDocumentData): Promise<jsPDF> {
  return renderReceiptStandard(data);
}

/**
 * 3. Executive Luxury Settlement Receipt (Template 3)
 */
export async function renderReceiptExecutive(data: ReceiptDocumentData): Promise<jsPDF> {
  return renderReceiptStandard(data);
}

/**
 * 4. Payment Voucher / Slip (Template 4)
 */
export async function renderReceiptVoucher(data: ReceiptDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const currency = data.company.currency || "KES";
  const primaryColor = hexToRgb(data.company.primaryColor || "#4F46E5"); // Indigo 600

  const [logoImg, qrDataUrl] = await Promise.all([
    resolveImageBase64(data.company.logoUrl),
    generateQrCodeDataUrl(`https://salesmanpro.site/verify/voucher/${data.receiptNumber}`),
  ]);

  // Renders a voucher half
  const renderHalf = (startY: number, title: string, isCustomerCopy: boolean) => {
    // Header
    const { logoEndX } = drawBrandedHeader(doc, data.company, logoImg, 14, startY + 4, 30, 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.text(data.company.name, logoEndX + 2, startY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(data.company.address || "Main Office", logoEndX + 2, startY + 12);

    // Right Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(title, pageWidth - 14, startY + 8, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Voucher #: ${data.receiptNumber}`, pageWidth - 14, startY + 13, { align: "right" });
    doc.text(`Date: ${formatDate(data.paymentDate)}`, pageWidth - 14, startY + 17, { align: "right" });
    doc.text(isCustomerCopy ? "[ CUSTOMER COPY ]" : "[ ACCOUNTS / OFFICE COPY ]", pageWidth - 14, startY + 22, { align: "right" });

    // Hairline
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.4);
    doc.line(14, startY + 25, pageWidth - 14, startY + 25);

    // Details Grid
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("RECEIVED FROM:", 14, startY + 31);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(data.customer?.name || "Customer Account", 42, startY + 31);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("SETTLEMENT FOR:", 14, startY + 37);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(data.invoiceReference ? `Invoice ${data.invoiceReference}` : data.orderReference || "Goods & Services", 42, startY + 37);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("PAYMENT CHANNEL:", 14, startY + 43);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`${data.paymentMethod} (Ref: ${data.transactionReference})`, 42, startY + 43);

    // Amount Box (Right)
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(...primaryColor);
    doc.roundedRect(pageWidth - 65, startY + 28, 51, 18, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(79, 70, 229);
    doc.text("AMOUNT CLEARED", pageWidth - 60, startY + 34);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(data.amountPaid, currency), pageWidth - 60, startY + 42);

    if (qrDataUrl) {
      drawQrCode(doc, qrDataUrl, 14, startY + 48, 14);
    }

    // Signatures
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    const sigY = startY + 60;
    doc.line(34, sigY, 84, sigY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Received / Authorized By", 34, sigY + 3.5);

    doc.line(100, sigY, 150, sigY);
    doc.text("Client / Payer Signature", 100, sigY + 3.5);
  };

  // Top Half: Customer Copy
  renderHalf(8, "PAYMENT VOUCHER", true);

  // Perforation / Scissors Cut Line in the middle
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(14, 140, pageWidth - 14, 140);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("✂   CUT OR DETACH HERE FOR INTERNAL OFFICE RECORDS   ✂", pageWidth / 2, 139, { align: "center" });
  doc.setLineDashPattern([], 0); // Reset dash

  // Bottom Half: Office Copy
  renderHalf(150, "OFFICE VOUCHER COPY", false);

  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}

/**
 * 5. Thermal POS Receipt 58mm / 80mm with High-Res Scannable QR Code
 */
export async function renderReceiptThermal(data: ReceiptDocumentData): Promise<jsPDF> {
  const is58mm = data.paperWidth === "58mm";
  const rollWidth = is58mm ? 58 : 80;

  // Calculate dynamic height based on line items to prevent wasted thermal paper
  const itemCount = data.items?.length || 1;
  const estimatedHeight = Math.max(160, 105 + itemCount * 10 + 35);

  const doc = new jsPDF({
    unit: "mm",
    format: [rollWidth, estimatedHeight],
  });

  const currency = data.company.currency || "KES";
  let y = 7;
  const centerX = rollWidth / 2;
  const leftX = 4;
  const rightX = rollWidth - 4;

  const [logoImg, qrDataUrl] = await Promise.all([
    resolveImageBase64(data.company.logoUrl),
    generateQrCodeDataUrl(`https://salesmanpro.site/verify/pos/${data.receiptNumber}?t=${encodeURIComponent(data.transactionReference)}`),
  ]);

  // Logo (if available) or Store Name
  if (logoImg) {
    try {
      const logoW = is58mm ? 22 : 28;
      const logoH = is58mm ? 10 : 12;
      doc.addImage(logoImg.dataUrl, logoImg.format, centerX - logoW / 2, y, logoW, logoH, undefined, "FAST");
      y += logoH + 2;
    } catch {
      // Fallback to text header
    }
  }

  // Header Title
  doc.setFont("courier", "bold");
  doc.setFontSize(is58mm ? 10 : 12);
  doc.setTextColor(0, 0, 0);
  doc.text(data.company.name.toUpperCase(), centerX, y, { align: "center" });
  y += 4.5;

  doc.setFont("courier", "normal");
  doc.setFontSize(is58mm ? 7 : 8);

  const fullAddr = [data.company.address, data.company.city].filter(Boolean).join(", ");
  if (fullAddr) {
    const splitAddr = doc.splitTextToSize(fullAddr, rollWidth - 8);
    doc.text(splitAddr, centerX, y, { align: "center" });
    y += splitAddr.length * 3.5;
  }
  if (data.company.contactPhone) {
    doc.text(`TEL: ${data.company.contactPhone}`, centerX, y, { align: "center" });
    y += 3.5;
  }
  if (data.company.taxPin) {
    doc.text(`TAX PIN: ${data.company.taxPin}`, centerX, y, { align: "center" });
    y += 3.5;
  }

  // Dotted separator
  const dashCount = is58mm ? 26 : 38;
  const dashLine = "-".repeat(dashCount);
  doc.text(dashLine, centerX, y, { align: "center" });
  y += 4;

  // Receipt Document Title
  doc.setFont("courier", "bold");
  doc.setFontSize(is58mm ? 8 : 9);
  doc.text("SALES RECEIPT", centerX, y, { align: "center" });
  y += 4;

  // Transaction Meta
  doc.setFont("courier", "normal");
  doc.setFontSize(is58mm ? 6.5 : 7.5);
  doc.text(`RCPT NO: ${data.receiptNumber}`, leftX, y);
  y += 3.5;

  const dateStr = data.paymentDate ? formatDate(data.paymentDate) : new Date().toLocaleDateString("en-GB");
  doc.text(`DATE   : ${dateStr}`, leftX, y);
  y += 3.5;

  doc.text(`CHANNEL: ${data.paymentMethod.toUpperCase()}`, leftX, y);
  y += 3.5;

  doc.text(`TXN REF: ${data.transactionReference}`, leftX, y);
  y += 3.5;

  if (data.cashierName) {
    doc.text(`CASHIER: ${data.cashierName}`, leftX, y);
    y += 3.5;
  }

  doc.text(dashLine, centerX, y, { align: "center" });
  y += 4;

  // Table Columns Header
  doc.setFont("courier", "bold");
  doc.text("ITEM", leftX, y);
  doc.text("TOTAL", rightX, y, { align: "right" });
  y += 3.5;

  // Line Items
  doc.setFont("courier", "normal");
  const items = data.items?.length
    ? data.items
    : [{ description: "POS Counter Sale", quantity: 1, unitPrice: data.amountPaid, lineTotal: data.amountPaid }];

  items.forEach((it) => {
    const maxDescLen = is58mm ? 18 : 28;
    const desc = it.description.length > maxDescLen ? it.description.slice(0, maxDescLen) : it.description;
    doc.text(desc, leftX, y);
    doc.text(formatCurrency(it.lineTotal, currency), rightX, y, { align: "right" });
    y += 3.2;

    if (it.quantity > 1) {
      doc.setFontSize(is58mm ? 6 : 6.5);
      doc.text(`  ${it.quantity} @ ${formatCurrency(it.unitPrice, currency)}`, leftX, y);
      doc.setFontSize(is58mm ? 6.5 : 7.5);
      y += 3.2;
    }
  });

  doc.text(dashLine, centerX, y, { align: "center" });
  y += 4;

  // Financial Subtotals & Totals
  if (data.subtotal && data.subtotal !== data.amountPaid) {
    doc.text("SUBTOTAL:", leftX, y);
    doc.text(formatCurrency(data.subtotal, currency), rightX, y, { align: "right" });
    y += 3.5;
  }
  if (data.taxAmount && data.taxAmount > 0) {
    doc.text("TAX (16% VAT):", leftX, y);
    doc.text(formatCurrency(data.taxAmount, currency), rightX, y, { align: "right" });
    y += 3.5;
  }
  if (data.discountAmount && data.discountAmount > 0) {
    doc.text("DISCOUNT:", leftX, y);
    doc.text(`-${formatCurrency(data.discountAmount, currency)}`, rightX, y, { align: "right" });
    y += 3.5;
  }

  // Bold Grand Total
  doc.setFont("courier", "bold");
  doc.setFontSize(is58mm ? 8.5 : 10);
  doc.text("TOTAL PAID:", leftX, y);
  doc.text(formatCurrency(data.amountPaid, currency), rightX, y, { align: "right" });
  y += 5;

  if (data.outstandingBalance && data.outstandingBalance > 0) {
    doc.setFontSize(is58mm ? 7 : 8);
    doc.text("BALANCE DUE:", leftX, y);
    doc.text(formatCurrency(data.outstandingBalance, currency), rightX, y, { align: "right" });
    y += 4;
  }

  doc.setFont("courier", "normal");
  doc.setFontSize(is58mm ? 6.5 : 7.5);
  doc.text(dashLine, centerX, y, { align: "center" });
  y += 4;

  // Embedded Scannable QR Code
  if (qrDataUrl) {
    try {
      const qrSize = is58mm ? 22 : 26;
      doc.addImage(qrDataUrl, "PNG", centerX - qrSize / 2, y, qrSize, qrSize, undefined, "FAST");
      y += qrSize + 2;

      doc.setFontSize(6);
      doc.text("Scan for digital receipt", centerX, y, { align: "center" });
      y += 3.5;
    } catch (err) {
      console.warn("Thermal QR rendering error:", err);
    }
  }

  // Footer Policy & Patronage
  doc.setFont("courier", "bold");
  doc.setFontSize(is58mm ? 6.5 : 7.5);
  doc.text("THANK YOU FOR YOUR PATRONAGE!", centerX, y, { align: "center" });
  y += 3.5;

  doc.setFont("courier", "normal");
  doc.setFontSize(is58mm ? 6 : 6.5);
  const policy = data.returnPolicy || "Goods once sold are not returnable without this valid receipt.";
  const splitPol = doc.splitTextToSize(policy, rollWidth - 8);
  doc.text(splitPol, centerX, y, { align: "center" });
  y += splitPol.length * 3 + 2;

  doc.setFontSize(5.5);
  doc.text("Powered by SalesmanPro", centerX, y, { align: "center" });

  return doc;
}
