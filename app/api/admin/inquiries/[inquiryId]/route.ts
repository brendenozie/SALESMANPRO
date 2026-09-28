import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler, HandlerContext } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { InquiryStatus } from "@prisma/client";

async function resolveParamId(context: HandlerContext): Promise<string | null> {
  const params = await context.params;
  return params?.inquiryId || null;
}

// GET /api/admin/inquiries/[inquiryId]
async function handleGetInquiry(req: Request, context: HandlerContext) {
  const inquiryId = await resolveParamId(context);
  if (!inquiryId) {
    return formatResponse(false, null, "Inquiry ID is required", 400);
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    include: {
      company: true,
    },
  });

  if (!inquiry) {
    return formatResponse(false, null, "Inquiry not found", 404);
  }

  return formatResponse(true, inquiry, "Inquiry fetched successfully", 200);
}

// PATCH/PUT /api/admin/inquiries/[inquiryId]
async function handleUpdateInquiry(req: Request, context: HandlerContext) {
  const inquiryId = await resolveParamId(context);
  if (!inquiryId) {
    return formatResponse(false, null, "Inquiry ID is required", 400);
  }

  const body = await req.json();
  const { status, assignedToAgentId, assignedToAgentName, message, clientPhone, clientEmail, clientName } = body;

  const validStatuses: InquiryStatus[] = ["New", "Read", "Responded", "Archived"] as InquiryStatus[];
  if (status && !validStatuses.includes(status)) {
    return formatResponse(false, null, `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
  }

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (assignedToAgentId !== undefined) updateData.assignedToAgentId = assignedToAgentId;
  if (assignedToAgentName !== undefined) updateData.assignedToAgentName = assignedToAgentName;
  if (message !== undefined) updateData.message = message;
  if (clientPhone !== undefined) updateData.clientPhone = clientPhone;
  if (clientEmail !== undefined) updateData.clientEmail = clientEmail;
  if (clientName !== undefined) updateData.clientName = clientName;

  try {
    const updated = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: updateData,
    });

    try {
      await cacheDel(`tenant:${updated.companyId}:inquiries:*`);
      await cacheDel(`admin:inquiries:*`);
    } catch (e) {}

    return formatResponse(true, updated, "Inquiry updated successfully", 200);
  } catch (error: any) {
    if (error.code === "P2025") {
      return formatResponse(false, null, "Inquiry not found", 404);
    }
    throw error;
  }
}

// DELETE /api/admin/inquiries/[inquiryId]
async function handleDeleteInquiry(req: Request, context: HandlerContext) {
  const inquiryId = await resolveParamId(context);
  if (!inquiryId) {
    return formatResponse(false, null, "Inquiry ID is required", 400);
  }

  try {
    const deleted = await prisma.inquiry.delete({
      where: { id: inquiryId },
    });

    try {
      await cacheDel(`tenant:${deleted.companyId}:inquiries:*`);
      await cacheDel(`admin:inquiries:*`);
    } catch (e) {}

    return formatResponse(true, null, "Inquiry deleted successfully", 200);
  } catch (error: any) {
    if (error.code === "P2025") {
      return formatResponse(false, null, "Inquiry not found", 404);
    }
    throw error;
  }
}

export const GET = withApiHandler(handleGetInquiry);
export const PATCH = withApiHandler(handleUpdateInquiry);
export const PUT = withApiHandler(handleUpdateInquiry);
export const DELETE = withApiHandler(handleDeleteInquiry);
