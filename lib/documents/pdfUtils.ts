/**
 * PDF Engine Utility Functions
 * SalesmanPro Central Document System
 */

import { jsPDF } from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { CompanyBranding } from "./types";

export function hexToRgb(hex: string): [number, number, number] {
  let clean = (hex || "#2563EB").replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [37, 99, 235];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function formatCurrency(amount: number | null | undefined, currency: string = "KES"): string {
  const val = Number(amount) || 0;
  const curr = currency.toUpperCase() === "KSH" ? "KES" : currency;
  return `${curr} ${val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateString);
  }
}

/**
 * Universal autoTable caller that supports both default export and object method
 */
export function callAutoTable(doc: jsPDF, options: UserOptions): void {
  if (typeof (autoTable as any).default === "function") {
    (autoTable as any).default(doc, options);
  } else if (typeof autoTable === "function") {
    (autoTable as any)(doc, options);
  } else if (typeof (doc as any).autoTable === "function") {
    (doc as any).autoTable(options);
  }
}

/**
 * Safe Image Resolver: Converts remote URLs, local file paths, or data URLs to base64
 */
export async function resolveImageBase64(
  imageUrl?: string | null
): Promise<{ dataUrl: string; format: "PNG" | "JPEG" } | null> {
  if (!imageUrl || typeof imageUrl !== "string") return null;

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
      const localPath = path.join(process.cwd(), "public", imageUrl.replace(/^\/+/, ""));
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase();
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
  } catch (err) {
    // Fail gracefully: do not break document generation
    console.warn("PDF safe image resolution skipped for:", imageUrl, (err as any)?.message);
  }

  return null;
}

/**
 * High-Density QR Code Generator
 */
export async function generateQrCodeDataUrl(text: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 256,
      errorCorrectionLevel: "M",
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.warn("Failed to generate QR code data URL:", err);
    return null;
  }
}

/**
 * Draws QR code onto the jsPDF canvas
 */
export function drawQrCode(
  doc: jsPDF,
  qrDataUrl: string | null,
  x: number,
  y: number,
  size: number = 22,
  caption?: string
): void {
  if (!qrDataUrl) return;

  try {
    doc.addImage(qrDataUrl, "PNG", x, y, size, size, undefined, "FAST");
    if (caption) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(caption, x + size / 2, y + size + 3, { align: "center" });
    }
  } catch (err) {
    console.warn("Unable to render QR code image into PDF canvas:", err);
  }
}

/**
 * Draws Branded Header: Real logo with preserved aspect ratio or sleek vector monogram emblem
 */
export function drawBrandedHeader(
  doc: jsPDF,
  branding: CompanyBranding,
  logoImg: { dataUrl: string; format: "PNG" | "JPEG" } | null,
  x: number,
  y: number,
  maxW: number = 42,
  maxH: number = 18
): { logoEndX: number; logoEndY: number } {
  const primaryColor = hexToRgb(branding.primaryColor || "#2563EB");

  if (logoImg) {
    try {
      doc.addImage(logoImg.dataUrl, logoImg.format, x, y, maxW, maxH, undefined, "FAST");
      return { logoEndX: x + maxW + 4, logoEndY: y + maxH };
    } catch (err) {
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

/**
 * Inserts dynamic "Page X of Y" and footer branding onto all pages
 */
export function addPageNumbersAndFooters(
  doc: jsPDF,
  footerText?: string,
  companyName?: string
): void {
  const totalPages = (doc as any).internal.getNumberOfPages();
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

/**
 * Draws a status badge pill
 */
export function drawBadge(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  variant: "SUCCESS" | "WARNING" | "DANGER" | "INFO" | "NEUTRAL" = "INFO"
): void {
  let bgColor: [number, number, number] = [239, 246, 255];
  let textColor: [number, number, number] = [37, 99, 235];

  if (variant === "SUCCESS") {
    bgColor = [236, 253, 245];
    textColor = [5, 150, 105];
  } else if (variant === "WARNING") {
    bgColor = [255, 251, 235];
    textColor = [217, 119, 6];
  } else if (variant === "DANGER") {
    bgColor = [254, 242, 242];
    textColor = [225, 29, 72];
  } else if (variant === "NEUTRAL") {
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

/**
 * Clean boxed info cards
 */
export function drawInfoCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  lines: string[],
  accentColor: [number, number, number] = [226, 232, 240]
): void {
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

/**
 * Formal Authorized Signature & Seal Block
 */
export function drawSignatureBlock(
  doc: jsPDF,
  x: number,
  y: number,
  w: number = 65,
  title: string = "Authorized Signatory",
  name?: string,
  role?: string
): void {
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

/**
 * Verified Payment Block for Bank, M-Pesa, and Settlement Instructions
 */
export function drawPaymentBlock(
  doc: jsPDF,
  branding: CompanyBranding,
  x: number,
  y: number,
  width: number,
  height: number = 28
): void {
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

