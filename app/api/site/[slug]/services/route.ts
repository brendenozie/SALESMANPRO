// app/api/site/[slug]/services/route.ts
// API endpoint for services and pricing tiers by company
import { NextResponse } from 'next/server';
import { getCompanyBySlug, getServicesByCompany, getTestimonialsByCompany } from '@/lib/db';
import { validateSlug, serviceQuerySchema, parseQueryParams } from '@/lib/validations/site';
import { ApiResponse, ServiceDTO, TestimonialDTO } from '@/types/dto';

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
// GET /api/site/[slug]/services
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = parseQueryParams(searchParams, serviceQuerySchema);

    if ('error' in queryResult) {
      return withCors({ success: false, error: queryResult.error }, 400);
    }

    // Check if we want testimonials as well
    const includeTestimonials = searchParams.get('includeTestimonials') === 'true';

    // Get company
    const company = await getCompanyBySlug(slug);
    if (!company) {
      return withCors({ success: false, error: 'Company not found' }, 404);
    }

    // Get services
    const serviceResult = await getServicesByCompany(company.id, queryResult);

    // Transform services to DTO
    const services: ServiceDTO[] = serviceResult.data.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      status: service.status,
      createdAt: service.createdAt?.toISOString() || '',
    }));

    // Build response
    const responseData: {
      services: ServiceDTO[];
      pricingTiers: unknown[];
      testimonials?: TestimonialDTO[];
    } = {
      services,
      pricingTiers: company.pricingTiers as unknown[],
    };

    // Optionally include testimonials
    if (includeTestimonials) {
      const testimonialResult = await getTestimonialsByCompany(company.id, { status: 'APPROVED' });
      responseData.testimonials = testimonialResult.data.map((t) => ({
        id: t.id,
        quote: t.quote,
        authorName: t.authorName,
        authorTitle: t.authorTitle,
        avatarUrl: t.avatarUrl,
        rating: t.rating,
        status: t.status,
      }));
    }

    return withCors({
      success: true,
      data: responseData,
      pagination: serviceResult.pagination,
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    return withCors({ success: false, error: 'Failed to fetch services' }, 500);
  }
}
