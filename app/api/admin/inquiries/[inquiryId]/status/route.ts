import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { InquiryStatus } from "@prisma/client"; // Assuming you have InquiryStatus enum

// Define the expected structure for route parameters
type PatchParams = { params: { inquiryId: string } };


async function handlePatchInquiryStatus(request: Request, { params }: PatchParams) {
  const { inquiryId } = params;
  const body = await request.json();
  const { status } = body;

  if (!status) {
    return formatResponse(false, null, 'Status is required in the request body.', 400);
  }

  // NOTE: Using the Prisma enum type for validation (safer than hardcoded array)
  // Assuming InquiryStatus is imported and available from @prisma/client
  const validStatuses: InquiryStatus[] = ['New', 'Read', 'Responded', 'Archived'] as InquiryStatus[];

  if (!validStatuses.includes(status)) {
    return formatResponse(false, null, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  try {
    const updatedInquiry = await prisma.inquiry.update({
      where: {
        id: inquiryId,
      },
      data: {
        status: status,
      },
    });

    // withApiHandler will wrap this result in formatResponse(true, ...) with status 200
    
    try { await cacheDel(`admin:status:${updatedInquiry.companyId || 'global'}:*`); } catch (e) {}

    return formatResponse(true, updatedInquiry, 'Inquiry status updated successfully.', 200);
    
  } catch (error: any) {
    // Handle Prisma error for record not found
    if (error.code === 'P2025') {
      return formatResponse(false, null, 'Inquiry not found.', 404);
    }
    // Re-throw generic errors to be caught by withApiHandler's centralized catch block
    throw error;
  }
}

// Wrap the core logic with the API handler middleware
export const PATCH = withApiHandler(handlePatchInquiryStatus);
