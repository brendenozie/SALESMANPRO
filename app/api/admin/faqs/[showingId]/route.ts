import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import { PrismaClient } from '@prisma/client';
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // New import
import { formatResponse } from "@/lib/formatResponse"; // New import
import { verifyAuth } from '@/lib/verifyAuth';

// Initialize Prisma Client (Note: In a typical setup, this should be a singleton import)
const prisma = new PrismaClient();

interface Params {
  params: { id: string };
}

// =======================================================================
// GET /api/faqs/[id]
// Fetches a specific FAQ by ID.
// =======================================================================
async function getFaq(req: Request, { params }: Params) {
  

  const faqId = params.id;
  if (!faqId) {
    return formatResponse(false, null, "Missing FAQ ID.", 400);
  }

  
    const cacheKey = `admin:faqs:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const faq = await prisma.fAQ.findUnique({
    where: { id: faqId },
  });

  try {
    if (faq) {
      await cacheSet(cacheKey, faq, 60);
    }
  } catch (e) {}

  if (!faq) {
    return formatResponse(false, null, 'FAQ not found.', 404);
  }

  return formatResponse(true, { data: faq }, null, 200);
}

// =======================================================================
// PUT /api/faqs/[id]
// Updates an existing FAQ.
// =======================================================================
async function updateFaq(req: Request, { params }: Params) {
  

  const faqId = params.id;
  if (!faqId) {
    return formatResponse(false, null, "Missing FAQ ID.", 400);
  }

  const { question, answer } = await req.json();

  const updatedFaq = await prisma.fAQ.update({
    where: { id: faqId },
    data: {
      question,
      answer,
    },
  });

  
    try { await cacheDel(`admin:faqs:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { data: updatedFaq }, null, 200);
}

// =======================================================================
// DELETE /api/faqs/[id]
// Deletes a specific FAQ.
// =======================================================================
async function deleteFaq(req: Request, { params }: Params) {
  

  const faqId = params.id;
  if (!faqId) {
    return formatResponse(false, null, "Missing FAQ ID.", 400);
  }

  await prisma.fAQ.delete({
    where: { id: faqId },
  });

  
    try { await cacheDel(`admin:faqs:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { message: 'FAQ deleted successfully' }, null, 200);
}

// Export the wrapped handlers
export const GET = withApiHandler(getFaq);
export const PUT = withApiHandler(updateFaq);
export const DELETE = withApiHandler(deleteFaq);
