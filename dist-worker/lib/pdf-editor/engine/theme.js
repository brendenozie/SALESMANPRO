"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createThemeBatchOperations = exports.PRESET_THEMES = void 0;
exports.PRESET_THEMES = [
    {
        id: "navy-teal",
        name: "Navy & Teal Corporate",
        primaryColor: { r: 10, g: 37, b: 64 },
        accentColor: { r: 14, g: 116, b: 144 },
        backgroundColor: { r: 255, g: 255, b: 255 },
        headingFont: "Helvetica",
        bodyFont: "Helvetica",
        tableHeaderColor: { r: 10, g: 37, b: 64 },
        tableHeaderTextColor: { r: 255, g: 255, b: 255 },
    },
    {
        id: "aurum-gold",
        name: "Aurum Executive Gold",
        primaryColor: { r: 25, g: 25, b: 27 },
        accentColor: { r: 201, g: 162, b: 39 },
        backgroundColor: { r: 255, g: 255, b: 255 },
        headingFont: "Helvetica",
        bodyFont: "Helvetica",
        tableHeaderColor: { r: 25, g: 25, b: 27 },
        tableHeaderTextColor: { r: 201, g: 162, b: 39 },
    },
    {
        id: "emerald-slate",
        name: "Emerald & Slate Professional",
        primaryColor: { r: 15, g: 23, b: 42 },
        accentColor: { r: 16, g: 185, b: 129 },
        backgroundColor: { r: 255, g: 255, b: 255 },
        headingFont: "Helvetica",
        bodyFont: "Helvetica",
        tableHeaderColor: { r: 15, g: 23, b: 42 },
        tableHeaderTextColor: { r: 255, g: 255, b: 255 },
    },
];
/**
 * Creates a batch of operations to apply a theme across a PDFDocumentModel.
 */
function createThemeBatchOperations(doc, theme) {
    const ops = [];
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
            }
            else if (el.kind === "text") {
                // Update heading typography
                if (el.role === "heading") {
                    const patch = {
                        fontFamily: theme.headingFont,
                    };
                    const prev = {
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
exports.createThemeBatchOperations = createThemeBatchOperations;
