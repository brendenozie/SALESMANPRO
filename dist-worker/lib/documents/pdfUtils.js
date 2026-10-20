"use strict";
/**
 * PDF Engine Utility Functions
 * SalesmanPro Central Document System
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawPaymentBlock = exports.drawSignatureBlock = exports.drawInfoCard = exports.drawBadge = exports.addPageNumbersAndFooters = exports.drawBrandedHeader = exports.drawQrCode = exports.generateQrCodeDataUrl = exports.resolveImageBase64 = exports.callAutoTable = exports.formatDate = exports.formatCurrency = exports.hexToRgb = void 0;
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
const qrcode_1 = __importDefault(require("qrcode"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function hexToRgb(hex) {
    let clean = (hex || "#2563EB").replace("#", "");
    if (clean.length === 3) {
        clean = clean.split("").map((c) => c + c).join("");
    }
    const num = parseInt(clean, 16);
    if (isNaN(num))
        return [37, 99, 235];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
exports.hexToRgb = hexToRgb;
function formatCurrency(amount, currency = "KES") {
    const val = Number(amount) || 0;
    const curr = currency.toUpperCase() === "KSH" ? "KES" : currency;
    return `${curr} ${val.toLocaleString(undefined, {
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
 * Safe Image Resolver: Converts remote URLs, local file paths, or data URLs to base64
 */
async function resolveImageBase64(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string")
        return null;
    try {
        // Already base64 Data URL
        if (imageUrl.startsWith("data:image/png;base64,")) {
            return { dataUrl: imageUrl, format: "PNG" };
        }
        if (imageUrl.startsWith("data:image/jpeg;base64,") || imageUrl.startsWith("data:image/jpg;base64,")) {
            return { dataUrl: imageUrl, format: "JPEG" };
        }
        // Local public asset
        if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) {
            const localPath = path_1.default.join(process.cwd(), "public", imageUrl.replace(/^\/+/, ""));
            if (fs_1.default.existsSync(localPath)) {
                const buffer = fs_1.default.readFileSync(localPath);
                const ext = path_1.default.extname(localPath).toLowerCase();
                const format = ext === ".jpg" || ext === ".jpeg" ? "JPEG" : "PNG";
                return {
                    dataUrl: `data:image/${format.toLowerCase()};base64,${buffer.toString("base64")}`,
                    format,
                };
            }
        }
        // Remote HTTP / HTTPS URL with timeout
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const resp = await fetch(imageUrl, {
                signal: controller.signal,
                headers: { Accept: "image/png,image/jpeg,image/webp,*/*" },
            });
            clearTimeout(timeoutId);
            if (resp.ok) {
                const arrayBuf = await resp.arrayBuffer();
                const buffer = Buffer.from(arrayBuf);
                const contentType = resp.headers.get("content-type") || "";
                const isJpeg = contentType.includes("jpeg") || contentType.includes("jpg") || imageUrl.endsWith(".jpg") || imageUrl.endsWith(".jpeg");
                const format = isJpeg ? "JPEG" : "PNG";
                return {
                    dataUrl: `data:image/${format.toLowerCase()};base64,${buffer.toString("base64")}`,
                    format,
                };
            }
        }
    }
    catch (err) {
        // Fail gracefully: do not break document generation
        console.warn("PDF safe image resolution skipped for:", imageUrl, err?.message);
    }
    return null;
}
exports.resolveImageBase64 = resolveImageBase64;
/**
 * High-Density QR Code Generator
 */
async function generateQrCodeDataUrl(text) {
    try {
        return await qrcode_1.default.toDataURL(text, {
            margin: 1,
            width: 256,
            errorCorrectionLevel: "M",
            color: {
                dark: "#0F172A",
                light: "#FFFFFF",
            },
        });
    }
    catch (err) {
        console.warn("Failed to generate QR code data URL:", err);
        return null;
    }
}
exports.generateQrCodeDataUrl = generateQrCodeDataUrl;
/**
 * Draws QR code onto the jsPDF canvas
 */
function drawQrCode(doc, qrDataUrl, x, y, size = 22, caption) {
    if (!qrDataUrl)
        return;
    try {
        doc.addImage(qrDataUrl, "PNG", x, y, size, size, undefined, "FAST");
        if (caption) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.5);
            doc.setTextColor(100, 116, 139);
            doc.text(caption, x + size / 2, y + size + 3, { align: "center" });
        }
    }
    catch (err) {
        console.warn("Unable to render QR code image into PDF canvas:", err);
    }
}
exports.drawQrCode = drawQrCode;
/**
 * Draws Branded Header: Real logo with preserved aspect ratio or sleek vector monogram emblem
 */
function drawBrandedHeader(doc, branding, logoImg, x, y, maxW = 42, maxH = 18) {
    const primaryColor = hexToRgb(branding.primaryColor || "#2563EB");
    if (logoImg) {
        try {
            doc.addImage(logoImg.dataUrl, logoImg.format, x, y, maxW, maxH, undefined, "FAST");
            return { logoEndX: x + maxW + 4, logoEndY: y + maxH };
        }
        catch (err) {
            console.warn("Failed rendering image, falling back to vector monogram:", err);
        }
    }
    // Graceful fallback: Luxury Vector Monogram Badge
    const badgeSize = Math.min(maxH, 16);
    doc.setFillColor(...primaryColor);
    doc.roundedRect(x, y, badgeSize, badgeSize, 2, 2, "F");
    // Initials (e.g. "Flourish Home" -> "FH")
    const words = (branding.name || "SalesmanPro").trim().split(/\s+/);
    const initials = (words[0]?.[0] || "S") + (words[1]?.[0] || words[0]?.[1] || "P").toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(initials, x + badgeSize / 2, y + badgeSize / 2 + 3.5, { align: "center" });
    return { logoEndX: x + badgeSize + 4, logoEndY: y + badgeSize };
}
exports.drawBrandedHeader = drawBrandedHeader;
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
        const displayFooter = footerText || `${companyName || "SalesmanPro"} — Official Document`;
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
/**
 * Formal Authorized Signature & Seal Block
 */
function drawSignatureBlock(doc, x, y, w = 65, title = "Authorized Signatory", name, role) {
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.4);
    doc.line(x, y + 14, x + w, y + 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(title.toUpperCase(), x, y + 18);
    if (name) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(name, x, y + 22);
    }
    if (role) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(role, x, y + 25.5);
    }
}
exports.drawSignatureBlock = drawSignatureBlock;
/**
 * Verified Payment Block for Bank, M-Pesa, and Settlement Instructions
 */
function drawPaymentBlock(doc, branding, x, y, width, height = 28) {
    const primaryColor = hexToRgb(branding.primaryColor || "#1E3A8A");
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryColor);
    doc.text("VERIFIED PAYMENT INSTRUCTIONS", x + 4, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    let curY = y + 10;
    if (branding.mpesaShortcode) {
        doc.setFont("helvetica", "bold");
        doc.text("M-Pesa Paybill / Till:", x + 4, curY);
        doc.setFont("helvetica", "normal");
        doc.text(branding.mpesaShortcode, x + 34, curY);
        curY += 4.5;
    }
    if (branding.bankDetails) {
        doc.setFont("helvetica", "bold");
        doc.text("Bank Account:", x + 4, curY);
        doc.setFont("helvetica", "normal");
        const splitBank = doc.splitTextToSize(branding.bankDetails, width - 38);
        doc.text(splitBank, x + 34, curY);
        curY += splitBank.length * 4;
    }
    if (!branding.mpesaShortcode && !branding.bankDetails) {
        const defaultInstructions = branding.paymentInstructions || "Please quote document reference number when remitting payment.";
        const split = doc.splitTextToSize(defaultInstructions, width - 8);
        doc.text(split, x + 4, curY);
    }
}
exports.drawPaymentBlock = drawPaymentBlock;
