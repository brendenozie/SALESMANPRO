import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/patients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper function to format patient data
async function formatPatientData(patient: any) {
  const user = patient.user;
  let lastVisitDate: string | null = null;

  if (user?.id) {
    const latestAppointment = await prisma.appointment.findFirst({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    if (latestAppointment?.date) {
      lastVisitDate = new Date(latestAppointment.date).toLocaleDateString();
    }
  }

  return {
    id: patient.id,
    userId: user?.id || null,
    name: user?.name || "N/A",
    email: user?.email || "N/A",
    phone: user?.phone || "",
    profilePicture:
      user?.profilePicture ||
      `https://placehold.co/100x100/A7F3D0/0D9488?text=${
        user?.name ? user.name.charAt(0) : "?"
      }${user?.name ? user.name.charAt(1) : ""}`,
    dob: user?.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "N/A",
    gender: user?.gender || "Other",
    lastVisit: lastVisitDate || "N/A",
    createdAt: patient.createdAt
      ? new Date(patient.createdAt).toLocaleDateString()
      : "N/A",
  };
}

// GET /api/admin/patients
export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }
  
  const cacheKey = buildTenantCacheKey(companyId, "patients", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  let patients = await prisma.patient.findMany({
    where: { user: { companyId } }, // filter by company via user
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePicture: true,
          dateOfBirth: true,
          gender: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Apply search filtering if searchTerm is provided
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    patients = patients.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(lower) ||
        p.user?.email?.toLowerCase().includes(lower) ||
        p.user?.phone?.toLowerCase().includes(lower) ||
        p.user?.dateOfBirth?.toISOString().toLowerCase().includes(lower)
    );
  }

  const enriched = await Promise.all(patients.map(formatPatientData));

    try {
      await cacheSet(cacheKey, enriched, 60);
    } catch (e) {}
    
  return formatResponse(true, enriched, null, 200);
});

// POST /api/admin/patients
export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();
  const { name, email, phone, dob, gender, profilePicture, companyId, address, contactInfo } = body;

  if (!companyId || !email || !name) {
    return formatResponse(false, null, "companyId, name, and email are required", 400);
  }

  try {
    // Create user record
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        profilePicture,
        role: "PATIENT", // ensure role aligns with your ROLE enum
        dateOfBirth: dob ? new Date(dob) : null,
        gender: gender || null,
        companyId,
      },
    });

    // Create patient record linked to user
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        address: address || null,
        contactInfo: contactInfo || null,
      },
      include: { user: true },
    });

    const newPatient = await formatPatientData(patient);
    
    try {
      await cacheDel(`tenant:${companyId}:patients:*`);
      await cacheDel(`admin:patients:*`);
    } catch (e) {}
    return formatResponse(true, newPatient, null, 201);
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("email")) {
      return formatResponse(false, null, "Email already exists", 409);
    }
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
});
