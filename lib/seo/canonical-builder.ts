/**
 * lib/seo/canonical-builder.ts
 *
 * Deterministic Canonical URL Builder for the Multi-Tenant Architecture.
 *
 * Enforces:
 * 1. Absolute, clean HTTPS URLs.
 * 2. Strict tenant isolation (preventing custom domain or subdomain leaks).
 * 3. Prevention of internal routing path leaks (`/site/[slug]` is NEVER public canonical).
 * 4. Stripping tracking, session, and filter queries (`utm_*`, `fbclid`, `?sort=`, `?page=`).
 */

import { CanonicalUrlOptions, SiteType } from "./seo-types";

export const PRIMARY_PLATFORM_DOMAIN = "salesmanpro.site";
export const PRIMARY_GHUBA_DOMAIN = "ghuba.shop";

const TRACKING_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "ref",
  "_ga",
  "preview",
  "isEditor",
]);

/**
 * Sanitizes and normalizes a hostname.
 */
export function cleanHost(rawHost?: string | null): string {
  if (!rawHost) return "";
  return rawHost
    .split(":")[0]
    .trim()
    .toLowerCase()
    .replace(/^www\./, "");
}

/**
 * Strips tracking parameters from a URL path.
 */
export function cleanPathAndQuery(rawPath: string): string {
  if (!rawPath) return "/";
  try {
    const dummyUrl = new URL(rawPath, "https://placeholder.internal");
    const cleanParams = new URLSearchParams();

    dummyUrl.searchParams.forEach((value, key) => {
      if (!TRACKING_QUERY_PARAMS.has(key.toLowerCase()) && !key.startsWith("utm_")) {
        cleanParams.append(key, value);
      }
    });

    let pathname = dummyUrl.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    const qs = cleanParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  } catch {
    const clean = rawPath.split("?")[0].trim();
    return clean.startsWith("/") ? clean : `/${clean}`;
  }
}

/**
 * Resolves the authoritative public host for a given context.
 */
export function resolveCanonicalHost(
  siteType: SiteType,
  tenant?: { slug: string; domain?: string | null } | null,
  requestHost?: string | null
): string {
  const normReq = cleanHost(requestHost);

  // 1. Ghuba Marketplace
  if (siteType === "GHUBA") {
    return PRIMARY_GHUBA_DOMAIN;
  }

  // 2. SalesmanPro SaaS Platform Hub
  if (siteType === "SALESMANPRO") {
    return PRIMARY_PLATFORM_DOMAIN;
  }

  // 3. Tenant Storefront
  if (tenant) {
    // If tenant has an active custom domain verified
    if (tenant.domain) {
      const cleanCustom = cleanHost(tenant.domain);
      if (
        cleanCustom &&
        cleanCustom !== PRIMARY_PLATFORM_DOMAIN &&
        cleanCustom !== PRIMARY_GHUBA_DOMAIN &&
        !cleanCustom.endsWith(`.${PRIMARY_PLATFORM_DOMAIN}`) &&
        cleanCustom !== "localhost" &&
        cleanCustom !== "127.0.0.1"
      ) {
        return cleanCustom;
      }
    }

    // If incoming request is a valid custom domain or subdomain matching tenant
    if (normReq && normReq !== PRIMARY_PLATFORM_DOMAIN && normReq !== PRIMARY_GHUBA_DOMAIN) {
      if (normReq.endsWith(`.${PRIMARY_PLATFORM_DOMAIN}`)) {
        return normReq;
      }
      // Verified custom domain request
      if (normReq !== "localhost" && normReq !== "127.0.0.1") {
        return normReq;
      }
    }

    // Default tenant canonical host: tenant subdomain on salesmanpro.site
    if (tenant.slug && tenant.slug !== "ghuba") {
      return `${tenant.slug}.${PRIMARY_PLATFORM_DOMAIN}`;
    }
  }

  return PRIMARY_PLATFORM_DOMAIN;
}

/**
 * Builds the authoritative canonical URL.
 */
export function buildCanonicalUrl(options: CanonicalUrlOptions): string {
  if (options.override) {
    try {
      const parsed = new URL(options.override);
      return `${parsed.origin}${cleanPathAndQuery(parsed.pathname + parsed.search)}`;
    } catch {
      // If relative override, append to resolved host
    }
  }

  const host = resolveCanonicalHost(options.siteType, options.tenant, options.requestHost);
  let path = cleanPathAndQuery(options.path || "/");

  // CRITICAL: Strip internal Next.js multi-tenant routing prefixes
  // e.g. /site/mystore/products/123 -> /products/123
  if (options.tenant?.slug) {
    const internalPrefixRegex = new RegExp(`^/site/${options.tenant.slug}(/|$)`, "i");
    path = path.replace(internalPrefixRegex, "/");
  } else {
    path = path.replace(/^\/site\/[^/]+(\/|$)/i, "/");
  }

  // Ensure single leading slash
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  // If root, remove trailing slash
  if (path === "/") {
    return `https://${host}`;
  }

  return `https://${host}${path}`;
}
