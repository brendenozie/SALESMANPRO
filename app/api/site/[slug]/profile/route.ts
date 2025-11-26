// app/api/site/[slug]/profile/route.ts
// API endpoint for company/location profile data
import { NextResponse } from 'next/server';
import { getCompanyBySlug, getCompanyLocationBySlug, getTeamByCompany, getFAQsByCompany } from '@/lib/db';
import { validateSlug } from '@/lib/validations/site';
import { ApiResponse, CompanyProfileDTO } from '@/types/dto';

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: ApiResponse<any>, status = 200) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
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

// ---------------------------
// GET /api/site/[slug]/profile
// ---------------------------
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validate slug
    if (!validateSlug(slug)) {
      return withCors({ success: false, error: 'Invalid slug parameter' }, 400);
    }

    // Try to get company by slug first
    let company = await getCompanyBySlug(slug);

    // If not found, try company location
    if (!company) {
      const location = await getCompanyLocationBySlug(slug);
      if (location?.company) {
        company = await getCompanyBySlug(location.company.slug);
      }
    }

    if (!company) {
      return withCors({ success: false, error: 'Company not found' }, 404);
    }

    // Get additional data
    const [team, faqs] = await Promise.all([
      getTeamByCompany(company.id),
      getFAQsByCompany(company.id),
    ]);

    // Transform to DTO
    const profileData: CompanyProfileDTO = {
      id: company.id,
      name: company.name,
      slug: company.slug,
      tagline: company.tagline,
      description: company.description,
      logoUrl: company.logoUrl,
      bannerUrl: company.bannerUrl,
      videoUrl: company.videoUrl,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      address: company.address,
      geoLocation: company.geoLocation as Record<string, number> | null,
      openingHours: company.openingHours as Record<string, unknown> | null,
      currency: company.currency,
      locale: company.locale,
      category: company.category,
      variant: company.variant,
      themeSettings: company.themeSettings as Record<string, unknown> | null,
      pricingTiers: company.pricingTiers as unknown[],
      awards: company.awards as unknown[] | null,
      metrics: company.metrics as unknown[] | null,
      stats: company.stats as unknown[] | null,
      highlights: company.highlights as unknown[] | null,
      founderName: company.founderName,
      founderQuote: company.founderQuote,
      founderImage: company.founderImage,
      partnerLogos: company.partnerLogos as unknown[] | null,
      sectionSubtitle: company.sectionSubtitle,
      sectionTitle: company.sectionTitle,
      sectionDescription: company.sectionDescription,
      createdAt: company.createdAt?.toISOString() || '',
      updatedAt: company.updatedAt?.toISOString() || '',
      seo: company.SEO ? {
        id: company.SEO.id,
        title: company.SEO.title,
        description: company.SEO.description,
        keywords: company.SEO.keywords,
      } : null,
      socialLinks: company.socialLinks.map((link) => ({
        id: link.id,
        channel: link.channel || '',
        url: link.url,
      })),
      coreValues: company.CoreValues.map((value) => ({
        id: value.id,
        title: value.title,
        description: value.description,
        icon: value.icon,
      })),
      storeCategories: company.StoreCategory.map((sc) => ({
        id: sc.id,
        displayName: sc.displayName,
        icon: sc.icon,
        sortOrder: sc.sortOrder,
        visible: sc.visible,
        category: sc.category ? {
          id: sc.category.id,
          name: sc.category.name,
          slug: sc.category.slug,
          image: sc.category.image,
          icon: sc.category.icon,
        } : null,
      })),
      locations: company.CompanyLocation.map((cl: any) => ({
        id: cl.id,
        isPrimary: cl.isPrimary || false,
        location: cl.location ? {
          id: cl.location.id,
          name: cl.location.name,
          slug: cl.location.slug,
          parentId: cl.location.parentId,
          address: cl.location.address,
          city: cl.location.city,
          state: cl.location.state,
          country: cl.location.country,
          latitude: cl.location.latitude,
          longitude: cl.location.longitude,
        } : null,
      })),
    };

    return withCors({
      success: true,
      data: {
        profile: profileData,
        team,
        faqs,
      },
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return withCors({ success: false, error: 'Failed to fetch profile data' }, 500);
  }
}
