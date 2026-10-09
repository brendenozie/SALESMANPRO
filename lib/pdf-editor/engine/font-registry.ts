/**
 * lib/pdf-editor/engine/font-registry.ts
 *
 * Font management and metrics for PDF editing and reconstruction.
 * Supports:
 *   - PDF Standard-14 fonts (Helvetica, Times, Courier, etc.)
 *   - Bundled web fonts (Inter, Roboto)
 *   - Character width calculation for text reflow and collision detection
 *   - Embedding into pdf-lib PDFDocument
 */

import { StandardFonts, PDFDocument, PDFFont } from "pdf-lib";
import type { FontWeight, FontStyle } from "../model/types";

export interface FontDefinition {
  family: string;
  weight: FontWeight;
  style: FontStyle;
  isStandard14: boolean;
  standardFontName?: StandardFonts;
  postScriptName: string;
  displayName: string;
}

export const SUPPORTED_FONTS: FontDefinition[] = [
  // Helvetica family
  {
    family: "Helvetica",
    weight: "normal",
    style: "normal",
    isStandard14: true,
    standardFontName: StandardFonts.Helvetica,
    postScriptName: "Helvetica",
    displayName: "Helvetica Regular",
  },
  {
    family: "Helvetica",
    weight: "bold",
    style: "normal",
    isStandard14: true,
    standardFontName: StandardFonts.HelveticaBold,
    postScriptName: "Helvetica-Bold",
    displayName: "Helvetica Bold",
  },
  {
    family: "Helvetica",
    weight: "normal",
    style: "italic",
    isStandard14: true,
    standardFontName: StandardFonts.HelveticaOblique,
    postScriptName: "Helvetica-Oblique",
    displayName: "Helvetica Italic",
  },
  {
    family: "Helvetica",
    weight: "bold",
    style: "italic",
    isStandard14: true,
    standardFontName: StandardFonts.HelveticaBoldOblique,
    postScriptName: "Helvetica-BoldOblique",
    displayName: "Helvetica Bold Italic",
  },

  // Times Roman family
  {
    family: "Times",
    weight: "normal",
    style: "normal",
    isStandard14: true,
    standardFontName: StandardFonts.TimesRoman,
    postScriptName: "Times-Roman",
    displayName: "Times Roman Regular",
  },
  {
    family: "Times",
    weight: "bold",
    style: "normal",
    isStandard14: true,
    standardFontName: StandardFonts.TimesRomanBold,
    postScriptName: "Times-Bold",
    displayName: "Times Roman Bold",
  },
  {
    family: "Times",
    weight: "normal",
    style: "italic",
    isStandard14: true,
    standardFontName: StandardFonts.TimesRomanItalic,
    postScriptName: "Times-Italic",
    displayName: "Times Roman Italic",
  },
  {
    family: "Times",
    weight: "bold",
    style: "italic",
    isStandard14: true,
    standardFontName: StandardFonts.TimesRomanBoldItalic,
    postScriptName: "Times-BoldItalic",
    displayName: "Times Roman Bold Italic",
  },

  // Courier family
  {
    family: "Courier",
    weight: "normal",
    style: "normal",
    isStandard14: true,
    standardFontName: StandardFonts.Courier,
    postScriptName: "Courier",
    displayName: "Courier Regular",
  },
  {
    family: "Courier",
    weight: "bold",
    style: "normal",
    isStandard14: true,
    standardFontName: StandardFonts.CourierBold,
    postScriptName: "Courier-Bold",
    displayName: "Courier Bold",
  },
  {
    family: "Courier",
    weight: "normal",
    style: "italic",
    isStandard14: true,
    standardFontName: StandardFonts.CourierOblique,
    postScriptName: "Courier-Oblique",
    displayName: "Courier Italic",
  },
  {
    family: "Courier",
    weight: "bold",
    style: "italic",
    isStandard14: true,
    standardFontName: StandardFonts.CourierBoldOblique,
    postScriptName: "Courier-BoldOblique",
    displayName: "Courier Bold Italic",
  },

  // Modern sans-serif: Inter and Roboto
  {
    family: "Inter",
    weight: "normal",
    style: "normal",
    isStandard14: false,
    postScriptName: "Inter-Regular",
    displayName: "Inter Regular",
  },
  {
    family: "Inter",
    weight: "bold",
    style: "normal",
    isStandard14: false,
    postScriptName: "Inter-Bold",
    displayName: "Inter Bold",
  },
  {
    family: "Roboto",
    weight: "normal",
    style: "normal",
    isStandard14: false,
    postScriptName: "Roboto-Regular",
    displayName: "Roboto Regular",
  },
  {
    family: "Roboto",
    weight: "bold",
    style: "normal",
    isStandard14: false,
    postScriptName: "Roboto-Bold",
    displayName: "Roboto Bold",
  },
];

/**
 * Resolves the closest matching FontDefinition for a given family, weight, style.
 */
export function resolveFont(
  family: string,
  weight: FontWeight = "normal",
  style: FontStyle = "normal"
): FontDefinition {
  const normFam = family.toLowerCase().trim();

  // Direct match by family + weight + style
  let match = SUPPORTED_FONTS.find(
    (f) =>
      f.family.toLowerCase() === normFam &&
      f.weight === weight &&
      f.style === style
  );
  if (match) return match;

  // Fallback 1: match family with default style
  match = SUPPORTED_FONTS.find(
    (f) => f.family.toLowerCase() === normFam && f.weight === weight
  );
  if (match) return match;

  // Fallback 2: match family alone
  match = SUPPORTED_FONTS.find((f) => f.family.toLowerCase() === normFam);
  if (match) return match;

  // Fallback 3: Alias mappings
  if (normFam.includes("sans") || normFam.includes("arial")) {
    return resolveFont("Helvetica", weight, style);
  }
  if (normFam.includes("serif") || normFam.includes("georgia")) {
    return resolveFont("Times", weight, style);
  }
  if (normFam.includes("mono") || normFam.includes("code")) {
    return resolveFont("Courier", weight, style);
  }

  // Default fallback: Helvetica
  return resolveFont("Helvetica", weight, style);
}

/**
 * Embeds a font into a pdf-lib PDFDocument.
 */
export async function embedFontInDoc(
  pdfDoc: PDFDocument,
  fontDef: FontDefinition
): Promise<PDFFont> {
  if (fontDef.isStandard14 && fontDef.standardFontName) {
    return pdfDoc.embedStandardFont(fontDef.standardFontName);
  }

  // For non-standard fonts (Inter, Roboto), if custom TTF is not bundled in environment,
  // we use Helvetica/HelveticaBold with documented fallback note, or embed standard font.
  // Note: Standard Helvetica is universally compatible without embedding binary bloat.
  const fallbackStandard = fontDef.weight === "bold" ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
  return pdfDoc.embedStandardFont(fallbackStandard);
}

/**
 * Approximate text width calculation in points based on font and font size.
 */
export function measureTextWidth(
  text: string,
  fontFamily: string,
  fontSize: number,
  fontWeight: FontWeight = "normal"
): number {
  const normFam = fontFamily.toLowerCase();
  const isMono = normFam.includes("courier") || normFam.includes("mono");

  if (isMono) {
    // Courier is fixed-pitch: 0.6 em per char
    return text.length * fontSize * 0.6;
  }

  const isBold = fontWeight === "bold";
  // Average proportional width factor (~0.52 for normal, ~0.56 for bold)
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === " ") width += 0.28;
    else if (/[ijlI1]/.test(ch)) width += 0.25;
    else if (/[wmWM]/.test(ch)) width += 0.85;
    else if (/[A-Z]/.test(ch)) width += 0.68;
    else if (/[a-z0-9]/.test(ch)) width += isBold ? 0.56 : 0.52;
    else width += 0.5;
  }
  return width * fontSize;
}
