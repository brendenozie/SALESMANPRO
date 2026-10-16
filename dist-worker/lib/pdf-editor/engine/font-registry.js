"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.measureTextWidth = exports.embedFontInDoc = exports.resolveFontWithReport = exports.resolveFont = exports.getCustomFonts = exports.registerCustomFont = exports.SUPPORTED_FONTS = void 0;
const pdf_lib_1 = require("pdf-lib");
exports.SUPPORTED_FONTS = [
    // Helvetica family
    {
        family: "Helvetica",
        weight: "normal",
        style: "normal",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.Helvetica,
        postScriptName: "Helvetica",
        displayName: "Helvetica Regular",
    },
    {
        family: "Helvetica",
        weight: "bold",
        style: "normal",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.HelveticaBold,
        postScriptName: "Helvetica-Bold",
        displayName: "Helvetica Bold",
    },
    {
        family: "Helvetica",
        weight: "normal",
        style: "italic",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.HelveticaOblique,
        postScriptName: "Helvetica-Oblique",
        displayName: "Helvetica Italic",
    },
    {
        family: "Helvetica",
        weight: "bold",
        style: "italic",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.HelveticaBoldOblique,
        postScriptName: "Helvetica-BoldOblique",
        displayName: "Helvetica Bold Italic",
    },
    // Times Roman family
    {
        family: "Times",
        weight: "normal",
        style: "normal",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.TimesRoman,
        postScriptName: "Times-Roman",
        displayName: "Times Roman Regular",
    },
    {
        family: "Times",
        weight: "bold",
        style: "normal",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.TimesRomanBold,
        postScriptName: "Times-Bold",
        displayName: "Times Roman Bold",
    },
    {
        family: "Times",
        weight: "normal",
        style: "italic",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.TimesRomanItalic,
        postScriptName: "Times-Italic",
        displayName: "Times Roman Italic",
    },
    {
        family: "Times",
        weight: "bold",
        style: "italic",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.TimesRomanBoldItalic,
        postScriptName: "Times-BoldItalic",
        displayName: "Times Roman Bold Italic",
    },
    // Courier family
    {
        family: "Courier",
        weight: "normal",
        style: "normal",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.Courier,
        postScriptName: "Courier",
        displayName: "Courier Regular",
    },
    {
        family: "Courier",
        weight: "bold",
        style: "normal",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.CourierBold,
        postScriptName: "Courier-Bold",
        displayName: "Courier Bold",
    },
    {
        family: "Courier",
        weight: "normal",
        style: "italic",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.CourierOblique,
        postScriptName: "Courier-Oblique",
        displayName: "Courier Italic",
    },
    {
        family: "Courier",
        weight: "bold",
        style: "italic",
        isStandard14: true,
        standardFontName: pdf_lib_1.StandardFonts.CourierBoldOblique,
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
const CUSTOM_FONTS = new Map();
function registerCustomFont(family, data, options) {
    const cleanFamily = family.trim();
    const weight = options?.weight || "normal";
    const style = options?.style || "normal";
    const key = `${cleanFamily.toLowerCase()}_${weight}_${style}`;
    let bytes;
    let dataUrl;
    if (typeof data === "string") {
        dataUrl = data;
        const base64Part = data.includes(",") ? data.split(",")[1] : data;
        bytes = new Uint8Array(Buffer.from(base64Part, "base64"));
    }
    else {
        bytes = data;
        const b64 = Buffer.from(bytes).toString("base64");
        dataUrl = `data:font/opentype;base64,${b64}`;
    }
    const cleanPostScript = cleanFamily.replace(/[^A-Za-z0-9]/g, "") + (weight === "bold" ? "Bold" : "Regular");
    const fontDef = {
        family: cleanFamily,
        weight,
        style,
        isStandard14: false,
        postScriptName: cleanPostScript,
        displayName: options?.displayName || `${cleanFamily} ${weight === "bold" ? "Bold" : "Regular"} (Custom)`,
        isCustom: true,
        customBytes: bytes,
        customDataUrl: dataUrl,
    };
    CUSTOM_FONTS.set(key, fontDef);
    if (!CUSTOM_FONTS.has(cleanFamily.toLowerCase())) {
        CUSTOM_FONTS.set(cleanFamily.toLowerCase(), fontDef);
    }
    return fontDef;
}
exports.registerCustomFont = registerCustomFont;
function getCustomFonts() {
    return Array.from(new Set(CUSTOM_FONTS.values()));
}
exports.getCustomFonts = getCustomFonts;
/**
 * Resolves the closest matching FontDefinition for a given family, weight, style.
 */
function resolveFont(family, weight = "normal", style = "normal") {
    const normFam = family.toLowerCase().trim();
    // Check custom fonts first
    const customKey = `${normFam}_${weight}_${style}`;
    if (CUSTOM_FONTS.has(customKey)) {
        return CUSTOM_FONTS.get(customKey);
    }
    if (CUSTOM_FONTS.has(normFam)) {
        return CUSTOM_FONTS.get(normFam);
    }
    // Direct match by family + weight + style
    let match = exports.SUPPORTED_FONTS.find((f) => f.family.toLowerCase() === normFam &&
        f.weight === weight &&
        f.style === style);
    if (match)
        return match;
    // Fallback 1: match family with default style
    match = exports.SUPPORTED_FONTS.find((f) => f.family.toLowerCase() === normFam && f.weight === weight);
    if (match)
        return match;
    // Fallback 2: match family alone
    match = exports.SUPPORTED_FONTS.find((f) => f.family.toLowerCase() === normFam);
    if (match)
        return match;
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
exports.resolveFont = resolveFont;
function resolveFontWithReport(family, weight = "normal", style = "normal") {
    const resolved = resolveFont(family, weight, style);
    const exact = resolved.family.toLowerCase() === family.trim().toLowerCase()
        && resolved.weight === weight
        && resolved.style === style;
    return {
        requestedFamily: family,
        requestedWeight: weight,
        requestedStyle: style,
        resolved,
        embedded: resolved.isStandard14 || Boolean(resolved.isCustom),
        ...(exact ? {} : {
            fallbackReason: `Requested ${family} ${weight} ${style}; resolved to ${resolved.family} ${resolved.weight} ${resolved.style}`,
        }),
    };
}
exports.resolveFontWithReport = resolveFontWithReport;
/**
 * Embeds a font into a pdf-lib PDFDocument.
 */
async function embedFontInDoc(pdfDoc, fontDef) {
    // If custom font with binary bytes: embed using fontkit
    if (fontDef.isCustom && fontDef.customBytes) {
        try {
            const fontkit = await Promise.resolve().then(() => __importStar(require("@pdf-lib/fontkit"))).then((m) => m.default || m);
            pdfDoc.registerFontkit(fontkit);
            return await pdfDoc.embedFont(fontDef.customBytes);
        }
        catch (err) {
            console.warn(`[embedFontInDoc] Failed to embed custom font ${fontDef.family}, falling back to standard:`, err);
        }
    }
    if (fontDef.isStandard14 && fontDef.standardFontName) {
        return pdfDoc.embedStandardFont(fontDef.standardFontName);
    }
    // For non-standard fonts (Inter, Roboto), if custom TTF is not bundled in environment,
    // we use Helvetica/HelveticaBold with documented fallback note, or embed standard font.
    // Note: Standard Helvetica is universally compatible without embedding binary bloat.
    const fallbackStandard = fontDef.weight === "bold" && fontDef.style === "italic"
        ? pdf_lib_1.StandardFonts.HelveticaBoldOblique
        : fontDef.weight === "bold"
            ? pdf_lib_1.StandardFonts.HelveticaBold
            : fontDef.style === "italic"
                ? pdf_lib_1.StandardFonts.HelveticaOblique
                : pdf_lib_1.StandardFonts.Helvetica;
    return pdfDoc.embedStandardFont(fallbackStandard);
}
exports.embedFontInDoc = embedFontInDoc;
/**
 * Approximate text width calculation in points based on font and font size.
 */
function measureTextWidth(text, fontFamily, fontSize, fontWeight = "normal") {
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
        if (ch === " ")
            width += 0.28;
        else if (/[ijlI1]/.test(ch))
            width += 0.25;
        else if (/[wmWM]/.test(ch))
            width += 0.85;
        else if (/[A-Z]/.test(ch))
            width += 0.68;
        else if (/[a-z0-9]/.test(ch))
            width += isBold ? 0.56 : 0.52;
        else
            width += 0.5;
    }
    return width * fontSize;
}
exports.measureTextWidth = measureTextWidth;
