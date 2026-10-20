"use strict";
/**
 * Unified Invoice PDF Renderers (5 Distinct Premium Designs)
 * 1. Modern Corporate (invoice-corporate / invoice-classic)
 * 2. Contemporary Minimal (invoice-minimal / invoice-modern)
 * 3. Premium Business / Luxury Executive (invoice-executive)
 * 4. Retail & POS Compact Invoice (invoice-pos)
 * 5. Branded Creative (invoice-creative)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderInvoiceModern = exports.renderInvoiceClassic = exports.renderInvoiceCreative = exports.renderInvoicePos = exports.renderInvoiceExecutive = exports.renderInvoiceMinimal = exports.renderInvoiceCorporate = void 0;
const jspdf_1 = require("jspdf");
const pdfUtils_1 = require("../pdfUtils");
/**
 * 1. Modern Corporate Invoice (Template 1)
 */
async function renderInvoiceCorporate(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = (0, pdfUtils_1.hexToRgb)(data.company.primaryColor || "#1E3A8A");
    const currency = data.company.currency || "KES";
    // Resolve assets asynchronously
    const [logoImg, qrDataUrl] = await Promise.all([
        (0, pdfUtils_1.resolveImageBase64)(data.company.logoUrl),
        (0, pdfUtils_1.generateQrCodeDataUrl)(`https://salesmanpro.store/verify/invoice/${data.invoiceNumber}?company=${encodeURIComponent(data.company.name)}`),
    ]);
    // Header Brand Area
    const { logoEndX } = (0, pdfUtils_1.drawBrandedHeader)(doc, data.company, logoImg, 14, 14, 40, 16);
    // Company Name & Tagline
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
    // Right Header: INVOICE Title & Metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("INVOICE", pageWidth - 14, 20, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(data.invoiceNumber, pageWidth - 14, 26, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Issue Date: ${(0, pdfUtils_1.formatDate)(data.issueDate)}`, pageWidth - 14, 31, { align: "right" });
    doc.text(`Due Date: ${(0, pdfUtils_1.formatDate)(data.dueDate)}`, pageWidth - 14, 36, { align: "right" });
    const statusVariant = data.status === "PAID" ? "SUCCESS" : data.status === "OVERDUE" ? "DANGER" : "WARNING";
    (0, pdfUtils_1.drawBadge)(doc, data.status, pageWidth - 32, 42, statusVariant);
    // Primary Brand Hairline Divider
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(14, 47, pageWidth - 14, 47);
    // Address Dossiers (Billed From vs Billed To)
    const companyLocation = [data.company.address, data.company.city, data.company.country].filter(Boolean).join(", ");
    const companyLines = [
        companyLocation || "Head Office",
        `Tel: ${data.company.contactPhone || "—"}`,
        `Email: ${data.company.contactEmail || "—"}`,
        data.company.taxPin ? `Tax PIN (KRA): ${data.company.taxPin}` : "",
    ].filter(Boolean);
    const customerLocation = [data.customer.billingAddress, data.customer.shippingAddress].filter(Boolean).join(" | ");
    const customerLines = [
        data.customer.name,
        customerLocation || "Direct Account",
        data.customer.phone ? `Phone: ${data.customer.phone}` : "",
        data.customer.email ? `Email: ${data.customer.email}` : "",
        data.customer.taxId ? `Customer Tax PIN: ${data.customer.taxId}` : "",
    ].filter(Boolean);
    const cardWidth = (pageWidth - 32) / 2;
    (0, pdfUtils_1.drawInfoCard)(doc, 14, 51, cardWidth, 27, "Billed From (Merchant)", companyLines, primaryColor);
    (0, pdfUtils_1.drawInfoCard)(doc, 14 + cardWidth + 4, 51, cardWidth, 27, "Billed To (Client / Customer)", customerLines, [203, 213, 225]);
    // Itemized Table
    const tableRows = data.items.map((it) => [
        it.sku || "—",
        it.description,
        it.quantity.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitPrice, currency),
        it.discount ? `${it.discount}%` : "—",
        it.taxRate ? `${it.taxRate}%` : "0%",
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 83,
        head: [["Item / SKU", "Description", "Qty", "Unit Price", "Discount", "Tax", "Amount"]],
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
            4: { halign: "center", cellWidth: 16 },
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
    const finalY = doc.lastAutoTable.finalY + 6;
    // Financial Breakdown (Right Column)
    const totalsX = pageWidth - 80;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    let curY = finalY;
    const printLine = (label, val, isBold = false, textColor) => {
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        if (textColor)
            doc.setTextColor(...textColor);
        else
            doc.setTextColor(30, 41, 59);
        doc.text(label, totalsX, curY);
        doc.text(val, pageWidth - 14, curY, { align: "right" });
        curY += 5;
    };
    printLine("Subtotal:", (0, pdfUtils_1.formatCurrency)(data.subtotal, currency));
    if (data.discountTotal > 0) {
        printLine("Discount Total:", `-${(0, pdfUtils_1.formatCurrency)(data.discountTotal, currency)}`, false, [225, 29, 72]);
    }
    printLine("Value Added Tax (VAT):", (0, pdfUtils_1.formatCurrency)(data.taxTotal, currency));
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(totalsX, curY - 1, pageWidth - 14, curY - 1);
    curY += 1.5;
    printLine("Grand Total:", (0, pdfUtils_1.formatCurrency)(data.grandTotal, currency), true, primaryColor);
    printLine("Amount Paid:", (0, pdfUtils_1.formatCurrency)(data.amountPaid, currency), false, [5, 150, 105]);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.6);
    doc.line(totalsX, curY - 1, pageWidth - 14, curY - 1);
    curY += 2;
    const dueColor = data.amountDue > 0 ? [225, 29, 72] : [5, 150, 105];
    printLine("Total Balance Due:", (0, pdfUtils_1.formatCurrency)(data.amountDue, currency), true, dueColor);
    // Left Section: Verified Payment Details, QR Code, Notes & Signature
    let leftY = finalY;
    const leftWidth = totalsX - 24;
    if (data.paymentInstructions || data.company.paymentInstructions) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text("PAYMENT INSTRUCTIONS & BANKING", 14, leftY);
        leftY += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const splitInstr = doc.splitTextToSize(data.paymentInstructions || data.company.paymentInstructions || "", leftWidth);
        doc.text(splitInstr, 14, leftY);
        leftY += splitInstr.length * 4 + 4;
    }
    // Draw Verification QR Code
    if (qrDataUrl) {
        (0, pdfUtils_1.drawQrCode)(doc, qrDataUrl, 14, leftY, 20, "Scan to Verify Invoice");
    }
    // Terms & Conditions
    if (data.terms) {
        const termsX = qrDataUrl ? 42 : 14;
        const termsW = totalsX - termsX - 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text("TERMS & CONDITIONS", termsX, leftY + 2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        const splitTerms = doc.splitTextToSize(data.terms, termsW);
        doc.text(splitTerms, termsX, leftY + 6);
    }
    // Signature Block
    (0, pdfUtils_1.drawSignatureBlock)(doc, totalsX - 2, curY + 6, 66, "Authorized Signatory", data.company.name, "Finance & Billing Dept");
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderInvoiceCorporate = renderInvoiceCorporate;
/**
 * 2. Contemporary Minimal Invoice (Template 2)
 */
async function renderInvoiceMinimal(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const currency = data.company.currency || "KES";
    const [logoImg, qrDataUrl] = await Promise.all([
        (0, pdfUtils_1.resolveImageBase64)(data.company.logoUrl),
        (0, pdfUtils_1.generateQrCodeDataUrl)(`https://salesmanpro.store/verify/invoice/${data.invoiceNumber}`),
    ]);
    // Top Dark Slate Full-Width Banner
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 42, "F");
    // Accent Line under banner
    const accentColor = (0, pdfUtils_1.hexToRgb)(data.company.accentColor || "#6366F1");
    doc.setFillColor(...accentColor);
    doc.rect(0, 42, pageWidth, 2, "F");
    // Logo / Monogram inside banner
    const { logoEndX } = (0, pdfUtils_1.drawBrandedHeader)(doc, data.company, logoImg, 14, 11, 38, 16);
    // Company Brand in banner
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(data.company.name, logoEndX + 2, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const contactText = [data.company.address, data.company.contactPhone, data.company.contactEmail].filter(Boolean).join("  •  ");
    doc.text(contactText, logoEndX + 2, 26);
    // Large Invoice Header (Right of banner)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...accentColor);
    doc.text("TAX INVOICE", pageWidth - 14, 19, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(data.invoiceNumber, pageWidth - 14, 26, { align: "right" });
    // Status & Date Strip
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 48, pageWidth - 28, 15, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("ISSUE DATE", 20, 53.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text((0, pdfUtils_1.formatDate)(data.issueDate), 20, 58.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("DUE DATE", 65, 53.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text((0, pdfUtils_1.formatDate)(data.dueDate), 65, 58.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("CURRENCY", 110, 53.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(currency, 110, 58.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("STATUS", 150, 53.5);
    const statusVar = data.status === "PAID" ? "SUCCESS" : data.status === "OVERDUE" ? "DANGER" : "WARNING";
    (0, pdfUtils_1.drawBadge)(doc, data.status, 150, 59.5, statusVar);
    // Customer Card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 67, pageWidth - 28, 18, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...accentColor);
    doc.text("CLIENT / BILLED TO:", 20, 72.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.customer.name, 20, 78);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const custContact = [data.customer.email, data.customer.phone, data.customer.taxId ? `Tax PIN: ${data.customer.taxId}` : ""].filter(Boolean).join("  •  ");
    doc.text(custContact, 20, 82.5);
    // Minimal Table
    const tableRows = data.items.map((it) => [
        it.description,
        it.quantity.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitPrice, currency),
        it.discount ? `${it.discount}%` : "—",
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 89,
        head: [["Item Description", "Qty", "Unit Price", "Discount", "Total Amount"]],
        body: tableRows,
        theme: "plain",
        headStyles: {
            fillColor: [248, 250, 252],
            textColor: [15, 23, 42],
            fontStyle: "bold",
            fontSize: 8.5,
            halign: "left",
        },
        columnStyles: {
            0: { cellWidth: "auto" },
            1: { halign: "center", cellWidth: 18 },
            2: { halign: "right", cellWidth: 32 },
            3: { halign: "center", cellWidth: 20 },
            4: { halign: "right", cellWidth: 36, fontStyle: "bold" },
        },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [226, 232, 240],
            lineWidth: 0.2,
        },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 8;
    // Modern Totals
    const totalsX = pageWidth - 76;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    let curY = finalY;
    const printRow = (lbl, val, bold = false, color) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        if (color)
            doc.setTextColor(...color);
        else
            doc.setTextColor(15, 23, 42);
        doc.text(lbl, totalsX, curY);
        doc.text(val, pageWidth - 14, curY, { align: "right" });
        curY += 5;
    };
    printRow("Subtotal", (0, pdfUtils_1.formatCurrency)(data.subtotal, currency));
    if (data.discountTotal > 0)
        printRow("Discount", `-${(0, pdfUtils_1.formatCurrency)(data.discountTotal, currency)}`, false, [225, 29, 72]);
    printRow("VAT / Sales Tax", (0, pdfUtils_1.formatCurrency)(data.taxTotal, currency));
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(totalsX, curY - 1, pageWidth - 14, curY - 1);
    curY += 1.5;
    printRow("Grand Total", (0, pdfUtils_1.formatCurrency)(data.grandTotal, currency), true, [15, 23, 42]);
    printRow("Paid to Date", (0, pdfUtils_1.formatCurrency)(data.amountPaid, currency), false, [5, 150, 105]);
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.6);
    doc.line(totalsX, curY - 1, pageWidth - 14, curY - 1);
    curY += 2;
    printRow("Balance Due", (0, pdfUtils_1.formatCurrency)(data.amountDue, currency), true, data.amountDue > 0 ? [225, 29, 72] : [5, 150, 105]);
    // Left side payment instructions & QR
    if (qrDataUrl) {
        (0, pdfUtils_1.drawQrCode)(doc, qrDataUrl, 14, finalY, 18, "Scan to Pay / Verify");
    }
    if (data.paymentInstructions || data.company.paymentInstructions) {
        const instrX = qrDataUrl ? 38 : 14;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text("PAYMENT METHOD & INSTRUCTIONS", instrX, finalY + 3);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const split = doc.splitTextToSize(data.paymentInstructions || data.company.paymentInstructions || "", totalsX - instrX - 4);
        doc.text(split, instrX, finalY + 8);
    }
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderInvoiceMinimal = renderInvoiceMinimal;
/**
 * 3. Premium Business / Luxury Executive Invoice (Template 3)
 */
async function renderInvoiceExecutive(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const currency = data.company.currency || "KES";
    const emeraldColor = [4, 120, 87]; // Emerald 700
    const goldColor = [180, 83, 9]; // Amber 700
    const [logoImg, qrDataUrl] = await Promise.all([
        (0, pdfUtils_1.resolveImageBase64)(data.company.logoUrl),
        (0, pdfUtils_1.generateQrCodeDataUrl)(`https://salesmanpro.store/verify/invoice/${data.invoiceNumber}?luxury=true`),
    ]);
    // Elegant top gold accent ribbon
    doc.setFillColor(...goldColor);
    doc.rect(0, 0, pageWidth, 4, "F");
    // Executive Header
    const { logoEndX } = (0, pdfUtils_1.drawBrandedHeader)(doc, data.company, logoImg, 14, 10, 42, 16);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...emeraldColor);
    doc.text(data.company.name, logoEndX + 2, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text([data.company.address, data.company.city, `Tel: ${data.company.contactPhone || ""}`].filter(Boolean).join(" | "), logoEndX + 2, 23.5);
    if (data.company.taxPin) {
        doc.text(`Statutory Tax ID: ${data.company.taxPin}`, logoEndX + 2, 28);
    }
    // Right Title Area
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("COMMERCIAL TAX INVOICE", pageWidth - 14, 18, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...goldColor);
    doc.text(`REF: ${data.invoiceNumber}`, pageWidth - 14, 24, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Date of Issue: ${(0, pdfUtils_1.formatDate)(data.issueDate)}`, pageWidth - 14, 29, { align: "right" });
    doc.text(`Payment Due: ${(0, pdfUtils_1.formatDate)(data.dueDate)}`, pageWidth - 14, 34, { align: "right" });
    (0, pdfUtils_1.drawBadge)(doc, data.status, pageWidth - 32, 40, data.status === "PAID" ? "SUCCESS" : "WARNING");
    // Double hairline separator
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(0.5);
    doc.line(14, 44, pageWidth - 14, 44);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(14, 45.5, pageWidth - 14, 45.5);
    // Client Dossier Box
    doc.setFillColor(250, 250, 249); // Stone 50
    doc.setDrawColor(231, 229, 228);
    doc.roundedRect(14, 49, pageWidth - 28, 24, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...goldColor);
    doc.text("PRINCIPAL CLIENT & RECIPIENT", 20, 54.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.customer.name, 20, 61);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const clientLines = [
        data.customer.billingAddress,
        data.customer.email ? `Email: ${data.customer.email}` : "",
        data.customer.phone ? `Phone: ${data.customer.phone}` : "",
        data.customer.taxId ? `KRA Tax PIN: ${data.customer.taxId}` : "",
    ].filter(Boolean).join("   •   ");
    doc.text(clientLines, 20, 67);
    // Itemized Table
    const tableRows = data.items.map((it) => [
        it.sku || "—",
        it.description,
        it.quantity.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitPrice, currency),
        it.taxRate ? `${it.taxRate}%` : "0%",
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 77,
        head: [["Item Reference", "Description of Goods & Services", "Qty", "Unit Price", "VAT", "Total"]],
        body: tableRows,
        theme: "grid",
        headStyles: {
            fillColor: emeraldColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8.5,
        },
        columnStyles: {
            0: { cellWidth: 26, font: "courier", fontSize: 8 },
            1: { cellWidth: "auto" },
            2: { halign: "center", cellWidth: 14 },
            3: { halign: "right", cellWidth: 30 },
            4: { halign: "center", cellWidth: 16 },
            5: { halign: "right", cellWidth: 32, fontStyle: "bold" },
        },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [231, 229, 228],
        },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 8;
    // Right Totals Frame
    const totalsX = pageWidth - 80;
    doc.setFillColor(250, 250, 249);
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(totalsX - 4, finalY, 70, 36, 1.5, 1.5, "FD");
    let curY = finalY + 6;
    const printSum = (lbl, val, bold = false, col = emeraldColor) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(bold ? col[0] : 100, bold ? col[1] : 116, bold ? col[2] : 139);
        doc.setFontSize(bold ? 9.5 : 8);
        doc.text(lbl, totalsX, curY);
        doc.text(val, pageWidth - 18, curY, { align: "right" });
        curY += 6;
    };
    printSum("Subtotal:", (0, pdfUtils_1.formatCurrency)(data.subtotal, currency));
    printSum("Statutory VAT (16%):", (0, pdfUtils_1.formatCurrency)(data.taxTotal, currency));
    printSum("TOTAL DUE:", (0, pdfUtils_1.formatCurrency)(data.grandTotal, currency), true, emeraldColor);
    printSum("Amount Cleared:", (0, pdfUtils_1.formatCurrency)(data.amountPaid, currency), false, [5, 150, 105]);
    printSum("Net Balance Due:", (0, pdfUtils_1.formatCurrency)(data.amountDue, currency), true, goldColor);
    // Left Verification and Sign-off
    if (qrDataUrl) {
        (0, pdfUtils_1.drawQrCode)(doc, qrDataUrl, 14, finalY, 20, "Fiscal Authenticity Seal");
    }
    (0, pdfUtils_1.drawSignatureBlock)(doc, 44, finalY + 2, 54, "Certified By Officer", data.company.name, "Executive Officer");
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderInvoiceExecutive = renderInvoiceExecutive;
/**
 * 4. Retail & POS Compact Invoice (Template 4)
 */
async function renderInvoicePos(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = (0, pdfUtils_1.hexToRgb)(data.company.primaryColor || "#0284C7");
    const currency = data.company.currency || "KES";
    const [logoImg, qrDataUrl] = await Promise.all([
        (0, pdfUtils_1.resolveImageBase64)(data.company.logoUrl),
        (0, pdfUtils_1.generateQrCodeDataUrl)(`https://salesmanpro.store/verify/pos/${data.invoiceNumber}`),
    ]);
    // POS Store Header
    const { logoEndX } = (0, pdfUtils_1.drawBrandedHeader)(doc, data.company, logoImg, 14, 12, 36, 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text(data.company.name, logoEndX + 2, 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`POS & Retail Counter Sale  |  ${data.company.address || ""}`, logoEndX + 2, 24);
    // Right side receipt / invoice code
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`TXN: ${data.invoiceNumber}`, pageWidth - 14, 19, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Time: ${(0, pdfUtils_1.formatDate)(data.issueDate)}`, pageWidth - 14, 24, { align: "right" });
    doc.text(`Customer: ${data.customer.name}`, pageWidth - 14, 29, { align: "right" });
    // Divider
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.6);
    doc.line(14, 34, pageWidth - 14, 34);
    // POS Items Table
    const tableRows = data.items.map((it) => [
        it.sku || "—",
        it.description,
        it.quantity.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitPrice, currency),
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 38,
        head: [["Code", "Item Description", "Qty", "Unit Price", "Total"]],
        body: tableRows,
        theme: "striped",
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8,
        },
        columnStyles: {
            0: { cellWidth: 24, font: "courier", fontSize: 7.5 },
            1: { cellWidth: "auto" },
            2: { halign: "center", cellWidth: 16 },
            3: { halign: "right", cellWidth: 28 },
            4: { halign: "right", cellWidth: 32, fontStyle: "bold" },
        },
        styles: { fontSize: 7.5, cellPadding: 2.2 },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 6;
    // Bottom Summary
    const totalsX = pageWidth - 70;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    let curY = finalY;
    doc.text("TOTAL DUE:", totalsX, curY);
    doc.text((0, pdfUtils_1.formatCurrency)(data.grandTotal, currency), pageWidth - 14, curY, { align: "right" });
    curY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Paid Amount:", totalsX, curY);
    doc.text((0, pdfUtils_1.formatCurrency)(data.amountPaid, currency), pageWidth - 14, curY, { align: "right" });
    curY += 5;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(225, 29, 72);
    doc.text("Balance:", totalsX, curY);
    doc.text((0, pdfUtils_1.formatCurrency)(data.amountDue, currency), pageWidth - 14, curY, { align: "right" });
    if (qrDataUrl) {
        (0, pdfUtils_1.drawQrCode)(doc, qrDataUrl, 14, finalY, 18, "Quick Verification QR");
    }
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderInvoicePos = renderInvoicePos;
/**
 * 5. Branded Creative Invoice (Template 5)
 */
async function renderInvoiceCreative(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = (0, pdfUtils_1.hexToRgb)(data.company.primaryColor || "#7C3AED"); // Violet 600
    const accentColor = (0, pdfUtils_1.hexToRgb)(data.company.accentColor || "#EC4899"); // Pink 500
    const currency = data.company.currency || "KES";
    const [logoImg, qrDataUrl] = await Promise.all([
        (0, pdfUtils_1.resolveImageBase64)(data.company.logoUrl),
        (0, pdfUtils_1.generateQrCodeDataUrl)(`https://salesmanpro.store/verify/creative/${data.invoiceNumber}`),
    ]);
    // Vibrant Asymmetric Top Pill Graphic
    doc.setFillColor(...primaryColor);
    doc.roundedRect(14, 12, pageWidth - 28, 32, 3, 3, "F");
    // Logo & Title inside Creative Header
    const { logoEndX } = (0, pdfUtils_1.drawBrandedHeader)(doc, data.company, logoImg, 20, 18, 36, 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(data.company.name, logoEndX + 2, 26);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(233, 213, 255);
    doc.text(data.company.tagline || "Creative Business & Design Studio", logoEndX + 2, 32);
    // Right Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pageWidth - 22, 26, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(245, 208, 254);
    doc.text(data.invoiceNumber, pageWidth - 22, 32, { align: "right" });
    // Creative Client Bar
    doc.setFillColor(250, 245, 255); // Purple 50
    doc.roundedRect(14, 48, pageWidth - 28, 16, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text("BILLED TO CREATIVE PARTNER:", 20, 54);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.customer.name, 20, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Due Date: ${(0, pdfUtils_1.formatDate)(data.dueDate)}`, pageWidth - 22, 57, { align: "right" });
    // Creative Styled Table
    const tableRows = data.items.map((it) => [
        it.description,
        it.quantity.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitPrice, currency),
        it.discount ? `${it.discount}%` : "0%",
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 68,
        head: [["Project Deliverable / Service", "Qty", "Rate", "Disc", "Total"]],
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
    const finalY = doc.lastAutoTable.finalY + 6;
    // Creative Totals
    const totalsX = pageWidth - 76;
    doc.setFillColor(...primaryColor);
    doc.roundedRect(totalsX - 4, finalY, 66, 26, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(233, 213, 255);
    doc.text("TOTAL DUE", totalsX + 2, finalY + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text((0, pdfUtils_1.formatCurrency)(data.grandTotal, currency), totalsX + 2, finalY + 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(245, 208, 254);
    doc.text(`Balance Due: ${(0, pdfUtils_1.formatCurrency)(data.amountDue, currency)}`, totalsX + 2, finalY + 22);
    if (qrDataUrl) {
        (0, pdfUtils_1.drawQrCode)(doc, qrDataUrl, 14, finalY, 18, "Scan to Pay");
    }
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderInvoiceCreative = renderInvoiceCreative;
// Backward-compatibility aliases
exports.renderInvoiceClassic = renderInvoiceCorporate;
exports.renderInvoiceModern = renderInvoiceMinimal;
