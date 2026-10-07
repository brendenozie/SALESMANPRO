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

import {
  TEMPLATE_REGISTRY,
  resolveCanonicalTemplate,
  TemplateDefinition,
  AuthenticSectionDefinition,
} from "./template-registry";
import { getEditableComponent } from "./editable-adapters";

export interface SectionCapabilityModel {
  canEdit: boolean;
  canHide: boolean;
  canMove: boolean;
  canDuplicate: boolean;
  canDelete: boolean;
  reasonIfProhibited?: string;
}

export interface SectionBuilderMetadata {
  id: string;
  name: string;
  component: string;
  type: string;
  category: string;
  capabilities: SectionCapabilityModel;
  editableFields: string[];
  collections: string[];
  dataSource?: {
    type: string;
    filter?: string;
    limit?: number;
  };
  mascotOperations: string[];
}

export interface ThemeBuilderCapabilities {
  canonicalThemeId: string;
  themeName: string;
  category: string;
  variant: string;
  shellLayout: string;
  bodyComponent: string;
  totalSections: number;
  sections: SectionBuilderMetadata[];
  supportedThemeTokens: string[];
  supportedMascotOperations: string[];
  capabilities: string[];
}

/**
 * Deterministically decides section lifecycle capabilities according to requirement 23:
 * - Singleton/critical commerce infrastructure cannot be deleted or duplicated.
 * - Standard content/media/banner/testimonial/feature sections can be duplicated, deleted, moved, hidden, edited.
 */
export function determineSectionCapabilities(sec: AuthenticSectionDefinition): SectionCapabilityModel {
  const type = (sec.type || "").toLowerCase();
  const comp = (sec.component || "").toLowerCase();
  const id = (sec.id || "").toLowerCase();

  const isCriticalCommerce =
    type === "cart" ||
    type === "checkout" ||
    comp.includes("checkout") ||
    comp.includes("cart") ||
    comp.includes("auth") ||
    id.includes("checkout");

  const isSingleton =
    type === "header" ||
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

/**
 * Extracts collection property keys (e.g. slides, items, badges, testimonials, faqs)
 */
export function detectSectionCollections(sec: AuthenticSectionDefinition): string[] {
  const collections: string[] = [];
  const content = sec.defaultContent || {};

  for (const [key, val] of Object.entries(content)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
      collections.push(key);
    }
  }

  // Known domain collections
  const lowerComp = (sec.component || "").toLowerCase();
  if (lowerComp.includes("slider") || lowerComp.includes("hero")) {
    if (!collections.includes("slides")) collections.push("slides");
  }
  if (lowerComp.includes("badge") || lowerComp.includes("feature")) {
    if (!collections.includes("badges")) collections.push("badges");
  }
  if (lowerComp.includes("testim")) {
    if (!collections.includes("testimonials")) collections.push("testimonials");
  }
  if (lowerComp.includes("faq")) {
    if (!collections.includes("faqs")) collections.push("faqs");
  }

  return collections;
}

/**
 * Discovers the complete Builder capabilities for a canonical template ID.
 */
export function getBuilderCapabilities(canonicalThemeId: string): ThemeBuilderCapabilities {
  const template = TEMPLATE_REGISTRY[canonicalThemeId] || resolveCanonicalTemplate(null, null, canonicalThemeId);

  const sections: SectionBuilderMetadata[] = (template.authenticSections || []).map((sec) => {
    const caps = determineSectionCapabilities(sec);
    const adapter = getEditableComponent(sec.component || sec.id);

    // Merge editable fields from sec.editableProps, defaultContent keys, and adapter
    const fieldSet = new Set<string>(sec.editableProps || []);
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
    ].filter(Boolean) as string[];

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

/**
 * Returns capability models for all 56 templates in the ecosystem.
 */
export function getAll56ThemeCapabilities(): Record<string, ThemeBuilderCapabilities> {
  const result: Record<string, ThemeBuilderCapabilities> = {};
  for (const themeId of Object.keys(TEMPLATE_REGISTRY)) {
    result[themeId] = getBuilderCapabilities(themeId);
  }
  return result;
}
