"use strict";
/**
 * Purchase Order PDF Renderers (3 Distinct Designs)
 * 1. Standard Procurement (po-standard)
 * 2. Industrial & Supply (po-industrial)
 * 3. Corporate Acquisition (po-executive)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPurchaseOrderExecutive = exports.renderPurchaseOrderIndustrial = exports.renderPurchaseOrderStandard = void 0;
const jspdf_1 = require("jspdf");
const pdfUtils_1 = require("../pdfUtils");
/**
 * 1. Standard Procurement Purchase Order
 */
function renderPurchaseOrderStandard(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = (0, pdfUtils_1.hexToRgb)(data.company.primaryColor || "#334155");
    const currency = data.company.currency || "KES";
    // Header Brand
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
    // Right PO Title & Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text("PURCHASE ORDER", pageWidth - 14, 20, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`P.O. Number: ${data.poNumber}`, pageWidth - 14, 26, { align: "right" });
    doc.text(`Order Date: ${(0, pdfUtils_1.formatDate)(data.issueDate)}`, pageWidth - 14, 31, { align: "right" });
    if (data.expectedDate) {
        doc.text(`Expected Delivery: ${(0, pdfUtils_1.formatDate)(data.expectedDate)}`, pageWidth - 14, 36, { align: "right" });
    }
    (0, pdfUtils_1.drawBadge)(doc, data.status, pageWidth - 32, 42, data.status === "RECEIVED" ? "SUCCESS" : "INFO");
    // Divider
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(14, 46, pageWidth - 14, 46);
    // Supplier & Ship-To Information
    const supplierLines = [
        data.supplier.name,
        data.supplier.contactPerson ? `Attn: ${data.supplier.contactPerson}` : "",
        data.supplier.address || "",
        `Phone: ${data.supplier.phone || "—"}`,
        `Email: ${data.supplier.email || "—"}`,
    ].filter(Boolean);
    const shipToLines = [
        data.company.name,
        data.deliveryAddress || data.company.address || "Main Warehouse Receiving Dock",
        `Contact: ${data.company.contactPhone || "—"}`,
        `Email: ${data.company.contactEmail || "—"}`,
    ].filter(Boolean);
    (0, pdfUtils_1.drawInfoCard)(doc, 14, 50, (pageWidth - 32) / 2, 28, "Vendor / Supplier", supplierLines);
    (0, pdfUtils_1.drawInfoCard)(doc, 14 + (pageWidth - 32) / 2 + 4, 50, (pageWidth - 32) / 2, 28, "Ship / Deliver To", shipToLines);
    // Items Table
    const tableRows = data.items.map((it) => [
        it.sku || "—",
        it.description,
        it.quantityOrdered.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitCost, currency),
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 83,
        head: [["SKU / Part #", "Item Specification & Description", "Qty Ordered", "Unit Rate", "Total Cost"]],
        body: tableRows,
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8.5,
        },
        columnStyles: {
            0: { cellWidth: 26, font: "courier", fontSize: 8 },
            1: { cellWidth: "auto" },
            2: { halign: "center", cellWidth: 24 },
            3: { halign: "right", cellWidth: 30 },
            4: { halign: "right", cellWidth: 32, fontStyle: "bold" },
        },
        styles: { fontSize: 8, cellPadding: 2.8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 6;
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
    printLine("Subtotal Items:", (0, pdfUtils_1.formatCurrency)(data.subtotal, currency));
    if (data.taxAmount > 0)
        printLine("Tax Amount:", (0, pdfUtils_1.formatCurrency)(data.taxAmount, currency));
    if (data.shippingCost > 0)
        printLine("Shipping / Freight:", (0, pdfUtils_1.formatCurrency)(data.shippingCost, currency));
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(totalsX, curY - 1, pageWidth - 14, curY - 1);
    curY += 2;
    printLine("Total Order Cost:", (0, pdfUtils_1.formatCurrency)(data.totalAmount, currency), true, primaryColor);
    // Authorized By Sign-off
    const signY = curY + 12;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(14, signY, 70, signY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Authorized Signatory: ${data.authorizedBy || data.company.name}`, 14, signY + 5);
    if (data.terms || data.notes) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const combined = [data.notes, data.terms].filter(Boolean).join("  •  ");
        const splitTerms = doc.splitTextToSize(`Terms: ${combined}`, pageWidth - 28);
        doc.text(splitTerms, 14, signY + 14);
    }
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderPurchaseOrderStandard = renderPurchaseOrderStandard;
/**
 * 2. Industrial & Supply Purchase Order
 */
function renderPurchaseOrderIndustrial(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const currency = data.company.currency || "KES";
    // Orange Industrial Accent Banner
    doc.setFillColor(194, 65, 12); // Orange 700
    doc.rect(0, 0, pageWidth, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("SUPPLY CHAIN & INVENTORY REQUISITION ORDER", 14, 8);
    // Company & PO info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(data.company.name, 14, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`PIN: ${data.company.taxPin || "—"} | Reg: ${data.company.registrationNumber || "—"}`, 14, 29);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(194, 65, 12);
    doc.text(data.poNumber, pageWidth - 14, 24, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Date Issued: ${(0, pdfUtils_1.formatDate)(data.issueDate)}`, pageWidth - 14, 29, { align: "right" });
    // Vendor Table Card
    doc.setFillColor(255, 247, 237); // Orange 50
    doc.setDrawColor(254, 215, 170); // Orange 200
    doc.roundedRect(14, 34, pageWidth - 28, 22, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(194, 65, 12);
    doc.text("APPROVED VENDOR:", 18, 40);
    doc.text("DESTINATION WAREHOUSE:", (pageWidth / 2) + 4, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(data.supplier.name, 18, 46);
    doc.text(data.deliveryAddress || data.company.address || "Central Stores", (pageWidth / 2) + 4, 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Phone: ${data.supplier.phone || "—"} | Email: ${data.supplier.email || "—"}`, 18, 51);
    doc.text(`Receiving Hours: Mon–Fri 08:00 - 17:00`, (pageWidth / 2) + 4, 51);
    // Table
    const tableRows = data.items.map((it, idx) => [
        (idx + 1).toString(),
        it.sku || "—",
        it.description,
        it.quantityOrdered.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitCost, currency),
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 60,
        head: [["Item", "SKU / Part No.", "Material Specification", "Units", "Cost Rate", "Net Amount"]],
        body: tableRows,
        headStyles: {
            fillColor: [194, 65, 12],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8,
        },
        columnStyles: {
            0: { cellWidth: 12, halign: "center" },
            1: { cellWidth: 26, font: "courier", fontSize: 8 },
            2: { cellWidth: "auto" },
            3: { halign: "center", cellWidth: 16 },
            4: { halign: "right", cellWidth: 28 },
            5: { halign: "right", cellWidth: 30, fontStyle: "bold" },
        },
        styles: { fontSize: 8, cellPadding: 2.5 },
        alternateRowStyles: { fillColor: [255, 251, 245] },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 6;
    const totalsX = pageWidth - 80;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(194, 65, 12);
    doc.text("TOTAL ORDER VALUE:", totalsX, finalY + 4);
    doc.text((0, pdfUtils_1.formatCurrency)(data.totalAmount, currency), pageWidth - 14, finalY + 4, { align: "right" });
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderPurchaseOrderIndustrial = renderPurchaseOrderIndustrial;
/**
 * 3. Corporate Acquisition Purchase Order
 */
function renderPurchaseOrderExecutive(data) {
    const doc = new jspdf_1.jsPDF({ format: "a4", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const currency = data.company.currency || "KES";
    // Blue Slate Elegant Layout
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(14, 14, pageWidth - 28, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(data.company.name, 20, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Corporate Procurement & Supply Agreement", 20, 31);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(56, 189, 248); // Sky 400
    doc.text(data.poNumber, pageWidth - 20, 25, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Date: ${(0, pdfUtils_1.formatDate)(data.issueDate)}`, pageWidth - 20, 31, { align: "right" });
    // Minimal Table
    const tableRows = data.items.map((it) => [
        it.sku || "—",
        it.description,
        it.quantityOrdered.toString(),
        (0, pdfUtils_1.formatCurrency)(it.unitCost, currency),
        (0, pdfUtils_1.formatCurrency)(it.lineTotal, currency),
    ]);
    (0, pdfUtils_1.callAutoTable)(doc, {
        startY: 44,
        head: [["Item Reference", "Description", "Units Ordered", "Unit Rate", "Total Cost"]],
        body: tableRows,
        headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8.5,
        },
        columnStyles: {
            0: { cellWidth: 26, font: "courier", fontSize: 8 },
            1: { cellWidth: "auto" },
            2: { halign: "center", cellWidth: 26 },
            3: { halign: "right", cellWidth: 30 },
            4: { halign: "right", cellWidth: 32, fontStyle: "bold" },
        },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY + 8;
    const totalsX = pageWidth - 80;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("TOTAL COMMITMENT:", totalsX, finalY);
    doc.text((0, pdfUtils_1.formatCurrency)(data.totalAmount, currency), pageWidth - 14, finalY, { align: "right" });
    // Dual Sign-off
    const signY = pageHeight - 34;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, signY, 70, signY);
    doc.line(pageWidth - 70, signY, pageWidth - 14, signY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("AUTHORIZED PROCUREMENT OFFICER", 14, signY + 4);
    doc.text("SUPPLIER ACCEPTANCE & STAMP", pageWidth - 14, signY + 4, { align: "right" });
    (0, pdfUtils_1.addPageNumbersAndFooters)(doc, data.footerText, data.company.name);
    return doc;
}
exports.renderPurchaseOrderExecutive = renderPurchaseOrderExecutive;
