import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// =======================================================================
// Helper: Format doctor data for frontend
// =======================================================================
async function formatDoctorData(doctor: any) {
  return {
    id: doctor.id,
    userId: doctor.userId,
    name: doctor.User?.name || "N/A",
    email: doctor.User?.email || "N/A",
    phone: doctor.User?.phone || "N/A",
    profilePicture:
      doctor.User?.profilePicture ||
      "https://placehold.co/100x100/A7F3D0/0D9488?text=DR",
    specialty: doctor.specialty || "N/A",
    status: doctor.status,
    createdAt: doctor.createdAt
      ? new Date(doctor.createdAt).toLocaleDateString()
      : "N/A",
    loginCode: doctor.loginCode,
    staffProfile: doctor.StaffProfile
      ? {
          jobTitle: doctor.StaffProfile.jobTitle,
          department: doctor.StaffProfile.department,
          employmentStatus: doctor.StaffProfile.employmentStatus,
        }
      : null,
  };
}

// =======================================================================
// GET: Fetch all doctors (with filters + search)
// =======================================================================
async function getDoctors(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus");

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  const whereClause: any = { companyId };
  if (filterStatus && filterStatus !== "All") {
    whereClause.status = filterStatus;
  }

  const cacheKey = `admin:doctors:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  let doctors = await prisma.doctor.findMany({
    where: whereClause,
    include: {
      User: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } },
      StaffProfile: true,
    },
    orderBy: { createdAt: "asc" },
  });


  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    doctors = doctors.filter(
      (d) =>
        d.User?.name?.toLowerCase().includes(lower) ||
        d.User?.email?.toLowerCase().includes(lower) ||
        d.User?.phone?.toLowerCase().includes(lower) ||
        d.specialty?.toLowerCase().includes(lower)
    );
  }

  const enriched = await Promise.all(doctors.map(formatDoctorData));

  try {
    if (enriched) {
      await cacheSet(cacheKey, { data: enriched }, 60);
    }
  } catch (e) {}

  return formatResponse(true, { data: enriched }, null, 200);
}

// =======================================================================
// POST: Create new doctor (with shared loginCode + StaffProfile)
// =======================================================================
async function createDoctor(request: Request) {
  const body = await request.json();
  const { name, email, phone, profilePicture, specialty, status, companyId } = body;

  if (!name || !email || !companyId) {
    return formatResponse(false, null, "Missing required fields: name, email, companyId", 400);
  }

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        profilePicture,
        role: "DOCTOR", // ✅ set proper role
        staffProfile: {
          create: {
            companyId, jobTitle: "Doctor", department: "Medical", employmentStatus: "ACTIVE",
          },
        },
      },
    });
  } else {
    if (user.role !== "DOCTOR" && user.role !== "ADMIN") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "DOCTOR" },
      });
    }
  }

  // Prevent duplicate doctor
  const existingDoctor = await prisma.doctor.findFirst({ where: { userId: user.id } });
  if (existingDoctor) {
    return formatResponse(false, null, "Doctor profile already exists for this user", 409);
  }

  // Generate unique loginCode
  let loginCode: string;
  let unique = false;
  do {
    loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    const existingDoctor = await prisma.doctor.findUnique({ where: { loginCode } });
    const existingStaff = await prisma.staffProfile.findUnique({ where: { loginCode } });
    if (!existingDoctor && !existingStaff) unique = true;
  } while (!unique);

  // Create doctor
  const newDoctor = await prisma.doctor.create({
    data: {
      userId: user.id,
      companyId,
      specialty,
      status,
      phone,
      profilePicture,
      loginCode,
    },
    include: { User: true, StaffProfile: true },
  });

  // Create staff profile (linked)
  await prisma.staffProfile.create({
    data: {
      userId: user.id,
      companyId,
      jobTitle: "Doctor",
      department: "Medical",
      employmentStatus: "ACTIVE",
      loginCode,
      doctorId: newDoctor.id,
    },
  });

  const formatted = await formatDoctorData(newDoctor);
  
    try { await cacheDel(`admin:doctors:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { data: formatted }, null, 201);
}

// =======================================================================
// Exports
// =======================================================================
export const GET = withApiHandler(getDoctors);
export const POST = withApiHandler(createDoctor);
