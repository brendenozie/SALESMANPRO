import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/staff/route.ts
import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { enforceStaffLimit } from "@/lib/subscriptions/enforce-limits";

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

// GET all staff
async function getAllStaff(req: Request) {
 
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus");

  if (!companyId) return formatResponse(false, null, "Missing companyId", 400);

  try {
    const whereClause: any = { companyId };
    if (filterStatus && filterStatus !== "All") whereClause.employmentStatus = filterStatus;

    const cacheKey = buildTenantCacheKey(companyId, "staff", {});

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

  let staffMembers = await prisma.staffProfile.findMany({
      where: whereClause,
      include: { user: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } } },
      orderBy: { createdAt: "asc" },
    });

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      staffMembers = staffMembers.filter(
        (m) =>
          m.user?.name?.toLowerCase().includes(lowerSearch) ||
          m.user?.email?.toLowerCase().includes(lowerSearch) ||
          m.user?.phone?.toLowerCase().includes(lowerSearch) ||
          m.jobTitle?.toLowerCase().includes(lowerSearch) ||
          m.department?.toLowerCase().includes(lowerSearch)
      );
    }

    const enrichedStaff = await Promise.all(staffMembers.map((m) => formatStaffData(m)));

    try {
      if (enrichedStaff) {
        await cacheSet(cacheKey, enrichedStaff, 60);
      }
    } catch (e) {}

    return formatResponse(true, enrichedStaff, "Staff fetched successfully", 200);

  } catch (err: any) {
    console.error("GET /api/admin/staff error:", err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

// POST create new staff
async function createStaff(req: Request) {
  
  const body = await req.json();
  const { name, email, phone, profilePicture, jobTitle, department, employmentStatus, startDate, companyId } = body;

  if (!name || !email || !jobTitle || !department || !companyId) {
    return formatResponse(false, null, "Missing required fields: name, email, jobTitle, department, companyId", 400);
  }

  // --- Subscription Plan Enforcement: Staff User Limit ---
  const staffCheck = await enforceStaffLimit(companyId);
  if (!staffCheck.allowed) {
    return formatResponse(false, { upgradeRequired: staffCheck.upgradeRequired, currentCount: staffCheck.currentCount, limit: staffCheck.limit }, staffCheck.message, 403);
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({ data: { 
        name, email, phone, profilePicture, role: "STAFF"
       } });
    } else if (user.role !== "STAFF" && user.role !== "ADMIN") {
      user = await prisma.user.update({ where: { id: user.id }, data: { role: "STAFF" } });
    }

    const staffProfile = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    if (staffProfile) return formatResponse(false, null, "Staff profile already exists for this user", 409);

    const newStaff = await prisma.staffProfile.create({
      data: { userId: user.id, companyId, jobTitle, department, employmentStatus, startDate: startDate ? new Date(startDate) : undefined },
      include: { user: { select: { name: true, email: true, phone: true, profilePicture: true } } },
    });

    const formattedStaff = await formatStaffData(newStaff);
    
    try {
      await cacheDel(`tenant:${companyId}:staff:*`);
      await cacheDel(`admin:staff:*`);
    } catch (e) {}
    return formatResponse(true, formattedStaff, "Staff created successfully", 201);
  } catch (err: any) {
    console.error("POST /api/admin/staff error:", err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(getAllStaff);
export const POST = withApiHandler(createStaff);
