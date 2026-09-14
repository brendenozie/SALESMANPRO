"use strict";
/**
 * lib/tenant/tenant-router.ts
 *
 * Centralized, Authoritative Tenant-Aware Routing and URL Construction Service.
 *
 * Solves:
 * 1. Storefront links escaping tenant context.
 * 2. Leaking internal `/site/[slug]` prefixes into tenant subdomain or custom-domain URLs.
 * 3. Local development 404s when template namespaces (e.g. `/ecommerceshoes/...`) are requested without `/site/[slug]`.
 * 4. Preservation of query parameters (e.g. `?subcategory=personalized-gifts`).
 * 5. Accidental duplication of path segments (e.g. `/site/slug/site/slug` or `/ecommerceshoes/ecommerceshoes`).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveInternalRoute = exports.buildTenantUrl = exports.sanitizePath = exports.classifyTenantHost = exports.normalizeHost = void 0;
const PRIMARY_DOMAIN = "salesmanpro.site";
/**
 * Normalizes host by stripping ports and www prefix
 */
function normalizeHost(rawHost) {
    if (!rawHost)
        return "";
    return rawHost.split(":")[0].trim().toLowerCase().replace(/^www\./, "");
}
exports.normalizeHost = normalizeHost;
/**
 * Classifies the hosting environment for URL routing
 */
function classifyTenantHost(host) {
    const norm = normalizeHost(host);
    if (!norm || norm === "localhost" || norm === "127.0.0.1" || host.includes(":3000")) {
        return { isLocalhost: true, isTenantSubdomain: false, isCustomDomain: false, isPrimaryHub: false };
    }
    if (norm === PRIMARY_DOMAIN || norm === `www.${PRIMARY_DOMAIN}` || norm === `auth.${PRIMARY_DOMAIN}`) {
        return { isLocalhost: false, isTenantSubdomain: false, isCustomDomain: false, isPrimaryHub: true };
    }
    if (norm.endsWith(`.${PRIMARY_DOMAIN}`)) {
        const sub = norm.replace(`.${PRIMARY_DOMAIN}`, "");
        if (sub && sub !== "www" && sub !== "auth") {
            return { isLocalhost: false, isTenantSubdomain: true, isCustomDomain: false, isPrimaryHub: false, subdomain: sub };
        }
    }
    return { isLocalhost: false, isTenantSubdomain: false, isCustomDomain: true, isPrimaryHub: false };
}
exports.classifyTenantHost = classifyTenantHost;
/**
 * Cleans a path by ensuring single leading slash, removing duplicate segments,
 * and stripping any leading /site/[slug] prefix so it can be re-routed canonically.
 */
function sanitizePath(rawPath, tenantSlug) {
    if (!rawPath)
        return { cleanPath: "", existingQuery: "" };
    // Split path from query
    const [pathPart, queryPart] = rawPath.split("?");
    let p = pathPart.trim();
    // Ensure leading slash
    if (!p.startsWith("/")) {
        p = `/${p}`;
    }
    // Remove duplicate slashes
    p = p.replace(/\/+/g, "/");
    // Strip duplicate template namespaces like /ecommerceshoes/ecommerceshoes -> /ecommerceshoes
    p = p.replace(/\/([a-zA-Z0-9_-]+)\/\1(\/|$)/g, "/$1$2");
    // Strip leading /site/[slug] or /[slug] prefix if present to obtain relative tenant path
    const sitePrefixRegex = new RegExp(`^(?:/site)?/${tenantSlug}(/|$)`, "i");
    p = p.replace(sitePrefixRegex, "/");
    // Clean trailing slash unless root
    if (p.length > 1 && p.endsWith("/")) {
        p = p.slice(0, -1);
    }
    return {
        cleanPath: p === "/" ? "" : p,
        existingQuery: queryPart || "",
    };
}
exports.sanitizePath = sanitizePath;
/**
 * Builds a deterministic, tenant-aware URL for storefront buttons, links, and redirects.
 */
function buildTenantUrl({ slug: rawSlug, tenantSlug, path, query, context = {}, }) {
    const slug = rawSlug || tenantSlug || "";
    // Determine current host
    let currentHost = context.host;
    if (!currentHost && typeof window !== "undefined") {
        currentHost = window.location.host;
    }
    if (!currentHost) {
        currentHost = process.env.NEXT_PUBLIC_APP_URL
            ? normalizeHost(process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, ""))
            : "localhost:3000";
    }
    const { isLocalhost, isTenantSubdomain, isCustomDomain, isPrimaryHub } = classifyTenantHost(currentHost);
    const { cleanPath, existingQuery } = sanitizePath(path, slug);
    // Merge query parameters cleanly without duplicates or data loss
    const searchParams = new URLSearchParams(existingQuery);
    if (query) {
        if (typeof query === "string") {
            const extraParams = new URLSearchParams(query.replace(/^\?/, ""));
            extraParams.forEach((val, key) => searchParams.set(key, val));
        }
        else {
            Object.entries(query).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    searchParams.set(key, String(val));
                }
            });
        }
    }
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
    // 1. TENANT SUBDOMAIN OR CUSTOM DOMAIN (e.g. shoes-store.salesmanpro.site or mybrand.com)
    // The host itself represents the tenant root! Never prepend /site/[slug].
    if (isTenantSubdomain || isCustomDomain) {
        const relativePath = cleanPath ? cleanPath : "/";
        if (context.fullUrl) {
            const proto = context.protocol || (typeof window !== "undefined" ? window.location.protocol.replace(":", "") : "https");
            return `${proto}://${currentHost}${relativePath}${queryString}`;
        }
        return `${relativePath}${queryString}`;
    }
    // 2. LOCALHOST OR PRIMARY PLATFORM HUB (e.g. localhost:3000 or salesmanpro.site)
    // Storefront is canonically accessed via /site/[slug] route.
    const canonicalPath = cleanPath ? `/site/${slug}${cleanPath}` : `/site/${slug}`;
    if (context.fullUrl) {
        const proto = context.protocol || (typeof window !== "undefined" ? window.location.protocol.replace(":", "") : (isLocalhost ? "http" : "https"));
        return `${proto}://${currentHost}${canonicalPath}${queryString}`;
    }
    return `${canonicalPath}${queryString}`;
}
exports.buildTenantUrl = buildTenantUrl;
/**
 * Resolves an internal route safely for editor preview or public navigation
 */
function resolveInternalRoute(slug, target, isEditor = false) {
    if (target.startsWith("http://") || target.startsWith("https://") || target.startsWith("mailto:") || target.startsWith("tel:") || target.startsWith("#")) {
        return target;
    }
    return buildTenantUrl({
        slug,
        path: target,
        context: { isEditor },
    });
}
exports.resolveInternalRoute = resolveInternalRoute;
