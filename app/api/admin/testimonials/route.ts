import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/testimonials/route.ts
import prisma from '@/server/db/prismadb';
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// GET /api/testimonials
async function handleGET(request: Request) {
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = String(status);

    
    const cacheKey = `admin:testimonials:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const testimonials = await prisma.testimonial.findMany({
      where,
      // orderBy: { createdAt: 'desc' },
    });

  try {
    if (testimonials) {
      await cacheSet(cacheKey, testimonials, 60);
    }
  } catch (e) {}

    return formatResponse(true, { testimonials, cached: false });
  } catch (error: any) {
    console.error('Failed to fetch testimonials:', error);
    return formatResponse(false, null, 'Failed to fetch testimonials', 500);
  }
}

// POST /api/testimonials
async function handlePOST(request: Request) {
  


  try {
    const body = await request.json();
    const { quote, authorId, authorName, authorTitle, status, companyId } = body;

    const newTestimonial = await prisma.testimonial.create({
      data: { quote, authorId, authorName, authorTitle, status, companyId },
    });

    
    try { await cacheDel(`admin:testimonials:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { newTestimonial });
  } catch (error: any) {
    console.error('Failed to create testimonial:', error);
    return formatResponse(false, null, 'Failed to create testimonial', 500);
  }
}

// Export handlers wrapped in withApiHandler
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
