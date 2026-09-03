import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/patients/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --- Helper to format patient data ---
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
    address: patient.address || null,
    contactInfo: patient.contactInfo || null,
  };
}

// --- GET /api/admin/patients/[id] ---
async function handleGetPatient(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  const cacheKey = buildTenantCacheKey(id, "patients", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const patient = await prisma.patient.findUnique({
    where: { id },
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
  });

  if (!patient) return formatResponse(false, null, "Patient not found", 404);

  const formatted = await formatPatientData(patient);

  try {
    if (patient) {
      await cacheSet(cacheKey, formatted, 60);
    }
  } catch (e) {}

  return formatResponse(true, formatted, "Patient fetched successfully", 200);
}

// --- PUT /api/admin/patients/[id] ---
async function handlePutPatient(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const { name, email, phone, dob, gender, profilePicture, address, contactInfo } = body;

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!patient) return formatResponse(false, null, "Patient not found", 404);

  try {
    // Update linked user
    await prisma.user.update({
      where: { id: patient.userId },
      data: {
        name,
        email,
        phone,
        profilePicture,
        dateOfBirth: dob ? new Date(dob) : null,
        gender: gender || null,
      },
    });

    // Update patient-specific info
    await prisma.patient.update({
      where: { id },
      data: {
        address: address || null,
        contactInfo: contactInfo || null,
      },
    });

    const updatedPatient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    const formatted = await formatPatientData(updatedPatient);
    
    try {
      await cacheDel(`tenant:${id}:patients:*`);
      await cacheDel(`admin:patients:*`);
    } catch (e) {}
    
    return formatResponse(true, formatted, "Patient updated successfully", 200);
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("email")) {
      return formatResponse(false, null, "Email already exists.", 409);
    }
    throw err;
  }
}

// --- DELETE /api/admin/patients/[id] ---
async function handleDeletePatient(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!patient) return formatResponse(false, null, "Patient not found", 404);

  // Delete patient record first, then user
  await prisma.patient.delete({ where: { id } });
  await prisma.user.delete({ where: { id: patient.userId } });

  
    try {
      await cacheDel(`tenant:${id}:patients:*`);
      await cacheDel(`admin:patients:*`);
    } catch (e) {}
    return formatResponse(true, { deletedId: id }, "Patient deleted successfully", 200);
}

// --- Export with handler wrapper ---
export const GET = withApiHandler(handleGetPatient);
export const PUT = withApiHandler(handlePutPatient);
export const DELETE = withApiHandler(handleDeletePatient);
