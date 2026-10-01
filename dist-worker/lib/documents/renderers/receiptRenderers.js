"use strict";
/**
 * Receipt PDF Renderers (3 Distinct Designs)
 * 1. Official A4 Payment Receipt (receipt-standard)
 * 2. Payment Voucher / Slip (receipt-voucher)
 * 3. Thermal POS Receipt 58mm/80mm (receipt-thermal)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderReceiptThermal = exports.renderReceiptVoucher = exports.renderReceiptStandard = void 0;
const jspdf_1 = require("jspdf");
const pdfUtils_1 = require("../pdfUtils");
/**
 * 1. Official A4 Payment Receipt
 */
function renderReceiptStandard(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = (0, pdfUtils_1.hexToRgb)(data.company.primaryColor || "#059669");
    const currency = data.company.currency || "KES";
    // Official Receipt Header
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
    // Right Title & Meta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("PAYMENT RECEIPT", pageWidth - 14, 20, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Receipt #: ${data.receiptNumber}`, pageWidth - 14, 26, { align: "right" });
    doc.text(`Payment Date: ${(0, pdfUtils_1.formatDate)(data.paymentDate)}`, pageWidth - 14, 31, { align: "right" });
    doc.text(`Method: ${data.paymentMethod}`, pageWidth - 14, 36, { align: "right" });
    doc.text(`Txn Ref: ${data.transactionReference}`, pageWidth - 14, 41, { align: "right" });
    // Divider
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(14, 46, pageWidth - 14, 46);
    // Payer & Issuer Info Cards
    const issuerLines = [
        data.company.address || "",
        `Tel: ${data.company.contactPhone || "—"}`,
        `Email: ${data.company.contactEmail || "—"}`,
        data.company.taxPin ? `Tax PIN: ${data.company.taxPin}` : "",
    ].filter(Boolean);
    const payerLines = [
        data.customer?.name || "Customer / Walk-in Client",
        data.customer?.phone ? `Phone: ${data.customer.phone}` : "",
        data.customer?.email ? `Email: ${data.customer.email}` : "",
        data.invoiceReference ? `Invoice Reference: ${data.invoiceReference}` : "",
        data.orderReference ? `Order Reference: ${data.orderReference}` : "",
    ].filter(Boolean);
    (0, pdfUtils_1.drawInfoCard)(doc, 14, 50, (pageWidth - 32) / 2, 26, "Issued By", issuerLines);
    (0, pdfUtils_1.drawInfoCard)(doc, 14 + (pageWidth - 32) / 2 + 4, 50, (pageWidth - 32) / 2, 26, "Payment Received From", payerLines);
    // Payment Breakdown Table
    const tableRows = data.items?.length
        ? data.items.map((it) => [it.description, it.quantity.toString(), (0, pdfUtils_1.formatCurrency)(it.unitPrice, currency), (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency)])
        : [
            [
                `Settlement against ${data.invoiceReference || data.orderReference || "Authorized Transaction"} (${data.paymentMethod})`,
                "1",
                (0, pdfUtils_1.formatCurrency)(data.amountPaid, currency),
                (0, pdfUtils_1.formatCurrency)(data.amountPaid, currency),
            ],
        ];
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 80,
        head: [["Payment Description / Account", "Qty", "Amount Rate", "Total Remitted"]],
        body: tableRows,
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8.5,
        },
        columnStyles: {
            0: { cellWidth: "auto" },
            1: { halign: "center", cellWidth: 20 },
            2: { halign: "right", cellWidth: 36 },
            3: { halign: "right", cellWidth: 40, fontStyle: "bold" },
        },
        styles: { fontSize: 8.5, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 6;
    // Remittance Summary Card
    const boxX = pageWidth - 85;
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(boxX, finalY, 71, 32, 2, 2, "FD");
    let sy = finalY + 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Payment Status:", boxX + 4, sy);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    doc.text("SETTLED / COMPLETED", boxX + 67, sy, { align: "right" });
    sy += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105);
    doc.text("Amount Paid:", boxX + 4, sy);
    doc.text((0, pdfUtils_1.formatCurrency)(data.amountPaid, currency), boxX + 67, sy, { align: "right" });
    sy += 7;
    if (data.outstandingBalance !== undefined) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Remaining Balance:", boxX + 4, sy);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(data.outstandingBalance > 0 ? 225 : 5, data.outstandingBalance > 0 ? 29 : 150, data.outstandingBalance > 0 ? 72 : 105);
        doc.text((0, pdfUtils_1.formatCurrency)(data.outstandingBalance, currency), boxX + 67, sy, { align: "right" });
    }
    // Official Stamp Mock Box (Left)
    const stampX = 14;
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.6);
    doc.roundedRect(stampX, finalY, 60, 24, 2, 2, "D");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105);
    doc.text("VERIFIED PAYMENT", stampX + 30, finalY + 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(data.company.name, stampX + 30, finalY + 13, { align: "center" });
    doc.text((0, pdfUtils_1.formatDate)(data.paymentDate), stampX + 30, finalY + 18, { align: "center" });
    if (data.cashierName) {
        doc.setFontSize(7.5);
        doc.text(`Teller / Cashier: ${data.cashierName}`, 14, finalY + 32);
    }
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderReceiptStandard = renderReceiptStandard;
/**
 * 2. Payment Voucher / Slip (receipt-voucher)
 */
function renderReceiptVoucher(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const currency = data.company.currency || "KES";
    // Top Voucher Slip
    doc.setFillColor(238, 242, 255); // Indigo 50
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(14, 14, pageWidth - 28, 85, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(67, 56, 202); // Indigo 700
    doc.text(data.company.name.toUpperCase(), 20, 26);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Official Remittance & Accounts Voucher", 20, 31);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`VOUCHER #${data.receiptNumber}`, pageWidth - 20, 26, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Date: ${(0, pdfUtils_1.formatDate)(data.paymentDate)}`, pageWidth - 20, 31, { align: "right" });
    // Divider
    doc.setDrawColor(199, 210, 254);
    doc.line(20, 36, pageWidth - 20, 36);
    // Voucher Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Received With Thanks From:`, 20, 43);
    doc.setFont("helvetica", "bold");
    doc.text(data.customer?.name || "Customer", 68, 43);
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Instrument / Channel:`, 20, 50);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.paymentMethod} (Ref: ${data.transactionReference})`, 68, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Amount In Figures:`, 20, 58);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(67, 56, 202);
    doc.text((0, pdfUtils_1.formatCurrency)(data.amountPaid, currency), 68, 58);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    if (data.invoiceReference) {
        doc.text(`Invoice Reference: ${data.invoiceReference}`, 20, 66);
    }
    // Cashier & Customer Signatures
    doc.setDrawColor(203, 213, 225);
    doc.line(20, 84, 75, 84);
    doc.line(pageWidth - 75, 84, pageWidth - 20, 84);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Authorized Cashier Signature", 20, 89);
    doc.text("Customer Acknowledgment", pageWidth - 20, 89, { align: "right" });
    // Perforated Cut-Line in middle of page
    doc.setDrawColor(180, 180, 180);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(14, 110, pageWidth - 14, 110);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("✂  TEAR-OFF CUSTOMER DUPLICATE RECORD", pageWidth / 2, 108, { align: "center" });
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderReceiptVoucher = renderReceiptVoucher;
/**
 * 3. Thermal POS Receipt 58mm / 80mm
 */
function renderReceiptThermal(data) {
    const is58mm = data.paperWidth === "58mm";
    const rollWidth = is58mm ? 58 : 80;
    // Calculate dynamic height based on line items
    const itemCount = data.items?.length || 1;
    const estimatedHeight = Math.max(140, 90 + itemCount * 10);
    const doc = new jspdf_1.jsPDF({
        unit: "mm",
        format: [rollWidth, estimatedHeight],
    });
    const currency = data.company.currency || "KES";
    let y = 8;
    const centerX = rollWidth / 2;
    const leftX = 4;
    const rightX = rollWidth - 4;
    // Header
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(data.company.name, centerX, y, { align: "center" });
    y += 4.5;
    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    if (data.company.address) {
        const splitAddr = doc.splitTextToSize(data.company.address, rollWidth - 8);
        doc.text(splitAddr, centerX, y, { align: "center" });
        y += splitAddr.length * 3.5;
    }
    if (data.company.contactPhone) {
        doc.text(`Tel: ${data.company.contactPhone}`, centerX, y, { align: "center" });
        y += 3.5;
    }
    if (data.company.taxPin) {
        doc.text(`Tax PIN: ${data.company.taxPin}`, centerX, y, { align: "center" });
        y += 3.5;
    }
    // Dotted line
    doc.text("----------------------------------------".slice(0, is58mm ? 26 : 38), centerX, y, { align: "center" });
    y += 4;
    // Meta lines
    doc.setFontSize(7);
    doc.text(`RCPT NO: ${data.receiptNumber}`, leftX, y);
    y += 3.5;
    doc.text(`DATE   : ${data.paymentDate || new Date().toISOString().slice(0, 16)}`, leftX, y);
    y += 3.5;
    doc.text(`CHANNEL: ${data.paymentMethod}`, leftX, y);
    y += 3.5;
    doc.text(`TXN REF: ${data.transactionReference}`, leftX, y);
    y += 3.5;
    if (data.cashierName) {
        doc.text(`CASHIER: ${data.cashierName}`, leftX, y);
        y += 3.5;
    }
    // Dotted line
    doc.text("----------------------------------------".slice(0, is58mm ? 26 : 38), centerX, y, { align: "center" });
    y += 4;
    // Items table header
    doc.setFont("courier", "bold");
    doc.text("ITEM", leftX, y);
    doc.text("TOTAL", rightX, y, { align: "right" });
    y += 3.5;
    doc.setFont("courier", "normal");
    const items = data.items?.length
        ? data.items
        : [{ description: "POS Sale Settlement", quantity: 1, unitPrice: data.amountPaid, lineTotal: data.amountPaid }];
    items.forEach((it) => {
        const desc = it.description.slice(0, is58mm ? 18 : 28);
        doc.text(desc, leftX, y);
        doc.text((0, pdfUtils_1.formatCurrency)(it.lineTotal, currency), rightX, y, { align: "right" });
        y += 3.2;
        if (it.quantity > 1) {
            doc.setFontSize(6.5);
            doc.text(`  ${it.quantity} x ${(0, pdfUtils_1.formatCurrency)(it.unitPrice, currency)}`, leftX, y);
            doc.setFontSize(7);
            y += 3.2;
        }
    });
    // Dotted line
    doc.text("----------------------------------------".slice(0, is58mm ? 26 : 38), centerX, y, { align: "center" });
    y += 4;
    // Totals
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.text("TOTAL PAID:", leftX, y);
    doc.text((0, pdfUtils_1.formatCurrency)(data.amountPaid, currency), rightX, y, { align: "right" });
    y += 5;
    if (data.outstandingBalance && data.outstandingBalance > 0) {
        doc.setFontSize(7.5);
        doc.text("BALANCE DUE:", leftX, y);
        doc.text((0, pdfUtils_1.formatCurrency)(data.outstandingBalance, currency), rightX, y, { align: "right" });
        y += 4;
    }
    // Footer Policy
    y += 2;
    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    doc.text("----------------------------------------".slice(0, is58mm ? 26 : 38), centerX, y, { align: "center" });
    y += 3.5;
    doc.text("THANK YOU FOR YOUR PATRONAGE!", centerX, y, { align: "center" });
    y += 3;
    const policy = data.returnPolicy || "Goods once sold are not returnable without receipt.";
    const splitPol = doc.splitTextToSize(policy, rollWidth - 8);
    doc.text(splitPol, centerX, y, { align: "center" });
    return doc;
}
exports.renderReceiptThermal = renderReceiptThermal;
