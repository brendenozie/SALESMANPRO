// app/api/site/[slug]/products/route.ts
// API endpoint for products and listings by company
import { NextResponse } from 'next/server';
import { getCompanyBySlug, getProductsByCompany, getListingsByCompany } from '@/lib/db';
import { validateSlug, productQuerySchema, parseQueryParams } from '@/lib/validations/site';
import { ApiResponse, ProductDTO, ListingDTO } from '@/types/dto';

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
// GET /api/site/[slug]/products
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
    const type = searchParams.get('type') || 'all'; // 'products', 'listings', or 'all'
    const queryResult = parseQueryParams(searchParams, productQuerySchema);

    if ('error' in queryResult) {
      return withCors({ success: false, error: queryResult.error }, 400);
    }

    // Get company
    const company = await getCompanyBySlug(slug);
    if (!company) {
      return withCors({ success: false, error: 'Company not found' }, 404);
    }

    // Get products and/or listings based on type
    const results: { products?: ProductDTO[]; listings?: ListingDTO[]; pagination?: any } = {};

    if (type === 'products' || type === 'all') {
      const productResult = await getProductsByCompany(company.id, queryResult);
      results.products = productResult.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
        category: product.category,
        tags: product.tags,
        sellingPrice: product.sellingPrice,
        finalPrice: product.finalPrice,
        discount: product.discount,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        status: product.status,
        createdAt: product.createdAt?.toISOString() || '',
      }));
      if (type === 'products') {
        results.pagination = productResult.pagination;
      }
    }

    if (type === 'listings' || type === 'all') {
      const listingResult = await getListingsByCompany(company.id, queryResult);
      results.listings = listingResult.data.map((listing) => ({
        id: listing.id,
        name: listing.name,
        description: listing.description,
        images: listing.images,
        category: listing.category,
        type: listing.type,
        sellingPrice: listing.sellingPrice,
        finalPrice: listing.finalPrice,
        discount: listing.discount,
        isAvailable: listing.isAvailable,
        isFeatured: listing.isFeatured,
        status: listing.status,
        location: listing.location,
        locationName: listing.locationName,
        createdAt: listing.createdAt?.toISOString() || '',
      }));
      if (type === 'listings') {
        results.pagination = listingResult.pagination;
      }
    }

    return withCors({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return withCors({ success: false, error: 'Failed to fetch products' }, 500);
  }
}
