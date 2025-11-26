// app/api/site/[slug]/blog/route.ts
// API endpoint for blog entries by company
import { NextResponse } from 'next/server';
import { getCompanyBySlug, getBlogsByCompany } from '@/lib/db';
import { validateSlug, blogQuerySchema, parseQueryParams } from '@/lib/validations/site';
import { ApiResponse, BlogDTO } from '@/types/dto';

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
// GET /api/site/[slug]/blog
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
    const queryResult = parseQueryParams(searchParams, blogQuerySchema);

    if ('error' in queryResult) {
      return withCors({ success: false, error: queryResult.error }, 400);
    }

    // Get company
    const company = await getCompanyBySlug(slug);
    if (!company) {
      return withCors({ success: false, error: 'Company not found' }, 404);
    }

    // Get blogs
    const result = await getBlogsByCompany(company.id, queryResult);

    // Transform to DTO
    const blogs: BlogDTO[] = result.data.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      categories: blog.categories,
      tags: blog.tags,
      authorName: blog.authorName,
      status: blog.status,
      publishedAt: blog.publishedAt?.toISOString() || null,
      views: blog.views,
      likes: blog.likes,
      contentType: blog.contentType,
      createdAt: blog.createdAt?.toISOString() || '',
    }));

    return withCors({
      success: true,
      data: blogs,
      pagination: result.pagination,
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return withCors({ success: false, error: 'Failed to fetch blog entries' }, 500);
  }
}
