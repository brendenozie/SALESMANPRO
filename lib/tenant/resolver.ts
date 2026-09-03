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

import prisma from "../../server/db/prismadb";
import { cacheGet, cacheSet, cacheDel, fetchWithCache } from "../cache";

export interface ResolvedTenant {
  companyId: string;
  slug: string;
  domain: string | null;
  name: string;
  hasWebsite: boolean;
  sslStatus: string | null;
  domainVerified: boolean;
  currency: string;
  locale: string;
  source: "cache" | "database";
}

const DOMAIN_CACHE_TTL_SECONDS = 600; // 10 minutes

/**
 * Normalizes any incoming hostname:
 * - Lowercases and trims whitespace.
 * - Strips any port (e.g., ":3000" or ":443").
 * - Strips leading "www." for canonical lookup.
 */
export function normalizeHostname(rawHost: string | null | undefined): string {
  if (!rawHost) return "";
  return rawHost
    .split(":")[0]
    .trim()
    .toLowerCase()
    .replace(/^www\./, "");
}

/**
 * Builds a deterministic Redis key for domain-to-tenant mapping.
 */
export function buildDomainCacheKey(normalizedHost: string): string {
  return `tenant:domain:${normalizedHost}`;
}

/**
 * Resolves a tenant by hostname or store slug.
 *
 * Checks shared Redis cache first. If absent, performs a single authoritative
 * database lookup and caches the result with Singleflight protection.
 */
export async function resolveTenantByDomain(
  rawHost: string | null | undefined,
): Promise<ResolvedTenant | null> {
  const normalized = normalizeHostname(rawHost);
  if (!normalized) return null;

  // Platform root and internal hosts do not resolve to a tenant store
  const PLATFORM_DOMAIN = (process.env.PLATFORM_BASE_DOMAIN || "salesmanpro.site").toLowerCase();
  if (
    normalized === PLATFORM_DOMAIN ||
    normalized === `auth.${PLATFORM_DOMAIN}` ||
    normalized === "localhost" ||
    normalized === "127.0.0.1"
  ) {
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

  return fetchWithCache<ResolvedTenant | null>(
    cacheKey,
    async () => {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(targetSlugOrDomain);

      const company = await prisma.company.findFirst({
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

      const resolved: ResolvedTenant = {
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
    },
    {
      ttlSeconds: DOMAIN_CACHE_TTL_SECONDS,
      swrSeconds: 60,
    },
  );
}

/**
 * Invalidates domain cache cluster-wide across all application servers.
 * Call this whenever a company's domain, slug, or SSL status changes.
 */
export async function invalidateTenantDomainCache(options: {
  domain?: string | null;
  slug?: string | null;
  companyId?: string | null;
}): Promise<void> {
  const keysToInvalidate: string[] = [];

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
    await cacheDel(key).catch((err) => {
      console.warn(`[TenantResolver] Failed to invalidate cache key ${key}:`, err.message);
    });
  }

  // Also invalidate general company cache tag if companyId is present
  if (options.companyId) {
    await cacheDel(`tenant:${options.companyId}:company_details:*`).catch(() => {});
  }
}
