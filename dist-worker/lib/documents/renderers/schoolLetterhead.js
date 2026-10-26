"use strict";
/**
 * Shared School Letterhead for academic documents (broadsheets, merit lists, timetables).
 * Renders the store/school logo (or vector monogram fallback), school name, motto,
 * contact line and a primary-colour title band. Works in portrait and landscape.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawKpiTiles = exports.drawSchoolLetterhead = void 0;
const pdfUtils_1 = require("../pdfUtils");
const GOLD = [197, 160, 89];
function drawMonogram(doc, name, x, y, size, color) {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, size, size, 2, 2, "F");
    const words = (name || "School").trim().split(/\s+/);
    const initials = ((words[0]?.[0] || "S") + (words[1]?.[0] || words[0]?.[1] || "")).toUpperCase();
    doc.setFont("times", "bold");
    doc.setFontSize(size * 0.6);
    doc.setTextColor(255, 255, 255);
    doc.text(initials, x + size / 2, y + size / 2 + size * 0.2, { align: "center" });
}
/**
 * Draws the letterhead and returns the Y coordinate where body content can start.
 */
async function drawSchoolLetterhead(doc, school, opts) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const primary = (0, pdfUtils_1.hexToRgb)(school.primaryColor || "#1E3A8A");
    const accent = opts.accentColor || GOLD;
    const margin = 14;
    const logoSize = 20;
    // Logo / crest
    const logo = await (0, pdfUtils_1.resolveImageBase64)(school.logoUrl);
    if (logo) {
        try {
            doc.addImage(logo.dataUrl, logo.format, margin, 10, logoSize, logoSize, undefined, "FAST");
        }
        catch {
            drawMonogram(doc, school.name, margin, 10, logoSize, primary);
        }
    }
    else {
        drawMonogram(doc, school.name, margin, 10, logoSize, primary);
    }
    const textX = margin + logoSize + 5;
    // School name
    doc.setFont("times", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...primary);
    doc.text((school.name || "School").toUpperCase(), textX, 16.5);
    // Motto
    const motto = opts.motto || school.tagline;
    if (motto) {
        doc.setFont("times", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(...accent);
        doc.text(`"${motto}"`, textX, 21.5);
    }
    // Contact line
    const contact = [
        school.address,
        school.contactPhone ? `Tel: ${school.contactPhone}` : "",
        school.contactEmail ? `Email: ${school.contactEmail}` : "",
        school.website || "",
        school.registrationNumber ? `Reg: ${school.registrationNumber}` : "",
    ]
        .filter(Boolean)
        .join("  •  ");
    if (contact) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.3);
        doc.setTextColor(71, 85, 105);
        doc.text(contact, textX, 26.5, { maxWidth: pageWidth - textX - margin });
    }
    // Title band
    const bandY = 33;
    doc.setFillColor(...primary);
    doc.rect(margin, bandY, pageWidth - margin * 2, 8, "F");
    doc.setFillColor(...accent);
    doc.rect(margin, bandY + 8, pageWidth - margin * 2, 0.8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(opts.title.toUpperCase(), pageWidth / 2, bandY + 5.4, { align: "center" });
    let y = bandY + 8.8;
    if (opts.subtitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(opts.subtitle, pageWidth / 2, y + 5, { align: "center" });
        y += 7;
    }
    return y + 4;
}
exports.drawSchoolLetterhead = drawSchoolLetterhead;
/**
 * Draws a row of compact KPI tiles. Returns Y below the tiles.
 */
function drawKpiTiles(doc, y, tiles, primary) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const gap = 3;
    const w = (pageWidth - margin * 2 - gap * (tiles.length - 1)) / tiles.length;
    const h = 14;
    tiles.forEach((tile, i) => {
        const x = margin + i * (w + gap);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, w, h, 1.8, 1.8, "FD");
        doc.setFillColor(...primary);
        doc.rect(x, y + 2, 1.2, h - 4, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(tile.label.toUpperCase(), x + 4, y + 5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(tile.value, x + 4, y + 11, { maxWidth: w - 6 });
    });
    return y + h + 5;
}
exports.drawKpiTiles = drawKpiTiles;
