/**
 * lib/tenant/domain-service.ts
 *
 * Centralized Domain Lifecycle & Management Service.
 *
 * Manages:
 * - Domain onboarding and claiming validation.
 * - Cryptographic ownership verification (DNS TXT / CNAME / A-record checks).
 * - Domain state machine:
 *     PENDING -> VERIFYING -> VERIFIED -> PROVISIONING -> ACTIVE / ERROR / REMOVED
 * - Cluster-safe de-provisioning and cache purge.
 */

import prisma from "../../server/db/prismadb";
import { promises as dns } from "dns";
import crypto from "crypto";
import { invalidateTenantDomainCache, normalizeHostname } from "./resolver";

export type DomainSslStatus =
  | "PENDING"
  | "VERIFYING"
  | "VERIFIED"
  | "PROVISIONING"
  | "ISSUING"
  | "ACTIVE"
  | "FAILED"
  | "ERROR"
  | "RENEWING"
  | "REMOVED";

export interface DomainVerificationResult {
  verified: boolean;
  method: "TXT" | "CNAME" | "A" | "NONE";
  details?: string;
}

const resolveA = dns.resolve4.bind(dns);
const resolveCname = dns.resolveCname.bind(dns);
const resolveTxt = dns.resolveTxt.bind(dns);

/**
 * Generates a unique, cryptographically secure domain verification token.
 */
export function generateVerificationToken(companyId: string): string {
  const hash = crypto.randomBytes(16).toString("hex");
  return `salesmanpro-verify-${hash}`;
}

/**
 * Checks DNS records for domain ownership.
 *
 * Validates either:
 * 1. TXT record containing `_salesmanpro-challenge.{domain}` or verification token
 * 2. CNAME record pointing to platform base domain (e.g. `domains.salesmanpro.site` or `salesmanpro.site`)
 * 3. A record pointing to the platform VPS IP
 */
export async function verifyDomainOwnership(
  rawDomain: string,
  expectedToken?: string | null,
): Promise<DomainVerificationResult> {
  const domain = normalizeHostname(rawDomain);
  const PLATFORM_BASE_DOMAIN = (process.env.PLATFORM_BASE_DOMAIN || "salesmanpro.site").toLowerCase();
  const VPS_IP = process.env.VPS_IP || "";

  // 1. Check TXT records if verification token provided
  if (expectedToken) {
    try {
      const txtRecords = await resolveTxt(`_salesmanpro-challenge.${domain}`).catch(() => []);
      const flattenedTxt = txtRecords.flat().map((t) => t.trim());
      if (flattenedTxt.includes(expectedToken)) {
        return { verified: true, method: "TXT", details: "Verified via challenge TXT record" };
      }

      // Also check root domain TXT records
      const rootTxt = await resolveTxt(domain).catch(() => []);
      const flattenedRoot = rootTxt.flat().map((t) => t.trim());
      if (flattenedRoot.includes(expectedToken)) {
        return { verified: true, method: "TXT", details: "Verified via root TXT record" };
      }
    } catch {}
  }

  // 2. Check CNAME records
  try {
    const cnameRecords = await resolveCname(domain).catch(() => [] as string[]);
    const pointsToPlatform = cnameRecords.some((c) => {
      const lower = c.toLowerCase().replace(/\.$/, "");
      return lower.endsWith(PLATFORM_BASE_DOMAIN) || lower === PLATFORM_BASE_DOMAIN;
    });

    if (pointsToPlatform) {
      return { verified: true, method: "CNAME", details: `CNAME points to ${PLATFORM_BASE_DOMAIN}` };
    }
  } catch {}

  // 3. Check A records against VPS_IP
  if (VPS_IP) {
    try {
      const aRecords = await resolveA(domain).catch(() => [] as string[]);
      if (aRecords.includes(VPS_IP)) {
        return { verified: true, method: "A", details: `A record points to server IP (${VPS_IP})` };
      }
    } catch {}
  }

  return {
    verified: false,
    method: "NONE",
    details: "DNS not pointing to platform. Please configure CNAME or A record.",
  };
}

/**
 * Connects a custom domain to a company with ownership validation.
 */
export async function registerCustomDomain(options: {
  companyId: string;
  domain: string;
}): Promise<{
  success: boolean;
  domain: string;
  dnsVerified: boolean;
  sslStatus: DomainSslStatus;
  message: string;
}> {
  const normalized = normalizeHostname(options.domain);

  // 1. Find target company
  const company = await prisma.company.findUnique({
    where: { id: options.companyId },
    select: { id: true, domain: true, slug: true },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  // 2. Prevent Domain Hijacking (check if domain is already claimed by another company)
  const existingClaim = await prisma.company.findFirst({
    where: {
      domain: normalized,
      NOT: { id: options.companyId },
    },
    select: { id: true, name: true },
  });

  if (existingClaim) {
    throw new Error("This domain is already registered to another store.");
  }

  // 3. Verify DNS records
  const dnsCheck = await verifyDomainOwnership(normalized);

  const newSslStatus: DomainSslStatus = dnsCheck.verified ? "PENDING" : "FAILED";
  const sslError = dnsCheck.verified ? null : dnsCheck.details;

  // 4. Update company record authoritatively
  await prisma.company.update({
    where: { id: options.companyId },
    data: {
      domain: normalized,
      hasWebsite: true,
      domainVerified: dnsCheck.verified,
      sslStatus: newSslStatus,
      sslError,
    },
  });

  // 5. Invalidate domain cache cluster-wide
  await invalidateTenantDomainCache({
    domain: normalized,
    slug: company.slug,
    companyId: options.companyId,
  });

  return {
    success: true,
    domain: normalized,
    dnsVerified: dnsCheck.verified,
    sslStatus: newSslStatus,
    message: dnsCheck.verified
      ? "Domain verified! SSL issuance has been queued."
      : "Domain saved. Please update your DNS records to complete verification.",
  };
}

/**
 * Completely removes a custom domain from a company, cleaning up state and purging cache.
 */
export async function removeCustomDomain(companyId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, domain: true, slug: true },
  });

  if (!company || !company.domain) {
    return { success: true, message: "No domain associated with this store." };
  }

  const oldDomain = company.domain;

  // Clear domain from company
  await prisma.company.update({
    where: { id: companyId },
    data: {
      domain: null,
      domainVerified: false,
      sslStatus: "REMOVED",
      sslError: null,
    },
  });

  // Purge domain cache across all servers
  await invalidateTenantDomainCache({
    domain: oldDomain,
    slug: company.slug,
    companyId: companyId,
  });

  return {
    success: true,
    message: `Domain ${oldDomain} removed successfully.`,
  };
}
