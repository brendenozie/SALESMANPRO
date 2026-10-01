"use strict";
/**
 * PDF Engine Utility Functions
 * SalesmanPro Central Document System
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawInfoCard = exports.drawBadge = exports.addPageNumbersAndFooters = exports.callAutoTable = exports.formatDate = exports.formatCurrency = exports.hexToRgb = void 0;
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
function hexToRgb(hex) {
    let clean = hex.replace("#", "");
    if (clean.length === 3) {
        clean = clean.split("").map((c) => c + c).join("");
    }
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
exports.hexToRgb = hexToRgb;
function formatCurrency(amount, currency = "KES") {
    const val = Number(amount) || 0;
    return `${currency} ${val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
exports.formatCurrency = formatCurrency;
function formatDate(dateString) {
    if (!dateString)
        return "—";
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime()))
            return String(dateString);
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }
    catch {
        return String(dateString);
    }
}
exports.formatDate = formatDate;
/**
 * Universal autoTable caller that supports both default export and object method
 */
function callAutoTable(doc, options) {
    if (typeof jspdf_autotable_1.default.default === "function") {
        jspdf_autotable_1.default.default(doc, options);
    }
    else if (typeof jspdf_autotable_1.default === "function") {
        jspdf_autotable_1.default(doc, options);
    }
    else if (typeof doc.autoTable === "function") {
        doc.autoTable(options);
    }
}
exports.callAutoTable = callAutoTable;
/**
 * Inserts dynamic "Page X of Y" and footer branding onto all pages
 */
function addPageNumbersAndFooters(doc, footerText, companyName) {
    const totalPages = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        // Top subtle divider if page > 1
        if (i > 1) {
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.line(14, 12, pageWidth - 14, 12);
            if (companyName) {
                doc.text(companyName, 14, 9);
            }
        }
        // Bottom divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
        // Left footer text
        const displayFooter = footerText || "Generated via SalesmanPro Unified Document Platform";
        doc.text(displayFooter, 14, pageHeight - 8);
        // Right page number
        const pageStr = `Page ${i} of ${totalPages}`;
        doc.text(pageStr, pageWidth - 14, pageHeight - 8, { align: "right" });
    }
}
exports.addPageNumbersAndFooters = addPageNumbersAndFooters;
/**
 * Draws a status badge pill
 */
function drawBadge(doc, text, x, y, variant = "INFO") {
    let bgColor = [239, 246, 255];
    let textColor = [37, 99, 235];
    if (variant === "SUCCESS") {
        bgColor = [236, 253, 245];
        textColor = [5, 150, 105];
    }
    else if (variant === "WARNING") {
        bgColor = [255, 251, 235];
        textColor = [217, 119, 6];
    }
    else if (variant === "DANGER") {
        bgColor = [254, 242, 242];
        textColor = [225, 29, 72];
    }
    else if (variant === "NEUTRAL") {
        bgColor = [241, 245, 249];
        textColor = [71, 85, 105];
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const textWidth = doc.getTextWidth(text);
    const badgeWidth = textWidth + 8;
    const badgeHeight = 6;
    doc.setFillColor(...bgColor);
    doc.roundedRect(x, y - 4.5, badgeWidth, badgeHeight, 1.5, 1.5, "F");
    doc.setTextColor(...textColor);
    doc.text(text, x + 4, y);
}
exports.drawBadge = drawBadge;
/**
 * Clean boxed info cards
 */
function drawInfoCard(doc, x, y, w, h, title, lines, accentColor = [226, 232, 240]) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(title.toUpperCase(), x + 4, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    let currentY = y + 10;
    lines.forEach((line) => {
        if (line) {
            doc.text(line, x + 4, currentY);
            currentY += 4.2;
        }
    });
}
exports.drawInfoCard = drawInfoCard;
