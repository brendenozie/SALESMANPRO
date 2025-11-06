import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { unstable_cache } from 'next/cache';

// --------------- 🧹 HELPERS ---------------

// Sanitize input slug
function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → hyphen
    .replace(/(^-|-$)+/g, '');   // trim hyphens
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

// Cached company check
const cachedFindCompanies = unstable_cache(
  async (orConditions) => {
    return prisma.company.findMany({
      where: { OR: orConditions },
      select: { slug: true, domain: true },
    });
  },
  ['company-unique-check'],
  { revalidate: 10 } // cache 10 seconds
);

// ---------------- 🔒 RATE LIMITER ----------------

// Simple in-memory rate limiter per IP
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 30; // 30 checks per minute per IP

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
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  let slug = searchParams.get('slug');
  let domain = searchParams.get('domain');

  if (!slug && !domain) {
    return NextResponse.json(
      { error: 'You must provide at least a slug or domain' },
      { status: 400 }
    );
  }

  // Sanitize slug and normalize
  slug = slug ? sanitizeSlug(slug) : null;
  domain = domain?.toLowerCase().trim() || null;

  // Auto-generate domain from slug if not provided
  if (!domain && slug) {
    domain = `${slug}.salesmanpro.site`;
  }

  // Ensure domain doesn’t conflict with internal subdomain namespace
  const isCustomDomain = domain!.endsWith('.salesmanpro.site');

  // Check potential conflicts (both slug and domain)
  const orConditions = [];
  if (slug) orConditions.push({ slug });
  if (domain) orConditions.push({ domain });

  const existing = await cachedFindCompanies(orConditions);

  const result = {
    slug: { value: slug, isUnique: true, suggestion: slug },
    domain: { value: domain, isUnique: true, suggestion: domain },
  };

  // Detect conflicts
  for (const item of existing) {
    if (slug && item.slug === slug) result.slug.isUnique = false;
    if (domain && item.domain === domain) result.domain.isUnique = false;
  }

  // Cross-conflict: custom domain vs subdomain
  if (isCustomDomain && existing.some((e) => e.domain === `${slug}.salesmanpro.site`)) {
    result.domain.isUnique = false;
  }

  // Suggest fallback slug/domain if conflicts exist
  if (slug && !result.slug.isUnique) {
    const fallbackSlug = await generateUniqueSlug(slug);
    result.slug.suggestion = fallbackSlug;

    if (domain?.includes(slug)) {
      const fallbackDomain = isCustomDomain
        ? domain.replace(slug, fallbackSlug)
        : `${fallbackSlug}.salesmanpro.site`;
      result.domain.suggestion = fallbackDomain;
    }
  }

  return NextResponse.json(result);
}
