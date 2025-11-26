// app/api/site/[slug]/events/route.ts
// API endpoint for event entries by company
import { NextResponse } from 'next/server';
import { getCompanyBySlug, getEventsByCompany } from '@/lib/db';
import { validateSlug, eventQuerySchema, parseQueryParams } from '@/lib/validations/site';
import { ApiResponse, EventDTO } from '@/types/dto';

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
// GET /api/site/[slug]/events
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
    const queryResult = parseQueryParams(searchParams, eventQuerySchema);

    if ('error' in queryResult) {
      return withCors({ success: false, error: queryResult.error }, 400);
    }

    // Get company
    const company = await getCompanyBySlug(slug);
    if (!company) {
      return withCors({ success: false, error: 'Company not found' }, 404);
    }

    // Get events
    const result = await getEventsByCompany(company.id, queryResult);

    // Transform to DTO
    const events: EventDTO[] = result.data.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime?.toISOString() || '',
      endDateTime: event.endDateTime?.toISOString() || null,
      location: event.location,
      eventStatus: event.eventStatus,
      eventType: event.eventType,
      maxCapacity: event.maxCapacity,
      isOnline: !!event.onlineMeetingLink,
      imageUrl: event.imageUrl,
      price: event.price,
      isPaid: event.isPaid,
      createdAt: event.createdAt?.toISOString() || '',
    }));

    return withCors({
      success: true,
      data: events,
      pagination: result.pagination,
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return withCors({ success: false, error: 'Failed to fetch events' }, 500);
  }
}
