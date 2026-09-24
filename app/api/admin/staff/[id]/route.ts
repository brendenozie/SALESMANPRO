import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function formatStaffData(staffMember: any) {
  const userName = staffMember.user?.name || "N/A";
  const userEmail = staffMember.user?.email || "N/A";
  const userPhone = staffMember.user?.phone || "N/A";
  const userProfilePicture =
    staffMember.user?.profilePicture ||
    `https://placehold.co/100x100/A7F3D0/0D9488?text=${userName ? userName.charAt(0) : "?"}${userName ? userName.charAt(1) : ""}`;

  return {
    id: staffMember.id,
    userId: staffMember.userId,
    name: userName,
    email: userEmail,
    phone: userPhone,
    profilePicture: userProfilePicture,
    jobTitle: staffMember.jobTitle || "N/A",
    department: staffMember.department || "N/A",
    employmentStatus: staffMember.employmentStatus,
    startDate: staffMember.startDate ? new Date(staffMember.startDate).toLocaleDateString() : "N/A",
    createdAt: staffMember.createdAt ? new Date(staffMember.createdAt).toLocaleDateString() : "N/A",
  };
}

async function getStaff(req: Request, context: any) {
  const id = context?.params?.id || (context?.params && (await context.params)?.id);
  if (!id) return formatResponse(false, null, "Staff ID required", 400);

  try {
    const cacheKey = buildTenantCacheKey(id, "staff", {});

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const staffMember = await prisma.staffProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } } },
    });

    if (!staffMember) return formatResponse(false, null, "Staff member not found", 404);

    const formattedStaff = await formatStaffData(staffMember);

    try {
      await cacheSet(cacheKey, formattedStaff, 60);
    } catch (e) {}

    return formatResponse(true, formattedStaff, "Staff fetched successfully", 200);
  } catch (err: any) {
    console.error(`GET staff/${id} error:`, err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

async function updateStaff(req: Request, context: any) {
  const id = context?.params?.id || (context?.params && (await context.params)?.id);
  if (!id) return formatResponse(false, null, "Staff ID required", 400);

  const body = await req.json();
  const { name, email, phone, profilePicture, jobTitle, department, employmentStatus, startDate, salary } = body;

  try {
    const existingStaff = await prisma.staffProfile.findUnique({ where: { id }, select: { userId: true, companyId: true } });
    if (!existingStaff) return formatResponse(false, null, "Staff member not found", 404);

    if (existingStaff.userId) {
      await prisma.user.update({
        where: { id: existingStaff.userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(profilePicture && { profilePicture })
        },
      });
    }

    const updatedStaff = await prisma.staffProfile.update({
      where: { id },
      data: {
        ...(jobTitle && { jobTitle }),
        ...(department && { department }),
        ...(employmentStatus && { employmentStatus }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(salary !== undefined && { salary: parseFloat(salary) })
      },
      include: { user: { select: { name: true, email: true, phone: true, profilePicture: true } } },
    });

    const formattedUpdatedStaff = await formatStaffData(updatedStaff);
    
    try {
      await cacheDel(`tenant:${existingStaff.companyId}:staff:*`);
      await cacheDel(`admin:staff:*`);
    } catch (e) {}
    return formatResponse(true, formattedUpdatedStaff, "Staff updated successfully", 200);
  } catch (err: any) {
    console.error(`PUT staff/${id} error:`, err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

async function deleteStaff(req: Request, context: any) {
  const id = context?.params?.id || (context?.params && (await context.params)?.id);
  if (!id) return formatResponse(false, null, "Staff ID required", 400);

  try {
    const existingStaff = await prisma.staffProfile.findUnique({ where: { id }, select: { userId: true, companyId: true } });
    if (!existingStaff) return formatResponse(false, null, "Staff member not found", 404);

    await prisma.staffPerformanceReview.deleteMany({ where: { staffId: id } });
    await prisma.staffLeave.deleteMany({ where: { staffId: id } });
    await prisma.staffAttendanceRecord.deleteMany({ where: { staffId: id } });
    await prisma.staffPayroll.deleteMany({ where: { staffId: id } });

    await prisma.staffProfile.delete({ where: { id } });
    
    try {
      await cacheDel(`tenant:${existingStaff.companyId}:staff:*`);
      await cacheDel(`admin:staff:*`);
    } catch (e) {}
    
    return formatResponse(true, null, "Staff member deleted successfully", 200);
  } catch (err: any) {
    console.error(`DELETE staff/${id} error:`, err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

export const GET = withApiHandler(getStaff);
export const PUT = withApiHandler(updateStaff);
export const DELETE = withApiHandler(deleteStaff);
