import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const updateLeaveRequest = async (request: Request, context: any) => {
  const id = context?.params?.id || (context?.params && (await context.params)?.id);
  const body = await request.json();
  const { status, adminNote, type, reason, startDate, endDate } = body;

  const existing = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!existing) {
    return formatResponse(false, null, "Leave request not found", 404);
  }

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (adminNote !== undefined) updateData.adminNote = adminNote;
  if (type !== undefined) updateData.type = type;
  if (reason !== undefined) updateData.reason = reason;
  if (startDate !== undefined) updateData.startDate = new Date(startDate);
  if (endDate !== undefined) updateData.endDate = new Date(endDate);

  const updatedLeave = await prisma.leaveRequest.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { name: true, email: true } },
      backupStaff: { select: { user: { select: { name: true } } } }
    }
  });

  try {
    await cacheDel(`tenant:${existing.companyId}:leave:*`);
    await cacheDel(`admin:leave:*`);
  } catch (e) {}

  return formatResponse(true, updatedLeave, "Leave request updated", 200);
};

const deleteLeaveRequest = async (_request: Request, context: any) => {
  const id = context?.params?.id || (context?.params && (await context.params)?.id);

  const existing = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!existing) {
    return formatResponse(false, null, "Leave request not found", 404);
  }

  await prisma.leaveRequest.delete({
    where: { id },
  });

  try {
    await cacheDel(`tenant:${existing.companyId}:leave:*`);
    await cacheDel(`admin:leave:*`);
  } catch (e) {}

  return formatResponse(true, null, "Leave request deleted", 200);
};

export const PUT = withApiHandler(updateLeaveRequest, { requireAuth: true });
export const PATCH = withApiHandler(updateLeaveRequest, { requireAuth: true });
export const DELETE = withApiHandler(deleteLeaveRequest, { requireAuth: true });
