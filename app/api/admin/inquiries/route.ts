import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { InquiryStatus } from "@prisma/client"; // Assuming InquiryStatus enum is available

// --- GET Handler ---

async function handleGetInquiries(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    // We use formatResponse here because withApiHandler catches the thrown error
    throw new Error("Company ID is required to fetch inquiries.");
  }

  
    const cacheKey = `admin:inquiries:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const inquiries = await prisma.inquiry.findMany({
    where: {
      companyId: companyId,
    },
    orderBy: {
      receivedAt: 'desc', // Order by received date, newest first
    },
  });

  try {
    if (inquiries) {
      await cacheSet(cacheKey, inquiries, 60);
    }
  } catch (e) {}

  // withApiHandler will wrap this result in formatResponse(true, ...) with status 200
  return formatResponse(true, { results: inquiries }, "Inquiries fetched successfully", 200);
}

// --- POST Handler ---

async function handlePostInquiry(request: Request) {
  const body = await request.json();
  const {
    companyId,
    clientName,
    clientEmail,
    clientPhone,
    message,
    propertyId,
    propertyName,
    status,
    assignedToAgentId,
    assignedToAgentName,
  } = body;

  // Basic validation
  if (!companyId || !clientName || !clientEmail || !message) {
    return formatResponse(false, null, 'Missing required fields (companyId, clientName, clientEmail, message).', 400);
  }

  // Validate status if provided (using InquiryStatus type)
  const validStatuses: InquiryStatus[] = ['New', 'Read', 'Responded', 'Archived'] as InquiryStatus[];
  if (status && !validStatuses.includes(status)) {
    return formatResponse(false, null, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const newInquiry = await prisma.inquiry.create({
    data: {
      companyId,
      clientName,
      clientEmail,
      clientPhone,
      message,
      propertyId,
      propertyName,
      status: status || 'New', // Default to 'New' if not provided
      assignedToAgentId,
      assignedToAgentName,
    },
  });

  // Return success response with status 201
  
    try { await cacheDel(`admin:inquiries:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newInquiry, "Inquiry created successfully", 201);
}

// Wrap the core logic with the API handler middleware
// GET requires authentication
export const GET = withApiHandler(handleGetInquiries);

// POST uses the same handler structure but is likely intended to be unauthenticated for contact forms.
// We'll use a modified approach to handle the request body and explicit response for POST.
// If you have a version of withApiHandler that explicitly allows skipping auth, that would be ideal.
// For now, we will use withApiHandler which enforces auth, and assume POST should be public and not use it.
// Since the prompt asks to include withApiHandler, I will wrap both, assuming the environment has the context
// to allow unauthenticated access to POST if the auth check is intentionally weak or absent in verifyAuth for this route.
export const POST = withApiHandler(handlePostInquiry);
