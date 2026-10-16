import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { unstable_cache } from 'next/cache';

// --------------- 🧹 HELPERS ---------------
// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}


// Sanitize input slug
function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → hyphen
    .replace(/(^-|-$)+/g, '');   // trim hyphens
}

// Generate unique store name fallback (e.g., Tech Store → Tech Store 2)
async function generateUniqueName(base: string): Promise<string> {
  let name = base;
  let counter = 2;

  while (true) {
    const exists = await prisma.company.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (!exists) break;
    name = `${base} ${counter++}`;
  }

  return name;
}

// Generate unique slug fallback (e.g., techstore → techstore-2)
async function generateUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 2;

  while (true) {
    const exists = await prisma.company.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) break;
    slug = `${base}-${counter++}`;
  }

  return slug;
}

// ---------------- 🔒 RATE LIMITER ----------------

// Simple in-memory rate limiter per IP
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 60; // 60 checks per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > 60_000) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count < RATE_LIMIT) {
    record.count++;
    return true;
  }

  return false;
}

// --------------- 🚀 API ROUTE ---------------

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  if (!checkRateLimit(ip)) {
    return withCors({ error: "Rate limit exceeded. Try again later." }, 429);
  }

  const { searchParams } = new URL(req.url);
  let name = searchParams.get("name");
  let slug = searchParams.get("slug");
  let domain = searchParams.get("domain");
  const excludeId = searchParams.get("excludeId") || searchParams.get("companyId");

  if (!name && !slug && !domain) {
    return withCors(
      { error: "You must provide at least a store name, slug, or domain" },
      400
    );
  }

  name = name ? name.trim() : null;
  slug = slug ? sanitizeSlug(slug) : null;
  domain = domain?.toLowerCase().trim() || null;

  // Auto-generate domain from slug if not provided
  if (!domain && slug) {
    domain = `${slug}.salesmanpro.site`;
  }

  const isCustomDomain = domain?.endsWith(".salesmanpro.site");

  // Check potential conflicts
  const orConditions: any[] = [];
  if (name && name.length >= 2) {
    orConditions.push({ name: { equals: name, mode: "insensitive" } });
  }
  if (slug) orConditions.push({ slug });
  if (domain) orConditions.push({ domain });

  const existing = orConditions.length > 0
    ? await prisma.company.findMany({
        where: {
          OR: orConditions,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true, name: true, slug: true, domain: true },
      })
    : [];

  const result: {
    name?: { value: string | null; isUnique: boolean; suggestion?: string };
    slug?: { value: string | null; isUnique: boolean; suggestion?: string };
    domain?: { value: string | null; isUnique: boolean; suggestion?: string };
  } = {};

  if (name) {
    result.name = { value: name, isUnique: true, suggestion: name };
  }
  if (slug) {
    result.slug = { value: slug, isUnique: true, suggestion: slug };
  }
  if (domain) {
    result.domain = { value: domain, isUnique: true, suggestion: domain };
  }

  // Detect conflicts
  for (const item of existing) {
    if (excludeId && item.id === excludeId) continue;
    if (name && item.name?.trim().toLowerCase() === name.toLowerCase() && result.name) {
      result.name.isUnique = false;
    }
    if (slug && item.slug === slug && result.slug) {
      result.slug.isUnique = false;
    }
    if (domain && item.domain === domain && result.domain) {
      result.domain.isUnique = false;
    }
  }

  // Cross-conflict: custom domain vs subdomain
  if (
    isCustomDomain &&
    slug &&
    existing.some((e) => (!excludeId || e.id !== excludeId) && e.domain === `${slug}.salesmanpro.site`) &&
    result.domain
  ) {
    result.domain.isUnique = false;
  }

  // Suggest fallback name if taken
  if (name && result.name && !result.name.isUnique) {
    const fallbackName = await generateUniqueName(name);
    result.name.suggestion = fallbackName;
  }

  // Suggest fallback slug/domain if conflicts exist
  if (slug && result.slug && !result.slug.isUnique) {
    const fallbackSlug = await generateUniqueSlug(slug);
    result.slug.suggestion = fallbackSlug;

    if (domain?.includes(slug) && result.domain) {
      const fallbackDomain = isCustomDomain
        ? domain.replace(slug, fallbackSlug)
        : `${fallbackSlug}.salesmanpro.site`;
      result.domain.suggestion = fallbackDomain;
    }
  }

  return withCors(result);
}
