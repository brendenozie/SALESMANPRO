"use strict";
/**
 * lib/website-builder/builder-capability-registry.ts
 *
 * Authoritative Builder & Mascot Capability Registry for all 56 SalesmanPro Layouts.
 *
 * Provides unified, theme-agnostic capability discovery for:
 * - Section lifecycle operations (edit, hide, move, duplicate, delete)
 * - Editable field schemas and collection support
 * - Mascot AI mutation compatibility
 * - Runtime data source bindings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll56ThemeCapabilities = exports.getBuilderCapabilities = exports.detectSectionCollections = exports.determineSectionCapabilities = void 0;
const template_registry_1 = require("./template-registry");
const editable_adapters_1 = require("./editable-adapters");
/**
 * Deterministically decides section lifecycle capabilities according to requirement 23:
 * - Singleton/critical commerce infrastructure cannot be deleted or duplicated.
 * - Standard content/media/banner/testimonial/feature sections can be duplicated, deleted, moved, hidden, edited.
 */
function determineSectionCapabilities(sec) {
    const type = (sec.type || "").toLowerCase();
    const comp = (sec.component || "").toLowerCase();
    const id = (sec.id || "").toLowerCase();
    const isCriticalCommerce = type === "cart" ||
        type === "checkout" ||
        comp.includes("checkout") ||
        comp.includes("cart") ||
        comp.includes("auth") ||
        id.includes("checkout");
    const isSingleton = type === "header" ||
        type === "footer" ||
        comp.includes("header") ||
        comp.includes("footer") ||
        id.includes("header") ||
        id.includes("footer") ||
        id.includes("hero") || // Hero is usually singleton per layout
        type === "hero";
    if (isCriticalCommerce) {
        return {
            canEdit: true,
            canHide: false,
            canMove: false,
            canDuplicate: false,
            canDelete: false,
            reasonIfProhibited: "Critical commerce infrastructure cannot be hidden, deleted or duplicated",
        };
    }
    if (isSingleton) {
        return {
            canEdit: true,
            canHide: true,
            canMove: true,
            canDuplicate: false,
            canDelete: false,
            reasonIfProhibited: "Singleton hero/header/footer cannot be duplicated or deleted",
        };
    }
    return {
        canEdit: true,
        canHide: true,
        canMove: true,
        canDuplicate: true,
        canDelete: true,
    };
}
exports.determineSectionCapabilities = determineSectionCapabilities;
/**
 * Extracts collection property keys (e.g. slides, items, badges, testimonials, faqs)
 */
function detectSectionCollections(sec) {
    const collections = [];
    const content = sec.defaultContent || {};
    for (const [key, val] of Object.entries(content)) {
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
            collections.push(key);
        }
    }
    // Known domain collections
    const lowerComp = (sec.component || "").toLowerCase();
    if (lowerComp.includes("slider") || lowerComp.includes("hero")) {
        if (!collections.includes("slides"))
            collections.push("slides");
    }
    if (lowerComp.includes("badge") || lowerComp.includes("feature")) {
        if (!collections.includes("badges"))
            collections.push("badges");
    }
    if (lowerComp.includes("testim")) {
        if (!collections.includes("testimonials"))
            collections.push("testimonials");
    }
    if (lowerComp.includes("faq")) {
        if (!collections.includes("faqs"))
            collections.push("faqs");
    }
    return collections;
}
exports.detectSectionCollections = detectSectionCollections;
/**
 * Discovers the complete Builder capabilities for a canonical template ID.
 */
function getBuilderCapabilities(canonicalThemeId) {
    const template = template_registry_1.TEMPLATE_REGISTRY[canonicalThemeId] || (0, template_registry_1.resolveCanonicalTemplate)(null, null, canonicalThemeId);
    const sections = (template.authenticSections || []).map((sec) => {
        const caps = determineSectionCapabilities(sec);
        const adapter = (0, editable_adapters_1.getEditableComponent)(sec.component || sec.id);
        // Merge editable fields from sec.editableProps, defaultContent keys, and adapter
        const fieldSet = new Set(sec.editableProps || []);
        if (sec.defaultContent && typeof sec.defaultContent === "object") {
            Object.keys(sec.defaultContent).forEach((k) => fieldSet.add(k));
        }
        if (adapter && adapter.properties) {
            Object.keys(adapter.properties).forEach((k) => fieldSet.add(k));
        }
        const collections = detectSectionCollections(sec);
        const mascotOperations = [
            "update_section_content",
            "update_section_style",
            caps.canMove ? "move_section" : null,
            caps.canHide ? "toggle_visibility" : null,
            caps.canDuplicate ? "duplicate_section" : null,
            caps.canDelete ? "remove_section" : null,
            "update_override",
        ].filter(Boolean);
        return {
            id: sec.id,
            name: sec.name,
            component: sec.component,
            type: sec.type,
            category: sec.category || "content",
            capabilities: caps,
            editableFields: Array.from(fieldSet),
            collections,
            dataSource: sec.dataSource,
            mascotOperations,
        };
    });
    return {
        canonicalThemeId: template.id,
        themeName: template.name,
        category: template.category,
        variant: template.variant,
        shellLayout: template.shellLayout,
        bodyComponent: template.bodyComponent,
        totalSections: sections.length,
        sections,
        supportedThemeTokens: [
            "primaryColor",
            "secondaryColor",
            "accentColor",
            "headingFont",
            "bodyFont",
            "buttonRadius",
            "cardRadius",
        ],
        supportedMascotOperations: [
            "update_theme_tokens",
            "update_section_content",
            "update_section_style",
            "add_section",
            "remove_section",
            "move_section",
            "create_page",
            "update_navigation",
            "update_override",
        ],
        capabilities: template.capabilities || [],
    };
}
exports.getBuilderCapabilities = getBuilderCapabilities;
/**
 * Returns capability models for all 56 templates in the ecosystem.
 */
function getAll56ThemeCapabilities() {
    const result = {};
    for (const themeId of Object.keys(template_registry_1.TEMPLATE_REGISTRY)) {
        result[themeId] = getBuilderCapabilities(themeId);
    }
    return result;
}
exports.getAll56ThemeCapabilities = getAll56ThemeCapabilities;
