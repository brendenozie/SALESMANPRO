import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/staff/route.ts
import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { NextRequest } from "next/server";

// Helper function to format staff data for the frontend
async function formatStaffData(staffMember: any) {
  const userName = staffMember.user?.name || 'N/A';
  const userEmail = staffMember.user?.email || 'N/A';
  const userPhone = staffMember.user?.phone || 'N/A';
  const userProfilePicture =
    staffMember.user?.profilePicture ||
    `https://placehold.co/100x100/A7F3D0/0D9488?text=${
      userName ? userName.charAt(0) : '?'
    }${userName ? userName.charAt(1) : ''}`;

  return {
    id: staffMember.id,
    userId: staffMember.userId,
    name: userName,
    email: userEmail,
    phone: userPhone,
    profilePicture: userProfilePicture,
    jobTitle: staffMember.jobTitle || 'N/A',
    department: staffMember.department || 'N/A',
    employmentStatus: staffMember.employmentStatus,
    startDate: staffMember.startDate
      ? new Date(staffMember.startDate).toLocaleDateString()
      : 'N/A',
    createdAt: staffMember.createdAt
      ? new Date(staffMember.createdAt).toLocaleDateString()
      : 'N/A',
  };
}

// GET /api/admin/staff
async function getStaff(req: Request) {

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus");

  if (!companyId) return formatResponse(false, null, "Missing companyId", 400);

  try {
    const whereClause: any = { companyId };

    if (filterStatus && filterStatus !== "All") {
      whereClause.employmentStatus = filterStatus;
    }
    
    const cacheKey = `admin:stores:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  let staffMembers = await prisma.staffProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      staffMembers = staffMembers.filter(
        (member) =>
          member.user?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
          member.user?.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
          member.user?.phone?.toLowerCase().includes(lowerCaseSearchTerm) ||
          member.jobTitle?.toLowerCase().includes(lowerCaseSearchTerm) ||
          member.department?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    const enrichedStaff = await Promise.all(
      staffMembers.map((staffMember) => formatStaffData(staffMember))
    );

    try {
      await cacheSet(cacheKey, enrichedStaff, 60);
    } catch (e) {
      console.error("Error caching staff data:", e);
    }

    return formatResponse(true, enrichedStaff, "Staff fetched successfully");
  } catch (err: any) {
    console.error("GET /api/admin/staff error:", err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

// POST /api/admin/staff
async function createStaff(req: Request) {

  const body = await req.json();
  const { name, email, phone, profilePicture, jobTitle, department, employmentStatus, startDate, companyId } = body;

  if (!name || !email || !jobTitle || !department || !companyId) {
    return formatResponse(false, null, "Missing required fields: name, email, jobTitle, department, companyId", 400);
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { name, email, phone, profilePicture, role: "STAFF" },
      });
    } else if (user.role !== "STAFF" && user.role !== "ADMIN") {
      user = await prisma.user.update({ where: { id: user.id }, data: { role: "STAFF" } });
    }

    const existingProfile = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    if (existingProfile) return formatResponse(false, null, "Staff profile already exists for this user", 409);

    const newStaff = await prisma.staffProfile.create({
      data: {
        userId: user.id,
        companyId,
        jobTitle,
        department,
        employmentStatus,
        startDate: startDate ? new Date(startDate) : undefined,
      },
      include: { user: { select: { name: true, email: true, phone: true, profilePicture: true } } },
    });

    const formattedNewStaff = await formatStaffData(newStaff);
    
    try { await cacheDel(`admin:stores:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, formattedNewStaff, "Staff created successfully", 201);
  } catch (err: any) {
    console.error("POST /api/admin/staff error:", err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(getStaff);
export const POST = withApiHandler(createStaff);
