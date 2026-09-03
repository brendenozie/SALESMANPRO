"use strict";
/**
 * lib/tenant/resolver.ts
 *
 * Centralized, Authoritative Tenant Domain Resolution Service.
 *
 * Designed for horizontal scaling across multiple servers:
 * - Deterministic, sanitized hostname normalization.
 * - Multi-tier caching:
 *     Layer 1: Redis shared cache with tenant-safe keys (`tenant:domain:{host}`)
 *     Layer 2: Singleflight stampede protection (deduplicates concurrent fetches)
 *     Layer 3: Single-query MongoDB fallback across slug, domain, www.domain, and id
 * - Safe cluster-wide cache invalidation across all servers.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateTenantDomainCache = exports.resolveTenantByDomain = exports.buildDomainCacheKey = exports.normalizeHostname = void 0;
const prismadb_1 = __importDefault(require("../../server/db/prismadb"));
const cache_1 = require("../cache");
const DOMAIN_CACHE_TTL_SECONDS = 600; // 10 minutes
/**
 * Normalizes any incoming hostname:
 * - Lowercases and trims whitespace.
 * - Strips any port (e.g., ":3000" or ":443").
 * - Strips leading "www." for canonical lookup.
 */
function normalizeHostname(rawHost) {
    if (!rawHost)
        return "";
    return rawHost
        .split(":")[0]
        .trim()
        .toLowerCase()
        .replace(/^www\./, "");
}
exports.normalizeHostname = normalizeHostname;
/**
 * Builds a deterministic Redis key for domain-to-tenant mapping.
 */
function buildDomainCacheKey(normalizedHost) {
    return `tenant:domain:${normalizedHost}`;
}
exports.buildDomainCacheKey = buildDomainCacheKey;
/**
 * Resolves a tenant by hostname or store slug.
 *
 * Checks shared Redis cache first. If absent, performs a single authoritative
 * database lookup and caches the result with Singleflight protection.
 */
async function resolveTenantByDomain(rawHost) {
    const normalized = normalizeHostname(rawHost);
    if (!normalized)
        return null;
    // Platform root and internal hosts do not resolve to a tenant store
    const PLATFORM_DOMAIN = (process.env.PLATFORM_BASE_DOMAIN || "salesmanpro.site").toLowerCase();
    if (normalized === PLATFORM_DOMAIN ||
        normalized === `auth.${PLATFORM_DOMAIN}` ||
        normalized === "localhost" ||
        normalized === "127.0.0.1") {
        return null;
    }
    // Extract store slug if it's a platform subdomain (e.g. "store.salesmanpro.site" -> "store")
    let targetSlugOrDomain = normalized;
    if (normalized.endsWith(`.${PLATFORM_DOMAIN}`)) {
        targetSlugOrDomain = normalized.replace(`.${PLATFORM_DOMAIN}`, "");
        if (targetSlugOrDomain === "www" || targetSlugOrDomain === "auth") {
            return null;
        }
    }
    const cacheKey = buildDomainCacheKey(normalized);
    return (0, cache_1.fetchWithCache)(cacheKey, async () => {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(targetSlugOrDomain);
        const company = await prismadb_1.default.company.findFirst({
            where: {
                OR: [
                    { slug: targetSlugOrDomain },
                    { domain: normalized },
                    { domain: `www.${normalized}` },
                    { domain: targetSlugOrDomain },
                    ...(isObjectId ? [{ id: targetSlugOrDomain }] : []),
                ],
            },
            select: {
                id: true,
                slug: true,
                domain: true,
                name: true,
                hasWebsite: true,
                sslStatus: true,
                domainVerified: true,
                currency: true,
                locale: true,
            },
        });
        if (!company) {
            return null;
        }
        const resolved = {
            companyId: company.id,
            slug: company.slug,
            domain: company.domain,
            name: company.name,
            hasWebsite: Boolean(company.hasWebsite),
            sslStatus: company.sslStatus || "PENDING",
            domainVerified: Boolean(company.domainVerified),
            currency: company.currency || "KES",
            locale: company.locale || "en-US",
            source: "database",
        };
        return resolved;
    }, {
        ttlSeconds: DOMAIN_CACHE_TTL_SECONDS,
        swrSeconds: 60,
    });
}
exports.resolveTenantByDomain = resolveTenantByDomain;
/**
 * Invalidates domain cache cluster-wide across all application servers.
 * Call this whenever a company's domain, slug, or SSL status changes.
 */
async function invalidateTenantDomainCache(options) {
    const keysToInvalidate = [];
    if (options.domain) {
        const normDomain = normalizeHostname(options.domain);
        keysToInvalidate.push(buildDomainCacheKey(normDomain));
        keysToInvalidate.push(buildDomainCacheKey(`www.${normDomain}`));
    }
    if (options.slug) {
        const normSlug = options.slug.trim().toLowerCase();
        keysToInvalidate.push(buildDomainCacheKey(normSlug));
        const PLATFORM_DOMAIN = (process.env.PLATFORM_BASE_DOMAIN || "salesmanpro.site").toLowerCase();
        keysToInvalidate.push(buildDomainCacheKey(`${normSlug}.${PLATFORM_DOMAIN}`));
    }
    for (const key of keysToInvalidate) {
        await (0, cache_1.cacheDel)(key).catch((err) => {
            console.warn(`[TenantResolver] Failed to invalidate cache key ${key}:`, err.message);
        });
    }
    // Also invalidate general company cache tag if companyId is present
    if (options.companyId) {
        await (0, cache_1.cacheDel)(`tenant:${options.companyId}:company_details:*`).catch(() => { });
    }
}
exports.invalidateTenantDomainCache = invalidateTenantDomainCache;
