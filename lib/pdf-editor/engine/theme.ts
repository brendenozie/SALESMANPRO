/**
 * lib/pdf-editor/engine/theme.ts
 *
 * Theme Engine for global document styling and presets.
 * Supports:
 *   - Preset themes (Navy/Teal/White, Corporate Gold, Modern Charcoal, Executive Blue)
 *   - Custom theme creation
 *   - Previewing theme transformations
 *   - Generating batch EditorOperations to update text, accent bars, and panels
 */

import type { RGBColor, PDFDocumentModel } from "../model/types";
import { applyOperation, type EditorOperation } from "../model/operations";

export interface DocumentTheme {
  id: string;
  name: string;
  primaryColor: RGBColor;
  accentColor: RGBColor;
  backgroundColor: RGBColor;
  headingFont: string;
  bodyFont: string;
  tableHeaderColor: RGBColor;
  tableHeaderTextColor: RGBColor;
}

export const PRESET_THEMES: DocumentTheme[] = [
  {
    id: "navy-teal",
    name: "Navy & Teal Corporate",
    primaryColor: { r: 10, g: 37, b: 64 }, // Navy
    accentColor: { r: 14, g: 116, b: 144 }, // Teal
    backgroundColor: { r: 255, g: 255, b: 255 }, // White
    headingFont: "Helvetica",
    bodyFont: "Helvetica",
    tableHeaderColor: { r: 10, g: 37, b: 64 },
    tableHeaderTextColor: { r: 255, g: 255, b: 255 },
  },
  {
    id: "aurum-gold",
    name: "Aurum Executive Gold",
    primaryColor: { r: 25, g: 25, b: 27 }, // Dark charcoal
    accentColor: { r: 201, g: 162, b: 39 }, // Rich Gold
    backgroundColor: { r: 255, g: 255, b: 255 },
    headingFont: "Helvetica",
    bodyFont: "Helvetica",
    tableHeaderColor: { r: 25, g: 25, b: 27 },
    tableHeaderTextColor: { r: 201, g: 162, b: 39 },
  },
  {
    id: "emerald-slate",
    name: "Emerald & Slate Professional",
    primaryColor: { r: 15, g: 23, b: 42 }, // Slate 900
    accentColor: { r: 16, g: 185, b: 129 }, // Emerald 500
    backgroundColor: { r: 255, g: 255, b: 255 },
    headingFont: "Helvetica",
    bodyFont: "Helvetica",
    tableHeaderColor: { r: 15, g: 23, b: 42 },
    tableHeaderTextColor: { r: 255, g: 255, b: 255 },
  },
];

export const BUILTIN_THEMES = PRESET_THEMES;

export function applyTheme(doc: PDFDocumentModel, themeId: string): PDFDocumentModel {
  const theme = BUILTIN_THEMES.find((candidate) => candidate.id === themeId);
  if (!theme) {
    throw new Error(`Unknown PDF theme: ${themeId}`);
  }
  return createThemeBatchOperations(doc, theme).reduce(
    (current, operation) => applyOperation(current, operation),
    doc,
  );
}

/**
 * Creates a batch of operations to apply a theme across a PDFDocumentModel.
 */
export function createThemeBatchOperations(
  doc: PDFDocumentModel,
  theme: DocumentTheme
): EditorOperation[] {
  const ops: EditorOperation[] = [];

  for (const page of doc.pages) {
    for (const el of page.elements) {
      if (el.kind === "shape") {
        // Update accent bars (gold bars -> theme.accentColor)
        if (el.role === "accent" && el.fill) {
          ops.push({
            type: "updateElement",
            intent: "color",
            pageId: page.id,
            elementId: el.id,
            patch: { fill: { ...theme.accentColor } },
            previous: { fill: { ...el.fill } },
          });
        }
        // Update background/panel shapes (dark cover panel -> theme.primaryColor)
        else if (el.role === "background" && el.fill) {
          ops.push({
            type: "updateElement",
            intent: "color",
            pageId: page.id,
            elementId: el.id,
            patch: { fill: { ...theme.primaryColor } },
            previous: { fill: { ...el.fill } },
          });
        }
      } else if (el.kind === "text") {
        // Update heading typography
        if (el.role === "heading") {
          const patch: any = {
            fontFamily: theme.headingFont,
          };
          const prev: any = {
            fontFamily: el.fontFamily,
          };
          ops.push({
            type: "updateElement",
            intent: "theme",
            pageId: page.id,
            elementId: el.id,
            patch,
            previous: prev,
          });
        }
      }
    }
  }

  return ops;
}
