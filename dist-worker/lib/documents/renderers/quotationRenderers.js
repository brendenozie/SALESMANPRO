"use strict";
/**
 * Quotation PDF Renderers (3 Distinct Designs)
 * 1. Standard Estimate (quotation-classic)
 * 2. Commercial Proposal (quotation-proposal)
 * 3. Modern Minimalist (quotation-modern)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderQuotationModern = exports.renderQuotationProposal = exports.renderQuotationClassic = void 0;
const jspdf_1 = require("jspdf");
const pdfUtils_1 = require("../pdfUtils");
/**
 * 1. Standard Estimate Quotation
 */
function renderQuotationClassic(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = (0, pdfUtils_1.hexToRgb)(data.company.primaryColor || "#0284C7");
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
    // Quotation Title & Meta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text("QUOTATION", pageWidth - 14, 20, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Quote No: ${data.quotationNumber}`, pageWidth - 14, 26, { align: "right" });
    doc.text(`Date: ${(0, pdfUtils_1.formatDate)(data.issueDate)}`, pageWidth - 14, 31, { align: "right" });
    doc.text(`Valid Until: ${(0, pdfUtils_1.formatDate)(data.expiryDate)}`, pageWidth - 14, 36, { align: "right" });
    const statusVariant = data.status === "ACCEPTED" ? "SUCCESS" : data.status === "EXPIRED" ? "DANGER" : "INFO";
    (0, pdfUtils_1.drawBadge)(doc, data.status, pageWidth - 32, 42, statusVariant);
    // Divider
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(14, 46, pageWidth - 14, 46);
    // Address Cards
    const companyLines = [
        data.company.address || "",
        `Tel: ${data.company.contactPhone || "—"}`,
        `Email: ${data.company.contactEmail || "—"}`,
        data.company.website ? `Web: ${data.company.website}` : "",
    ].filter(Boolean);
    const customerLines = [
        data.customer.name,
        data.customer.address || "",
        data.customer.phone ? `Phone: ${data.customer.phone}` : "",
        data.customer.email ? `Email: ${data.customer.email}` : "",
    ].filter(Boolean);
    (0, pdfUtils_1.drawInfoCard)(doc, 14, 50, (pageWidth - 32) / 2, 26, "Prepared By", companyLines);
    (0, pdfUtils_1.drawInfoCard)(doc, 14 + (pageWidth - 32) / 2 + 4, 50, (pageWidth - 32) / 2, 26, "Quotation Prepared For", customerLines);
    // Items Table
    const tableRows = data.items.map((it) => [
        it.sku || "—",
        it.description,
        it.quantity.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitPrice, currency),
        it.discount ? `${it.discount}%` : "0%",
        it.taxRate ? `${it.taxRate}%` : "0%",
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 80,
        head: [["Code", "Scope / Item Description", "Qty", "Unit Rate", "Disc", "Tax", "Amount"]],
        body: tableRows,
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8.5,
        },
        columnStyles: {
            0: { cellWidth: 20, font: "courier", fontSize: 8 },
            1: { cellWidth: "auto" },
            2: { halign: "center", cellWidth: 14 },
            3: { halign: "right", cellWidth: 28 },
            4: { halign: "center", cellWidth: 14 },
            5: { halign: "center", cellWidth: 14 },
            6: { halign: "right", cellWidth: 28, fontStyle: "bold" },
        },
        styles: { fontSize: 8, cellPadding: 2.8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 6;
    // Totals Box
    const totalsX = pageWidth - 80;
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
    printLine("Subtotal Estimated:", (0, pdfUtils_1.formatCurrency)(data.subtotal, currency));
    if (data.discountTotal > 0) {
        printLine("Commercial Discount:", `-${(0, pdfUtils_1.formatCurrency)(data.discountTotal, currency)}`, false, [225, 29, 72]);
    }
    printLine("Estimated Tax:", (0, pdfUtils_1.formatCurrency)(data.taxTotal, currency));
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(totalsX, curY - 1, pageWidth - 14, curY - 1);
    curY += 2;
    printLine("Quotation Total:", (0, pdfUtils_1.formatCurrency)(data.grandTotal, currency), true, primaryColor);
    // Acceptance & Sign-off Section
    let leftY = finalY;
    const leftWidth = totalsX - 22;
    if (data.validityPeriod) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text("VALIDITY & ACCEPTANCE TERMS", 14, leftY);
        leftY += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`This quotation is valid for: ${data.validityPeriod}`, 14, leftY);
        leftY += 6;
    }
    // Customer Acceptance Sign-off Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, leftY, leftWidth, 30, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("CUSTOMER ACCEPTANCE / AUTHORIZATION", 18, leftY + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Name: ____________________________", 18, leftY + 12);
    doc.text("Signature: ________________________", 18, leftY + 19);
    doc.text("Date: ____________________________", 18, leftY + 26);
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderQuotationClassic = renderQuotationClassic;
/**
 * 2. Commercial Proposal Quotation
 */
function renderQuotationProposal(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const currency = data.company.currency || "KES";
    // Hero Brand Banner
    doc.setFillColor(124, 58, 237); // Violet 600
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setFillColor(109, 40, 217); // Violet 700 Accent
    doc.rect(0, 40, pageWidth, 2.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(data.company.name, 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(237, 233, 254);
    doc.text("Commercial Scope & Investment Proposal", 14, 25);
    // Proposal Meta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("PROPOSAL", pageWidth - 14, 18, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(237, 233, 254);
    doc.text(`Ref: ${data.quotationNumber}`, pageWidth - 14, 25, { align: "right" });
    doc.text(`Valid to: ${(0, pdfUtils_1.formatDate)(data.expiryDate)}`, pageWidth - 14, 30, { align: "right" });
    // Client Details Bar
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(14, 47, pageWidth - 28, 16, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(109, 40, 217);
    doc.text("PROPOSED TO:", 20, 53);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(data.customer.name, 20, 59);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(data.customer.email || data.customer.phone || "", pageWidth - 20, 56, { align: "right" });
    // Proposal Table
    const tableRows = data.items.map((it, idx) => [
        `0${idx + 1}`,
        it.description,
        it.quantity.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitPrice, currency),
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 68,
        head: [["Milestone", "Deliverable Scope", "Qty", "Investment Rate", "Subtotal"]],
        body: tableRows,
        headStyles: {
            fillColor: [124, 58, 237],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8.5,
        },
        columnStyles: {
            0: { cellWidth: 18, halign: "center" },
            1: { cellWidth: "auto" },
            2: { halign: "center", cellWidth: 16 },
            3: { halign: "right", cellWidth: 32 },
            4: { halign: "right", cellWidth: 34, fontStyle: "bold" },
        },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [250, 245, 255] },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 6;
    // Investment Summary Card
    const boxX = pageWidth - 85;
    doc.setFillColor(245, 243, 255);
    doc.setDrawColor(221, 214, 254);
    doc.roundedRect(boxX, finalY, 71, 32, 2, 2, "FD");
    let sy = finalY + 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Estimated Net:", boxX + 4, sy);
    doc.text((0, pdfUtils_1.formatCurrency)(data.subtotal, currency), boxX + 67, sy, { align: "right" });
    sy += 5;
    doc.text("VAT / Taxes:", boxX + 4, sy);
    doc.text((0, pdfUtils_1.formatCurrency)(data.taxTotal, currency), boxX + 67, sy, { align: "right" });
    sy += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(109, 40, 217);
    doc.text("Total Proposal:", boxX + 4, sy);
    doc.text((0, pdfUtils_1.formatCurrency)(data.grandTotal, currency), boxX + 67, sy, { align: "right" });
    // Notes
    if (data.notes || data.terms) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text("DELIVERABLE TERMS & REMARKS", 14, finalY + 6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const combined = [data.notes, data.terms].filter(Boolean).join("\n");
        const splitTxt = doc.splitTextToSize(combined, boxX - 22);
        doc.text(splitTxt, 14, finalY + 11);
    }
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderQuotationProposal = renderQuotationProposal;
/**
 * 3. Modern Minimalist Quotation
 */
function renderQuotationModern(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const currency = data.company.currency || "KES";
    // Amber Accent Line
    doc.setFillColor(217, 119, 6); // Amber 600
    doc.rect(14, 14, 6, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(data.company.name, 24, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Official Quotation • ${data.company.contactEmail || ""}`, 24, 28);
    // Right Meta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(217, 119, 6);
    doc.text(data.quotationNumber, pageWidth - 14, 22, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Valid Through: ${(0, pdfUtils_1.formatDate)(data.expiryDate)}`, pageWidth - 14, 28, { align: "right" });
    // Minimal Table
    const tableRows = data.items.map((it) => [
        it.description,
        it.quantity.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitPrice, currency),
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 42,
        head: [["Description", "Quantity", "Rate", "Total"]],
        body: tableRows,
        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8.5,
        },
        columnStyles: {
            0: { cellWidth: "auto" },
            1: { halign: "center", cellWidth: 20 },
            2: { halign: "right", cellWidth: 32 },
            3: { halign: "right", cellWidth: 36, fontStyle: "bold" },
        },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 8;
    const totalsX = pageWidth - 80;
    let y = finalY;
    const addRow = (lbl, val, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(bold ? 9.5 : 8);
        doc.setTextColor(bold ? 217 : 71, bold ? 119 : 85, bold ? 6 : 105);
        doc.text(lbl, totalsX, y);
        doc.text(val, pageWidth - 14, y, { align: "right" });
        y += 5.5;
    };
    addRow("Subtotal:", (0, pdfUtils_1.formatCurrency)(data.subtotal, currency));
    addRow("Tax:", (0, pdfUtils_1.formatCurrency)(data.taxTotal, currency));
    addRow("Total Estimate:", (0, pdfUtils_1.formatCurrency)(data.grandTotal, currency), true);
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderQuotationModern = renderQuotationModern;
