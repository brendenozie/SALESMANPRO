// app/api/doctor/profile/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Helper function to format doctor data
async function formatDoctorProfile(doctor: any) {
  const user = doctor.User;
  return {
    id: doctor.id,
    userId: doctor.userId,
    name: user?.name || "N/A",
    email: user?.email || "N/A",
    phone: user?.phone || "N/A",
    profilePicture:
      user?.profilePicture ||
      "https://placehold.co/100x100/A7F3D0/0D9488?text=DR",
    specialty: doctor.specialty || "N/A",
    status: doctor.status,
    companyId: doctor.companyId,
    createdAt: doctor.createdAt
      ? new Date(doctor.createdAt).toLocaleDateString()
      : "N/A",
    updatedAt: doctor.updatedAt
      ? new Date(doctor.updatedAt).toLocaleDateString()
      : "N/A",
  };
}

// ================= GET =================
async function getDoctorProfile(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");

  if (!doctorId) {
    return formatResponse(false, null, "Missing doctorId", 400);
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!doctor) {
      return formatResponse(false, null, "Doctor not found", 404);
    }

    const formattedProfile = await formatDoctorProfile(doctor);
    return formatResponse(true, formattedProfile, "Doctor profile fetched");
  } catch (err: any) {
    console.error("GET /api/doctor/profile error:", err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

// ================= PUT =================
async function updateDoctorProfile(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const body = await request.json();
  const { name, email, phone, profilePicture, specialty, status } = body;

  if (!doctorId) {
    return formatResponse(false, null, "Missing doctorId", 400);
  }

  try {
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { User: true },
    });

    if (!existingDoctor) {
      return formatResponse(false, null, "Doctor not found", 404);
    }

    if (!existingDoctor.userId) {
      return formatResponse(false, null, "Doctor has no associated user", 400);
    }

    // Ensure the User relation was loaded and is not null
    if (!existingDoctor.User) {
      return formatResponse(false, null, "Associated user not found", 400);
    }

    // Update User fields
    await prisma.user.update({
      where: { id: existingDoctor.userId },
      data: {
        name: name || existingDoctor.User.name,
        email: email || existingDoctor.User.email,
        phone: phone || existingDoctor.User.phone,
        profilePicture:
          profilePicture || existingDoctor.User.profilePicture,
      },
    });
    // Update Doctor fields
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialty: specialty || existingDoctor.specialty,
        status: status || existingDoctor.status,
      },
      include: {
        User: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } },
      },
    });
    const formattedProfile = await formatDoctorProfile(updatedDoctor);
    return formatResponse(true, formattedProfile, "Doctor profile updated");
  } catch (err: any) {
    console.error("PUT /api/doctor/profile error:", err);
    return formatResponse(false, null, err.message || "Internal server error", 500);
  }
}

export const GET = withApiHandler(getDoctorProfile);
export const PUT = withApiHandler(updateDoctorProfile);
