import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import { PrismaClient } from '@prisma/client';
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // New import
import { formatResponse } from "@/lib/formatResponse"; // New import
import { verifyAuth } from '@/lib/verifyAuth';

// Initialize Prisma Client (Note: In a typical setup, this should be a singleton import)
const prisma = new PrismaClient();

// =======================================================================
// GET /api/faqs
// Fetches all FAQs, filtered by companyId.
// =======================================================================
async function getFaqs(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  // Note: The original 'status' param was present but not used, so I'm omitting it here.

  if (!companyId) {
    return formatResponse(false, null, 'Company ID is required to fetch FAQs.', 400);
  }

  const cacheKey = `admin:faqs:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const faqs = await prisma.fAQ.findMany({
    where: { companyId },
    orderBy: {
      createdAt: 'asc'
    }
  });

  try {
    if (faqs) {
      await cacheSet(cacheKey, { faqs }, 60);
    }
  } catch (e) {}

  // The original response returned { faqs: [...] }, so we retain that structure for consistency.
  return formatResponse(true, { faqs }, null, 200);
}

// =======================================================================
// POST /api/faqs
// Creates a new FAQ item.
// =======================================================================
async function createFaq(request: Request) {
  
  const body = await request.json();
  const { question, answer, companyId } = body;

  if (!question || !answer || !companyId) {
    return formatResponse(false, null, 'Question, Answer, and Company ID are required.', 400);
  }

  const newFaq = await prisma.fAQ.create({
    data: {
      question,
      answer,
      companyId
    },
  });

  // The original response returned { newFaq: {...} }
  
    try { await cacheDel(`admin:faqs:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newFaq, null, 201);
}

// Export the refactored handlers wrapped in withApiHandler
export const GET = withApiHandler(getFaqs);
export const POST = withApiHandler(createFaq);
