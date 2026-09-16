/**
 * lib/website-builder/template-registry.ts
 *
 * Centralized, authoritative Template Registry for SalesmanPro.
 * Defines all 56 physically implemented templates with canonical versioned IDs,
 * explicit page mappings, capability declarations, authentic component trees,
 * and deterministic alias resolution.
 *
 * Guaranteed: Original designs are preserved in full fidelity as the authoritative asset.
 */

import {
  TemplateDefinition,
  TemplatePageDefinition,
  AuthenticSectionDefinition,
  TemplateCapability,
  ThemeTokens,
  TemplateShellDefinition,
} from "@/types/website-builder";

import { ECOMMERCE_TEMPLATES } from "./registry/ecommerce";
import { BOOKINGS_TEMPLATES } from "./registry/bookings";
import { CONTENT_TEMPLATES } from "./registry/content";
import { PROFESSIONAL_TEMPLATES } from "./registry/professional";
import { PROPERTY_TEMPLATES } from "./registry/property";
import { AUTOMOTIVE_TEMPLATES } from "./registry/automotive";
import { EDUCATION_TEMPLATES } from "./registry/education";
import { LIFESTYLE_TEMPLATES } from "./registry/lifestyle";
import { MARKETPLACE_TEMPLATES } from "./registry/marketplace";
import { SECURITY_TEMPLATES } from "./registry/security";
import { DEFAULT_TEMPLATES } from "./registry/default";

import { ALIAS_TO_CANONICAL_ID, initAliases } from "./registry/aliases";
import { normalizeKey, makeEcommercePages, makeBookingPages, makeCoursePages, makeShell } from "./registry/helpers";

export type {
  TemplateDefinition,
  TemplatePageDefinition,
  AuthenticSectionDefinition,
  TemplateCapability,
  ThemeTokens,
  TemplateShellDefinition,
};

export {
  normalizeKey,
  makeEcommercePages,
  makeBookingPages,
  makeCoursePages,
  makeShell,
  ALIAS_TO_CANONICAL_ID,
};

/* =========================================================================
   CANONICAL TEMPLATE REGISTRY (ALL 56 TEMPLATES MERGED)
   ========================================================================= */

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  ...ECOMMERCE_TEMPLATES,
  ...BOOKINGS_TEMPLATES,
  ...CONTENT_TEMPLATES,
  ...PROFESSIONAL_TEMPLATES,
  ...PROPERTY_TEMPLATES,
  ...AUTOMOTIVE_TEMPLATES,
  ...EDUCATION_TEMPLATES,
  ...LIFESTYLE_TEMPLATES,
  ...MARKETPLACE_TEMPLATES,
  ...SECURITY_TEMPLATES,
  ...DEFAULT_TEMPLATES,
};

// Initialize alias lookups from merged registry
initAliases(TEMPLATE_REGISTRY);

/* =========================================================================
   DETERMINISTIC RESOLVER & HELPER FUNCTIONS
   ========================================================================= */

/**
 * Deterministically resolves a canonical TemplateDefinition from:
 * 1. Explicit tenant canonical template (direct match in registry, prioritizing specific template over generic defaults if a variant is given)
 * 2. Explicit tenant template variant
 * 3. Migrated legacy template identity
 * 4. Registry alias normalization
 * 5. Category + variant resolution
 * 6. Safe fallback to default-site@v1
 */
export function resolveCanonicalTemplate(
  category?: string | null,
  variant?: string | null,
  explicitTemplateId?: string | null,
): TemplateDefinition {
  // Stage 1: Explicit canonical template ID match (if specific)
  if (explicitTemplateId) {
    const directMatch = TEMPLATE_REGISTRY[explicitTemplateId];
    if (directMatch) {
      // If it's default-site@v1 placeholder BUT the tenant has an explicit business variant, let the variant resolve
      const isPlaceholder = directMatch.id === "default-site@v1";
      const hasSpecificVariant = variant && normalizeKey(variant) !== "default" && normalizeKey(variant) !== "other";
      if (!isPlaceholder || !hasSpecificVariant) {
        return directMatch;
      }
    }
  }

  // Stage 2: Explicit tenant template variant (most specific business intent)
  if (variant && normalizeKey(variant) !== "default" && normalizeKey(variant) !== "other") {
    const normVariant = normalizeKey(variant);
    const resolvedId = ALIAS_TO_CANONICAL_ID[normVariant];
    if (resolvedId && TEMPLATE_REGISTRY[resolvedId]) {
      return TEMPLATE_REGISTRY[resolvedId];
    }
  }

  // Stage 3 & 4: Migrated legacy template identity & Registry alias normalization on explicitTemplateId
  if (explicitTemplateId) {
    const normExplicit = normalizeKey(explicitTemplateId);
    const resolvedId = ALIAS_TO_CANONICAL_ID[normExplicit];
    if (resolvedId && TEMPLATE_REGISTRY[resolvedId]) {
      return TEMPLATE_REGISTRY[resolvedId];
    }
  }

  // Stage 5: Category + variant combined resolution or category alone
  if (category && variant) {
    const combinedNorm = normalizeKey(`${category}-${variant}`);
    const resolvedId = ALIAS_TO_CANONICAL_ID[combinedNorm];
    if (resolvedId && TEMPLATE_REGISTRY[resolvedId]) {
      return TEMPLATE_REGISTRY[resolvedId];
    }
  }

  if (category) {
    const normCat = normalizeKey(category);
    const resolvedId = ALIAS_TO_CANONICAL_ID[normCat];
    if (resolvedId && TEMPLATE_REGISTRY[resolvedId]) {
      return TEMPLATE_REGISTRY[resolvedId];
    }
  }

  // If explicitTemplateId was a generic default but nothing more specific resolved, return it
  if (explicitTemplateId && TEMPLATE_REGISTRY[explicitTemplateId]) {
    return TEMPLATE_REGISTRY[explicitTemplateId];
  }

  // Stage 6: Safe fallback to default template with non-silent warning log
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[TemplateResolver] Unknown template identity (cat: '${category}', variant: '${variant}', id: '${explicitTemplateId}'). Falling back to 'default-site@v1'.`
    );
  }

  return TEMPLATE_REGISTRY["default-site@v1"];
}

/**
 * Gets a template definition directly by its canonical ID
 */
export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY[id];
}

/**
 * Returns all 56 registered templates for admin catalog and palette selection
 */
export function getAllTemplates(): TemplateDefinition[] {
  return Object.values(TEMPLATE_REGISTRY);
}

/**
 * Resolves a company's canonical template
 */
export function getTemplateForCompany(company: any): TemplateDefinition {
  const explicitId = company?.website?.templateKey || company?.website?.templateId;
  return resolveCanonicalTemplate(company?.category, company?.variant, explicitId);
}

/**
 * Returns all templates that match a business category
 */
export function getTemplatesForCategory(category: string): TemplateDefinition[] {
  const norm = normalizeKey(category);
  return getAllTemplates().filter((t) => {
    const tCat = normalizeKey(t.category);
    return (
      tCat === norm ||
      (norm === "ecommerce" && tCat.startsWith("ecommerce")) ||
      (norm === "real-estate" && (tCat === "realestate" || tCat === "propertymanagement")) ||
      (norm === "bookings" && tCat === "bookings")
    );
  });
}
