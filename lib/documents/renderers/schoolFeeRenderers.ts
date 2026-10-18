/**
 * School Fee PDF Renderers
 * 1. Academic Classic Fee Invoice — Official school crest, vote heads, verified paybill/bank & bursar stamp
 * 2. Modern Card Fee Invoice — Clean, contemporary card layout for modern schools & academies
 * 3. Standard A4/A5 School Fee Receipt — Official school bursary payment voucher with dual copy option
 * 4. Thermal Roll School Fee Receipt (80mm & 58mm) — Instant counter POS printing for school cashiers
 */

import { jsPDF } from "jspdf";
import { InvoiceDocumentData, ReceiptDocumentData } from "../types";
import {
  callAutoTable,
  drawBrandedHeader,
  drawInfoCard,
  drawPaymentBlock,
  drawSignatureBlock,
  drawQrCode,
  addPageNumbersAndFooters,
  formatCurrency,
  formatDate,
  hexToRgb,
  generateQrCodeDataUrl,
  resolveImageBase64,
} from "../pdfUtils";

/**
 * 1. Academic Classic School Fee Invoice (Official School Crest, Vote Heads, Verified Bursar Box)
 */
export async function renderSchoolFeeInvoiceAcademic(data: InvoiceDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor = hexToRgb(data.company.primaryColor || "#1E3A8A"); // Collegiate Navy

  // 1. School Branded Header (Emblem/Logo with aspect ratio + School Address + KRA PIN)
  const logoImg = await resolveImageBase64(data.company.logoUrl);
  const { logoEndX, logoEndY } = drawBrandedHeader(doc, data.company, logoImg, 14, 12, 36, 16);

  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(data.company.name.toUpperCase(), logoEndX + 2, 18);

  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(197, 160, 89);
  if (data.company.tagline) {
    doc.text(`"${data.company.tagline}"`, logoEndX + 2, 22.5);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const contactLine = [
    data.company.address,
    data.company.contactPhone ? `Tel: ${data.company.contactPhone}` : "",
    data.company.taxPin ? `Tax PIN: ${data.company.taxPin}` : "",
  ].filter(Boolean).join("  •  ");
  doc.text(contactLine, logoEndX + 2, 27, { maxWidth: pageWidth - logoEndX - 16 });

  // 2. Academic Term & Invoice Banner
  const bannerY = Math.max(logoEndY + 4, 34);
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, bannerY, pageWidth - 28, 8, 1, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  const termTitle = data.orderReference || "OFFICIAL STUDENT FEE ASSESSMENT";
  doc.text(termTitle.toUpperCase(), 18, bannerY + 5.5);

  doc.text(
    `INVOICE #: ${data.invoiceNumber}  •  DUE: ${formatDate(data.dueDate)}`,
    pageWidth - 18,
    bannerY + 5.5,
    { align: "right" }
  );

  // 3. Two-Column Student Profile & Institutional Billing Cards
  const cardY = bannerY + 11;
  const cardW = (pageWidth - 32) / 2;

  const studentDetails = [
    `Student Name: ${data.customer.name}`,
    data.customer.billingAddress ? data.customer.billingAddress : "",
    data.customer.phone ? `Parent / Sponsor Tel: ${data.customer.phone}` : "",
    data.customer.email ? `Guardian Email: ${data.customer.email}` : "",
  ].filter(Boolean);

  const billingMeta = [
    `Billing Date: ${formatDate(data.issueDate)}`,
    `Payment Deadline: ${formatDate(data.dueDate)}`,
    `Currency: ${data.company.currency || "KES"}`,
    `Status: ${data.status.replace(/_/g, " ")}`,
  ];

  drawInfoCard(doc, 14, cardY, cardW, 26, "Student & Guardian Information", studentDetails);
  drawInfoCard(doc, 14 + cardW + 4, cardY, cardW, 26, "Fee Account Placement", billingMeta);

  // 4. Itemized School Fee Vote Heads Table
  const tableRows = data.items.map((item, idx) => [
    (idx + 1).toString(),
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, data.company.currency),
    formatCurrency(item.lineTotal, data.company.currency),
  ]);

  callAutoTable(doc, {
    startY: cardY + 30,
    head: [["#", "Vote Head / Fee Description", "Qty", "Rate", "Amount"]],
    body: tableRows,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto", fontStyle: "bold" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.4 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // 5. Financial Summary Box (Right Side)
  const summaryW = 82;
  const summaryX = pageWidth - 14 - summaryW;
  const summaryY = finalY;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryX, summaryY, summaryW, 28, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  let curY = summaryY + 5.5;
  doc.text("Total Fees Invoiced:", summaryX + 4, curY);
  doc.text(formatCurrency(data.grandTotal, data.company.currency), pageWidth - 18, curY, { align: "right" });

  curY += 5.5;
  doc.setTextColor(16, 185, 129); // Green
  doc.text("Total Amount Paid:", summaryX + 4, curY);
  doc.text(formatCurrency(data.amountPaid, data.company.currency), pageWidth - 18, curY, { align: "right" });

  curY += 4.5;
  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX + 4, curY, pageWidth - 18, curY);

  curY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  if (data.amountDue > 0) {
    doc.setTextColor(225, 29, 72); // Rose Red
    doc.text("BALANCE DUE:", summaryX + 4, curY);
    doc.text(formatCurrency(data.amountDue, data.company.currency), pageWidth - 18, curY, { align: "right" });
  } else if (data.amountDue < 0) {
    doc.setTextColor(37, 99, 235); // Blue
    doc.text("PREPAID CREDIT:", summaryX + 4, curY);
    doc.text(formatCurrency(Math.abs(data.amountDue), data.company.currency), pageWidth - 18, curY, { align: "right" });
  } else {
    doc.setTextColor(16, 185, 129); // Green
    doc.text("BALANCE DUE:", summaryX + 4, curY);
    doc.text("CLEARED (0.00)", pageWidth - 18, curY, { align: "right" });
  }

  // 6. Verified School Bank / M-Pesa Payment Box (Left Side)
  const payW = pageWidth - 28 - summaryW - 6;
  drawPaymentBlock(doc, data.company, 14, summaryY, payW, 28);

  // 7. Security QR Code (for online verification / mobile fee check)
  const qrDataUrl = await generateQrCodeDataUrl(
    `https://salesmanpro.com/verify/fee-invoice/${data.invoiceNumber}?school=${encodeURIComponent(data.company.name)}`
  );
  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, 14, summaryY + 31, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Scan QR to verify official school fee invoice record.", 33, summaryY + 38);
    doc.text("Accounts Office Bursary Desk • SalesmanPro Education Ledger", 33, summaryY + 42);
  }

  // 8. Signatures: School Bursar & Class Teacher / Principal
  drawSignatureBlock(
    doc,
    14,
    pageHeight - 26,
    pageWidth - 28,
    "School Bursar / Accounts Office",
    "Headteacher / Principal Signature & Stamp"
  );

  addPageNumbersAndFooters(
    doc,
    data.footerText || `Official Academic Fee Invoice — ${data.company.name}`,
    data.company.name
  );
  return doc;
}

/**
 * 2. Modern Card School Fee Invoice (Contemporary Emerald & Royal Slate)
 */
export async function renderSchoolFeeInvoiceModern(data: InvoiceDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const emeraldColor: [number, number, number] = [5, 150, 105]; // Emerald 600

  // Modern Accent Bar
  doc.setFillColor(...emeraldColor);
  doc.rect(0, 0, pageWidth, 5, "F");

  // Header with logo/monogram
  const logoImg = await resolveImageBase64(data.company.logoUrl);
  const { logoEndX, logoEndY } = drawBrandedHeader(doc, data.company, logoImg, 14, 12, 34, 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(data.company.name, logoEndX + 2, 19);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const metaLine = [data.company.address, data.company.contactEmail].filter(Boolean).join(" • ");
  doc.text(metaLine, logoEndX + 2, 24);

  // Student Details Strip
  const stripY = Math.max(logoEndY + 4, 34);
  doc.setFillColor(240, 253, 250); // Emerald 50
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(14, stripY, pageWidth - 28, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`STUDENT: ${data.customer.name}`, 18, stripY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(data.customer.billingAddress || `Student Ref: ${data.customer.name}`, 18, stripY + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...emeraldColor);
  doc.text(`INVOICE: ${data.invoiceNumber}`, pageWidth - 18, stripY + 6, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Due: ${formatDate(data.dueDate)}`, pageWidth - 18, stripY + 11, { align: "right" });

  // Items Table
  const tableRows = data.items.map((item, idx) => [
    (idx + 1).toString(),
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, data.company.currency),
    formatCurrency(item.lineTotal, data.company.currency),
  ]);

  callAutoTable(doc, {
    startY: stripY + 20,
    head: [["#", "Fee Item Description", "Qty", "Rate", "Amount"]],
    body: tableRows,
    headStyles: {
      fillColor: emeraldColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto", fontStyle: "bold" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    styles: { fontSize: 8, cellPadding: 2.2 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // Summary & Payment Boxes
  const summaryW = 82;
  const summaryX = pageWidth - 14 - summaryW;
  const payW = pageWidth - 28 - summaryW - 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryX, finalY, summaryW, 26, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Total Fees Due:", summaryX + 4, finalY + 6);
  doc.text(formatCurrency(data.grandTotal, data.company.currency), pageWidth - 18, finalY + 6, { align: "right" });

  doc.text("Amount Paid:", summaryX + 4, finalY + 12);
  doc.text(formatCurrency(data.amountPaid, data.company.currency), pageWidth - 18, finalY + 12, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(225, 29, 72);
  doc.text("BALANCE DUE:", summaryX + 4, finalY + 20);
  doc.text(formatCurrency(Math.max(0, data.amountDue), data.company.currency), pageWidth - 18, finalY + 20, {
    align: "right",
  });

  drawPaymentBlock(doc, data.company, 14, finalY, payW, 26);

  // QR Code
  const qrDataUrl = await generateQrCodeDataUrl(`https://salesmanpro.com/verify/invoice/${data.invoiceNumber}`);
  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, 14, finalY + 29, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Verified School Fee Statement • Powered by SalesmanPro", 30, finalY + 36);
  }

  drawSignatureBlock(doc, 14, pageHeight - 26, pageWidth - 28, "Bursar Signature", "School Stamp & Approval");
  addPageNumbersAndFooters(doc, data.footerText, data.company.name);
  return doc;
}

/**
 * 3. Standard A4/A5 Official School Fee Payment Receipt (With Bursary Stamp)
 */
export async function renderSchoolFeeReceiptStandard(data: ReceiptDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor = hexToRgb(data.company.primaryColor || "#1E3A8A");

  // Header with School Branding
  const logoImg = await resolveImageBase64(data.company.logoUrl);
  const { logoEndX, logoEndY } = drawBrandedHeader(doc, data.company, logoImg, 14, 12, 34, 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(data.company.name.toUpperCase(), logoEndX + 2, 19);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const metaLine = [data.company.address, data.company.contactPhone ? `Tel: ${data.company.contactPhone}` : ""].filter(Boolean).join(" • ");
  doc.text(metaLine, logoEndX + 2, 24);

  // Receipt Number & Date Banner
  const bannerY = Math.max(logoEndY + 4, 34);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, bannerY, pageWidth - 28, 12, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`RECEIPT NO: ${data.receiptNumber}`, 18, bannerY + 5);
  doc.text(`DATE: ${formatDate(data.paymentDate)}`, pageWidth - 18, bannerY + 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Method: ${data.paymentMethod}  |  Ref: ${data.transactionReference}`, 18, bannerY + 9.5);
  if (data.invoiceReference) {
    doc.text(`Fee Invoice: ${data.invoiceReference}`, pageWidth - 18, bannerY + 9.5, { align: "right" });
  }

  // Student Info Box
  const studentInfoY = bannerY + 15;
  drawInfoCard(
    doc,
    14,
    studentInfoY,
    pageWidth - 28,
    18,
    "Student & Payment Particulars",
    [
      `Student Name: ${data.customer?.name || "Student"}`,
      data.notes ? `Remarks: ${data.notes}` : "",
      `Cashier / Bursar: ${data.cashierName || "School Accounts Office"}`,
    ].filter(Boolean)
  );

  // Line Item Table
  const tableRows = (data.items || []).map((item, idx) => [
    (idx + 1).toString(),
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, data.company.currency),
    formatCurrency(item.lineTotal, data.company.currency),
  ]);

  if (tableRows.length === 0) {
    tableRows.push([
      "1",
      `School Fee Installment Payment (${data.paymentMethod})`,
      "1",
      formatCurrency(data.amountPaid, data.company.currency),
      formatCurrency(data.amountPaid, data.company.currency),
    ]);
  }

  callAutoTable(doc, {
    startY: studentInfoY + 22,
    head: [["#", "Payment Description", "Qty", "Amount Paid", "Total"]],
    body: tableRows,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto", fontStyle: "bold" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    styles: { fontSize: 8, cellPadding: 2.2 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 5;

  // Receipt Financial Card
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(pageWidth - 94, finalY, 80, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  doc.text("AMOUNT RECEIVED:", pageWidth - 90, finalY + 7);
  doc.text(formatCurrency(data.amountPaid, data.company.currency), pageWidth - 18, finalY + 7, { align: "right" });

  if (data.outstandingBalance !== undefined) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Remaining Fee Balance:", pageWidth - 90, finalY + 14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(data.outstandingBalance > 0 ? 225 : 16, data.outstandingBalance > 0 ? 29 : 185, data.outstandingBalance > 0 ? 72 : 129);
    doc.text(formatCurrency(data.outstandingBalance, data.company.currency), pageWidth - 18, finalY + 14, {
      align: "right",
    });
  }

  // QR Code
  const qrDataUrl = await generateQrCodeDataUrl(
    `https://salesmanpro.com/verify/receipt/${data.receiptNumber}?student=${encodeURIComponent(data.customer?.name || "")}`
  );
  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, 14, finalY, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Official electronic receipt issued by School Administration.", 36, finalY + 8);
    doc.text("All fee payments are non-refundable and subject to school policy.", 36, finalY + 13);
  }

  drawSignatureBlock(
    doc,
    14,
    pageHeight - 26,
    pageWidth - 28,
    "Bursar / Cashier Signature",
    "Official School Rubber Stamp"
  );

  addPageNumbersAndFooters(
    doc,
    data.footerText || `Official Fee Receipt — ${data.company.name}`,
    data.company.name
  );
  return doc;
}

/**
 * 4. Thermal Roll School Fee Receipt (80mm & 58mm POS roll for School Bursar Desks)
 */
export async function renderSchoolFeeReceiptThermal(data: ReceiptDocumentData): Promise<jsPDF> {
  const is58mm = data.paperWidth === "58mm";
  const rollWidth = is58mm ? 58 : 80;
  const margin = is58mm ? 3 : 5;
  const printWidth = rollWidth - margin * 2;

  const itemCount = (data.items || []).length || 1;
  const dynamicHeight = Math.max(is58mm ? 120 : 130, 85 + itemCount * 7 + 45);

  const doc = new jsPDF({
    unit: "mm",
    format: [rollWidth, dynamicHeight],
  });

  let curY = 6;

  // School Name
  doc.setFont("courier", "bold");
  doc.setFontSize(is58mm ? 9 : 11);
  doc.setTextColor(0, 0, 0);
  doc.text(data.company.name.toUpperCase(), rollWidth / 2, curY, {
    align: "center",
    maxWidth: printWidth,
  });

  curY += 4.5;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  if (data.company.address) {
    doc.text(data.company.address, rollWidth / 2, curY, { align: "center", maxWidth: printWidth });
    curY += 3.5;
  }
  if (data.company.contactPhone) {
    doc.text(`Tel: ${data.company.contactPhone}`, rollWidth / 2, curY, { align: "center" });
    curY += 3.5;
  }

  // Divider
  doc.text("-".repeat(is58mm ? 28 : 38), rollWidth / 2, curY, { align: "center" });
  curY += 3.5;

  // Title
  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  doc.text("OFFICIAL SCHOOL FEE RECEIPT", rollWidth / 2, curY, { align: "center" });
  curY += 4;

  // Metadata
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text(`Receipt: ${data.receiptNumber}`, margin, curY);
  curY += 3.5;
  doc.text(`Date: ${formatDate(data.paymentDate)}`, margin, curY);
  curY += 3.5;
  if (data.customer?.name) {
    doc.setFont("courier", "bold");
    doc.text(`Student: ${data.customer.name}`, margin, curY);
    curY += 3.5;
  }
  if (data.notes) {
    doc.setFont("courier", "normal");
    doc.text(data.notes, margin, curY, { maxWidth: printWidth });
    curY += 3.5;
  }
  doc.text(`Cashier: ${data.cashierName || "Bursar Desk"}`, margin, curY);
  curY += 3.5;

  // Divider
  doc.text("-".repeat(is58mm ? 28 : 38), rollWidth / 2, curY, { align: "center" });
  curY += 4;

  // Line items
  doc.setFont("courier", "bold");
  doc.text("FEE ITEM", margin, curY);
  doc.text("AMOUNT", rollWidth - margin, curY, { align: "right" });
  curY += 3.5;

  doc.setFont("courier", "normal");
  const items = data.items && data.items.length > 0
    ? data.items
    : [{ description: "Fee Installment", quantity: 1, unitPrice: data.amountPaid, lineTotal: data.amountPaid }];

  for (const item of items) {
    doc.text(item.description.slice(0, is58mm ? 18 : 26), margin, curY);
    doc.text(formatCurrency(item.lineTotal, data.company.currency), rollWidth - margin, curY, { align: "right" });
    curY += 3.5;
  }

  doc.text("-".repeat(is58mm ? 28 : 38), rollWidth / 2, curY, { align: "center" });
  curY += 4;

  // Financial Totals
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL PAID:", margin, curY);
  doc.text(formatCurrency(data.amountPaid, data.company.currency), rollWidth - margin, curY, { align: "right" });
  curY += 4.5;

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.text(`Paid Via: ${data.paymentMethod}`, margin, curY);
  curY += 3.5;
  doc.text(`Ref: ${data.transactionReference}`, margin, curY);
  curY += 3.5;

  if (data.outstandingBalance !== undefined) {
    doc.setFont("courier", "bold");
    doc.text(`Balance Due: ${formatCurrency(data.outstandingBalance, data.company.currency)}`, margin, curY);
    curY += 4;
  }

  // QR Code
  const qrDataUrl = await generateQrCodeDataUrl(
    `https://salesmanpro.com/verify/receipt/${data.receiptNumber}`
  );
  if (qrDataUrl) {
    const qrSize = is58mm ? 18 : 22;
    drawQrCode(doc, qrDataUrl, (rollWidth - qrSize) / 2, curY, qrSize);
    curY += qrSize + 3;
  }

  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.text("Thank you for your fee payment.", rollWidth / 2, curY, { align: "center" });
  curY += 3;
  doc.text("SalesmanPro School Bursary System", rollWidth / 2, curY, { align: "center" });

  return doc;
}
