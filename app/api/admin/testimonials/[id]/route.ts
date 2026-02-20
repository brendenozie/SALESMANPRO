import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/testimonials/[id]/route.ts
import prisma from '@/server/db/prismadb';
import { formatResponse } from "@/lib/formatResponse";

import { withApiHandler } from '@/lib/hooks/withApiHandler';

// GET /api/testimonials/[id]
async function handleGET(request: Request, { params }: { params: { id: string } }) {
  
  const { id } = params;

  try {
    
    const cacheKey = `admin:testimonials:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, image: true } },
      },
    });

    if (!testimonial) {
      return formatResponse(false, null, 'Testimonial not found', 404);
    }

  try {
    if (testimonial) {
      await cacheSet(cacheKey, testimonial, 60);
    }
  } catch (e) {}

  
    return formatResponse(true, testimonial);
  } catch (error: any) {
    console.error('Failed to fetch testimonial:', error);
    return formatResponse(false, null, 'Failed to fetch testimonial', 500);
  }
}

// PUT /api/testimonials/[id]
async function handlePUT(request: Request, { params }: { params: { id: string } }) {
  
  const { id } = params;

  try {
    const body = await request.json();
    const { quote, authorName, authorTitle, status } = body;

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: { quote, authorName, authorTitle, status },
    });

    
    try { await cacheDel(`admin:testimonials:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedTestimonial);
  } catch (error: any) {
    console.error('Failed to update testimonial:', error);
    return formatResponse(false, null, 'Failed to update testimonial', 500);
  }
}

// DELETE /api/testimonials/[id]
async function handleDELETE(request: Request, { params }: { params: { id: string } }) {
  


  const { id } = params;

  try {
    await prisma.testimonial.delete({ where: { id } });
    
    try { await cacheDel(`admin:testimonials:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { message: 'Testimonial deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete testimonial:', error);
    return formatResponse(false, null, 'Failed to delete testimonial', 500);
  }
}

// Export handlers wrapped in withApiHandler
export const GET = withApiHandler(handleGET);
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
