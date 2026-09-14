"use strict";
/**
 * lib/website-builder/canonical-target-id.ts
 *
 * Authoritative Canonical Target Identity Engine for SalesmanPro Website Builder.
 *
 * Provides a single, deterministic identity format across:
 * - DOM metadata ([data-editable-id], [data-editor-component])
 * - Canvas click interception & element selection
 * - Inspector controls & component adapters
 * - Override storage & persistence (draftConfig & publishedConfig)
 * - Renderer binding & live preview
 * - Public storefront override resolution
 *
 * Canonical Format:
 *   [templateKey].[pageSlug].[sectionKey].[componentKey].[instanceKey].[fieldKey]
 *
 * Examples:
 *   - "ecommerce-shoes.home.hero.HeroSlider.slide-0.headline"
 *   - "restaurant.home.hero.RestaurantHero.slide-0.badgeText"
 *   - "global.global.header.Header.main.storeName"
 *   - "global.global.header.Header.nav-0.label"
 *   - "global.global.footer.Footer.main.copyrightText"
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCanonicalLookupKeys = exports.parseCanonicalTargetId = exports.buildCanonicalTargetId = void 0;
/**
 * Centrally construct a canonical target ID string.
 */
function buildCanonicalTargetId(parts) {
    const tpl = parts.templateKey || "global";
    const page = parts.pageSlug || "home";
    const section = parts.sectionKey || parts.componentKey.toLowerCase();
    const component = parts.componentKey;
    const instance = parts.instanceKey || "main";
    const field = parts.fieldKey;
    return `${tpl}.${page}.${section}.${component}.${instance}.${field}`;
}
exports.buildCanonicalTargetId = buildCanonicalTargetId;
/**
 * Parse any target ID (canonical, scoped, or legacy dotted format) into its structured identity.
 */
function parseCanonicalTargetId(targetId) {
    if (!targetId || typeof targetId !== "string") {
        return {
            raw: "",
            isCanonical: false,
            templateKey: "global",
            pageSlug: "home",
            sectionKey: "main",
            componentKey: "Component",
            instanceKey: "main",
            fieldKey: "",
        };
    }
    const parts = targetId.split(".");
    // 1. Full 6-part canonical format: [template].[page].[section].[component].[instance].[field]
    if (parts.length >= 6) {
        const templateKey = parts[0];
        const pageSlug = parts[1];
        const sectionKey = parts[2];
        const componentKey = parts[3];
        const instanceKey = parts[4];
        const fieldKey = parts.slice(5).join(".");
        let itemIndex;
        const match = instanceKey.match(/-?(\d+)$/);
        if (match) {
            itemIndex = parseInt(match[1], 10);
        }
        else {
            const fieldIndexMatch = fieldKey.match(/(?:^|\.)(\d+)(?:\.|$)/);
            if (fieldIndexMatch) {
                itemIndex = parseInt(fieldIndexMatch[1], 10);
            }
        }
        return {
            raw: targetId,
            isCanonical: true,
            templateKey,
            pageSlug,
            sectionKey,
            componentKey,
            instanceKey,
            fieldKey,
            itemIndex,
        };
    }
    // 2. Legacy EcommerceShoes format: "home.hero-slider.slides.0.headline"
    if (parts.length === 5 && parts[0] === "home") {
        const pageSlug = parts[0];
        const sectionKey = parts[1];
        const componentKey = sectionKey === "hero-slider" ? "HeroSlider" : sectionKey;
        const itemIndex = !isNaN(Number(parts[3])) ? Number(parts[3]) : undefined;
        const instanceKey = itemIndex !== undefined ? `slide-${itemIndex}` : parts[2];
        const fieldKey = parts[4];
        return {
            raw: targetId,
            isCanonical: false,
            templateKey: "global",
            pageSlug,
            sectionKey,
            componentKey,
            instanceKey,
            fieldKey,
            itemIndex,
        };
    }
    // 3. Slide-indexed format: "HeroSection.slide0.headline" or "RestaurantHero.slide-0.subline"
    if (parts.length === 3) {
        const componentKey = parts[0];
        const instancePart = parts[1];
        const fieldKey = parts[2];
        let itemIndex;
        const slideMatch = instancePart.match(/^slide-?(\d+)$/i);
        if (slideMatch) {
            itemIndex = parseInt(slideMatch[1], 10);
        }
        return {
            raw: targetId,
            isCanonical: false,
            templateKey: "global",
            pageSlug: "home",
            sectionKey: componentKey.toLowerCase().includes("hero") ? "hero" : componentKey.toLowerCase(),
            componentKey,
            instanceKey: itemIndex !== undefined ? `slide-${itemIndex}` : instancePart,
            fieldKey,
            itemIndex,
        };
    }
    // 4. Component.field format: "Header.storeName" or "header.storeName"
    if (parts.length === 2) {
        const componentKey = parts[0];
        const fieldKey = parts[1];
        const isHeader = componentKey.toLowerCase() === "header";
        const isFooter = componentKey.toLowerCase() === "footer";
        return {
            raw: targetId,
            isCanonical: false,
            templateKey: "global",
            pageSlug: isHeader || isFooter ? "global" : "home",
            sectionKey: isHeader ? "header" : isFooter ? "footer" : componentKey.toLowerCase(),
            componentKey: isHeader ? "Header" : isFooter ? "Footer" : componentKey,
            instanceKey: "main",
            fieldKey,
        };
    }
    // Fallback
    return {
        raw: targetId,
        isCanonical: false,
        templateKey: "global",
        pageSlug: "home",
        sectionKey: "main",
        componentKey: parts[0] || "Component",
        instanceKey: "main",
        fieldKey: parts.slice(1).join(".") || parts[0] || "",
    };
}
exports.parseCanonicalTargetId = parseCanonicalTargetId;
/**
 * Returns an ordered array of candidate override lookup keys.
 * Checks the exact raw key first, then canonical key, then known legacy aliases.
 * This guarantees that overrides stored under any historical format will resolve seamlessly.
 */
function getCanonicalLookupKeys(targetId, context) {
    if (!targetId)
        return [];
    const parsed = parseCanonicalTargetId(targetId);
    const keys = [];
    const addKey = (k) => {
        if (k && !keys.includes(k)) {
            keys.push(k);
        }
    };
    // 1. Exact raw key as provided (highest priority)
    addKey(targetId);
    // 2. Canonical key with contextual templateKey if available
    const templateKey = context?.templateKey || parsed.templateKey || "global";
    const pageSlug = context?.pageSlug || parsed.pageSlug || "home";
    const sectionKey = context?.sectionKey || parsed.sectionKey || "main";
    const canonicalKey = buildCanonicalTargetId({
        templateKey,
        pageSlug,
        sectionKey,
        componentKey: parsed.componentKey,
        instanceKey: parsed.instanceKey,
        fieldKey: parsed.fieldKey,
    });
    addKey(canonicalKey);
    // 3. Global template-scoped canonical key
    const globalCanonicalKey = buildCanonicalTargetId({
        templateKey: "global",
        pageSlug,
        sectionKey,
        componentKey: parsed.componentKey,
        instanceKey: parsed.instanceKey,
        fieldKey: parsed.fieldKey,
    });
    addKey(globalCanonicalKey);
    // 4. Slide & item aliases if instanceKey represents an indexed item
    if (parsed.itemIndex !== undefined) {
        const idx = parsed.itemIndex;
        // Format: Component.slide0.field
        addKey(`${parsed.componentKey}.slide${idx}.${parsed.fieldKey}`);
        // Format: Component.slide-0.field
        addKey(`${parsed.componentKey}.slide-${idx}.${parsed.fieldKey}`);
        // Format: Component.items.0.field
        addKey(`${parsed.componentKey}.items.${idx}.${parsed.fieldKey}`);
        addKey(`${parsed.componentKey}.items-${idx}.${parsed.fieldKey}`);
        addKey(`items.${idx}.${parsed.fieldKey}`);
        // Format: Component.features.0.field
        addKey(`${parsed.componentKey}.features.${idx}.${parsed.fieldKey}`);
        addKey(`${parsed.componentKey}.features-${idx}.${parsed.fieldKey}`);
        addKey(`features.${idx}.${parsed.fieldKey}`);
        // Format: Component.perks.0.field
        addKey(`${parsed.componentKey}.perks.${idx}.${parsed.fieldKey}`);
        addKey(`${parsed.componentKey}.perks-${idx}.${parsed.fieldKey}`);
        addKey(`perks.${idx}.${parsed.fieldKey}`);
        // Format: Component.services.0.field
        addKey(`${parsed.componentKey}.services.${idx}.${parsed.fieldKey}`);
        addKey(`${parsed.componentKey}.services-${idx}.${parsed.fieldKey}`);
        addKey(`services.${idx}.${parsed.fieldKey}`);
        // Format: Component.dishes.0.field
        addKey(`${parsed.componentKey}.dishes.${idx}.${parsed.fieldKey}`);
        addKey(`${parsed.componentKey}.dishes-${idx}.${parsed.fieldKey}`);
        addKey(`dishes.${idx}.${parsed.fieldKey}`);
        // Format: Component.values.0.field
        addKey(`${parsed.componentKey}.values.${idx}.${parsed.fieldKey}`);
        addKey(`${parsed.componentKey}.values-${idx}.${parsed.fieldKey}`);
        addKey(`values.${idx}.${parsed.fieldKey}`);
        // Format: Component.badges.0.field
        addKey(`${parsed.componentKey}.badges.${idx}.${parsed.fieldKey}`);
        addKey(`${parsed.componentKey}.badges-${idx}.${parsed.fieldKey}`);
        addKey(`badges.${idx}.${parsed.fieldKey}`);
        // Format: home.hero-slider.slides.0.field (for hero slider)
        if (parsed.componentKey.toLowerCase().includes("hero")) {
            addKey(`home.hero-slider.slides.${idx}.${parsed.fieldKey}`);
            addKey(`HeroSection.slide${idx}.${parsed.fieldKey}`);
            addKey(`HeroSection.slide-${idx}.${parsed.fieldKey}`);
            addKey(`RestaurantHero.slide${idx}.${parsed.fieldKey}`);
            addKey(`RestaurantHero.slide-${idx}.${parsed.fieldKey}`);
            addKey(`LuxuryCommandHero.slide${idx}.${parsed.fieldKey}`);
            addKey(`LuxuryCommandHero.slide-${idx}.${parsed.fieldKey}`);
            addKey(`AutomotiveHero.slide${idx}.${parsed.fieldKey}`);
            addKey(`AutomotiveHero.slide-${idx}.${parsed.fieldKey}`);
        }
    }
    // 5. Short component.field alias
    addKey(`${parsed.componentKey}.${parsed.fieldKey}`);
    addKey(`${parsed.componentKey.toLowerCase()}.${parsed.fieldKey}`);
    // 6. Bare leaf fieldKey fallback
    addKey(parsed.fieldKey);
    // 7. Header / Footer brand aliases
    if (parsed.componentKey.toLowerCase() === "header") {
        if (parsed.fieldKey === "storeName" || parsed.fieldKey === "brandName" || parsed.fieldKey === "title") {
            addKey("Header.storeName");
            addKey("Header.brandName");
            addKey("header.storeName");
            addKey("header.brandName");
            addKey("header.title");
        }
        if (parsed.fieldKey === "logoUrl" || parsed.fieldKey === "logo") {
            addKey("Header.logoUrl");
            addKey("header.logoUrl");
        }
    }
    if (parsed.componentKey.toLowerCase() === "footer") {
        if (parsed.fieldKey === "description" || parsed.fieldKey === "bio" || parsed.fieldKey === "bioText") {
            addKey("Footer.bio");
            addKey("footer.bio");
            addKey("Footer.bioText");
            addKey("footer.bioText");
            addKey("Footer.description");
            addKey("footer.description");
        }
        if (parsed.fieldKey === "copyrightText" || parsed.fieldKey === "copyright") {
            addKey("Footer.copyrightText");
            addKey("footer.copyrightText");
            addKey("footer.copyright");
        }
    }
    return keys;
}
exports.getCanonicalLookupKeys = getCanonicalLookupKeys;
