// app/api/site/[slug]/media/route.ts
// API endpoint for media assets (photos, videos, albums) by company
import { NextResponse } from 'next/server';
import { 
  getCompanyBySlug, 
  getPhotosByCompany, 
  getVideosByCompany,
  getPhotoAlbumsByCompany,
  getVideoAlbumsByCompany
} from '@/lib/db';
import { validateSlug, mediaQuerySchema, parseQueryParams } from '@/lib/validations/site';
import { ApiResponse, PhotoDTO, VideoDTO, PhotoAlbumDTO, VideoAlbumDTO, MediaResponseDTO } from '@/types/dto';

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
// GET /api/site/[slug]/media
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
    const queryResult = parseQueryParams(searchParams, mediaQuerySchema);

    if ('error' in queryResult) {
      return withCors({ success: false, error: queryResult.error }, 400);
    }

    const { type, ...paginationOptions } = queryResult;

    // Get company
    const company = await getCompanyBySlug(slug);
    if (!company) {
      return withCors({ success: false, error: 'Company not found' }, 404);
    }

    const results: Partial<MediaResponseDTO> = {};

    // Fetch based on type parameter
    if (type === 'photos' || type === 'all') {
      const photoResult = await getPhotosByCompany(company.id, paginationOptions);
      results.photos = photoResult.data.map((photo): PhotoDTO => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        altText: photo.altText,
        title: photo.title,
        description: photo.description,
        tags: photo.tags,
        createdAt: photo.createdAt?.toISOString() || '',
      }));
    }

    if (type === 'videos' || type === 'all') {
      const videoResult = await getVideosByCompany(company.id, { ...paginationOptions, status: queryResult.status });
      results.videos = videoResult.data.map((video): VideoDTO => ({
        id: video.id,
        title: video.title,
        url: video.url,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        status: video.status,
        tags: video.tags,
        createdAt: video.createdAt?.toISOString() || '',
      }));
    }

    if (type === 'photoAlbums' || type === 'all') {
      const albumResult = await getPhotoAlbumsByCompany(company.id, paginationOptions);
      results.photoAlbums = albumResult.data.map((album): PhotoAlbumDTO => ({
        id: album.id,
        title: album.title,
        description: album.description,
        tags: album.tags,
        photos: album.photos.map((p: any) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          altText: p.altText,
        })),
        photoCount: album._count.photos,
        createdAt: album.createdAt?.toISOString() || '',
      }));
    }

    if (type === 'videoAlbums' || type === 'all') {
      const albumResult = await getVideoAlbumsByCompany(company.id, paginationOptions);
      results.videoAlbums = albumResult.data.map((album): VideoAlbumDTO => ({
        id: album.id,
        title: album.title,
        description: album.description,
        tags: album.tags,
        videos: album.videos.map((v: any) => ({
          id: v.id,
          thumbnailUrl: v.thumbnailUrl,
          title: v.title,
        })),
        videoCount: album._count.videos,
        createdAt: album.createdAt?.toISOString() || '',
      }));
    }

    return withCors({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error('Error fetching media:', error);
    return withCors({ success: false, error: 'Failed to fetch media assets' }, 500);
  }
}
