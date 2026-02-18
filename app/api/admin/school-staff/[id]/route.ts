import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/[adminSlug]/staff/[id]/route.ts
import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Helper to format staff data
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

// GET staff by ID
async function getStaff(req: Request, { params }: { params: { id: string } }) {
  
  const { id } = params;
  try {
    
    const cacheKey = `admin:school-staff:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const staffMember = await prisma.staffProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } } },
    });

  try {
    if (staffMember) {
      await cacheSet(cacheKey, staffMember, 60);
    }
  } catch (e) {}

    if (!staffMember) return formatResponse(false, null, "Staff member not found", 404);

    const formattedStaff = await formatStaffData(staffMember);
    return formatResponse(true, formattedStaff, "Staff fetched successfully", 200);
  } catch (err: any) {
    console.error(`GET staff/${id} error:`, err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

// PUT staff by ID
async function updateStaff(req: Request, { params }: { params: { id: string } }) {
 
  const { id } = params;
  const body = await req.json();
  const { name, email, phone, profilePicture, jobTitle, department, employmentStatus, startDate } = body;

  try {
    const existingStaff = await prisma.staffProfile.findUnique({ where: { id }, select: { userId: true } });
    if (!existingStaff) return formatResponse(false, null, "Staff member not found", 404);

    // Update associated user
    if (existingStaff.userId) {
      await prisma.user.update({
        where: { id: existingStaff.userId },
        data: { name, email, phone, profilePicture },
      });
    }

    // Update staff profile
    const updatedStaff = await prisma.staffProfile.update({
      where: { id },
      data: { jobTitle, department, employmentStatus, startDate: startDate ? new Date(startDate) : undefined },
      include: { user: { select: { name: true, email: true, phone: true, profilePicture: true } } },
    });

    const formattedUpdatedStaff = await formatStaffData(updatedStaff);
    
    try { await cacheDel(`admin:school-staff:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, formattedUpdatedStaff, "Staff updated successfully", 200);
  } catch (err: any) {
    console.error(`PUT staff/${id} error:`, err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

// DELETE staff by ID
async function deleteStaff(req: Request, { params }: { params: { id: string } }) {
  
  const { id } = params;
  try {
    const existingStaff = await prisma.staffProfile.findUnique({ where: { id }, select: { userId: true } });
    if (!existingStaff) return formatResponse(false, null, "Staff member not found", 404);

    await prisma.staffProfile.delete({ where: { id } });
    
    try { await cacheDel(`admin:school-staff:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Staff member deleted successfully", 200);
  } catch (err: any) {
    console.error(`DELETE staff/${id} error:`, err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(getStaff);
export const PUT = withApiHandler(updateStaff);
export const DELETE = withApiHandler(deleteStaff);
