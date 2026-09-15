/**
 * lib/seo/seo-validation.ts
 *
 * Automated SEO Validation & Readiness Evaluator.
 * Powers merchant feedback, pre-publish validation, and platform SEO diagnostics.
 */

import { ListingSEOEntity, SEOReadinessCheck, SEOReadinessReport, TenantSEOProfile } from "./seo-types";
import { extractImageUrls } from "./structured-data";

export function evaluateListingSEOReadiness(entity: ListingSEOEntity): SEOReadinessReport {
  const checks: SEOReadinessCheck[] = [];

  // 1. Name Check (Critical)
  const hasName = Boolean(entity.name && entity.name.trim().length >= 3);
  checks.push({
    id: "check-name",
    label: "Product / Listing Title",
    passed: hasName,
    severity: "CRITICAL",
    fixSuggestion: "Provide a clear, descriptive title of at least 3 characters.",
  });

  // 2. Description Length (Recommended)
  const descLen = (entity.description || entity.longDescription || "").trim().length;
  const hasGoodDesc = descLen >= 60;
  checks.push({
    id: "check-description",
    label: "Description Depth",
    passed: hasGoodDesc,
    severity: "RECOMMENDED",
    fixSuggestion: descLen === 0
      ? "Add a product description explaining features, benefits, and specifications."
      : `Description is only ${descLen} characters. Aim for at least 60 characters for search snippet visibility.`,
  });

  // 3. High-Resolution Images (Critical)
  const images = extractImageUrls(entity.images);
  const hasImages = images.length > 0;
  checks.push({
    id: "check-images",
    label: "Product Photography / Imagery",
    passed: hasImages,
    severity: "CRITICAL",
    fixSuggestion: "Upload at least one clear product image to qualify for Google Shopping and Rich Results.",
  });

  // 4. Pricing (Critical for commercial products)
  const price = entity.finalPrice ?? entity.sellingPrice;
  const hasValidPrice = typeof price === "number" && price > 0;
  checks.push({
    id: "check-price",
    label: "Price & Currency",
    passed: hasValidPrice,
    severity: "CRITICAL",
    fixSuggestion: "Set a valid selling price greater than zero to generate valid Offer structured data.",
  });

  // 5. Availability (Recommended)
  const hasAvailability = entity.isAvailable !== undefined;
  checks.push({
    id: "check-availability",
    label: "Inventory Availability Status",
    passed: hasAvailability,
    severity: "RECOMMENDED",
    fixSuggestion: "Ensure in-stock or availability flag is explicitly marked.",
  });

  // 6. Brand or Manufacturer (Optional)
  const hasBrand = Boolean(entity.brand || entity.make);
  checks.push({
    id: "check-brand",
    label: "Brand / Manufacturer",
    passed: hasBrand,
    severity: "OPTIONAL",
    fixSuggestion: "Specify the brand or manufacturer to enable brand filtering in search engines.",
  });

  // Calculate Weighted Score
  let score = 0;
  if (hasName) score += 25;
  if (hasGoodDesc) score += 25;
  if (hasImages) score += 25;
  if (hasValidPrice) score += 15;
  if (hasBrand) score += 10;

  const isReady = hasName && hasImages && hasValidPrice && score >= 70;

  return {
    score,
    status: isReady ? "SEO_READY" : "SEO_NEEDS_ATTENTION",
    checks,
    summary: isReady
      ? "Listing meets all critical search engine and rich result requirements."
      : "Listing has missing fields that will reduce search rankings or prevent rich snippets.",
  };
}

export function evaluateTenantStoreSEO(tenant: TenantSEOProfile): SEOReadinessReport {
  const checks: SEOReadinessCheck[] = [];

  const hasName = Boolean(tenant.name && tenant.name.trim().length >= 2);
  checks.push({
    id: "store-name",
    label: "Store Identity",
    passed: hasName,
    severity: "CRITICAL",
    fixSuggestion: "Provide a verified store name.",
  });

  const hasDesc = Boolean(tenant.description && tenant.description.trim().length >= 30);
  checks.push({
    id: "store-desc",
    label: "Business Bio / Tagline",
    passed: hasDesc,
    severity: "RECOMMENDED",
    fixSuggestion: "Add an informative business bio of at least 30 characters.",
  });

  const hasLogo = Boolean(tenant.logoUrl);
  checks.push({
    id: "store-logo",
    label: "Store Logo / Favicon",
    passed: hasLogo,
    severity: "RECOMMENDED",
    fixSuggestion: "Upload a store logo for Google Search brand knowledge panels and social previews.",
  });

  const hasContact = Boolean(tenant.contactPhone || tenant.contactEmail);
  checks.push({
    id: "store-contact",
    label: "Contact Information",
    passed: hasContact,
    severity: "RECOMMENDED",
    fixSuggestion: "Add a customer service telephone number or email address.",
  });

  const hasCustomDomain = Boolean(tenant.domain);
  checks.push({
    id: "store-domain",
    label: "Custom Domain Branding",
    passed: hasCustomDomain,
    severity: "OPTIONAL",
    fixSuggestion: "Connecting a custom domain (e.g. brand.com) dramatically improves long-term organic authority.",
  });

  let score = 0;
  if (hasName) score += 30;
  if (hasDesc) score += 25;
  if (hasLogo) score += 25;
  if (hasContact) score += 10;
  if (hasCustomDomain) score += 10;

  const isReady = hasName && hasDesc && hasLogo && score >= 70;

  return {
    score,
    status: isReady ? "SEO_READY" : "SEO_NEEDS_ATTENTION",
    checks,
    summary: isReady
      ? "Store profile has sufficient data for high-quality local and brand indexing."
      : "Store profile is missing key branding or contact information required for search snippets.",
  };
}
