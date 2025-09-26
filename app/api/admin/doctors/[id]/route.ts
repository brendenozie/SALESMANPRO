import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper function to format doctor data for the frontend
async function formatDoctorData(doctor: any) {
  const userName = doctor.User?.name || 'N/A';
  const userEmail = doctor.User?.email || 'N/A';
  const userPhone = doctor.User?.phone || 'N/A';
  const userProfilePicture = doctor.User?.profilePicture || 'https://placehold.co/100x100/A7F3D0/0D9488?text=DR'; // Default image

  return {
    id: doctor.id, // Doctor model's ID
    userId: doctor.userId, // Corresponding User ID
    name: userName,
    email: userEmail,
    phone: userPhone,
    profilePicture: userProfilePicture,
    specialty: doctor.specialty || 'N/A',
    status: doctor.status,
    createdAt: doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'N/A',
  };
}

// =======================================================================
// GET: Fetch a single doctor by ID
// =======================================================================
async function getDoctor(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      User: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } },
    },
  });

  if (!doctor) {
    return formatResponse(false, null, "Doctor not found", 404);
  }

  const formattedDoctor = await formatDoctorData(doctor);
  return formatResponse(true, { data: formattedDoctor }, null, 200);
}

// =======================================================================
// PUT: Update an existing doctor by ID
// =======================================================================
async function updateDoctor(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const body = await request.json();
  const { name, email, phone, profilePicture, specialty, status } = body;

  const existingDoctor = await prisma.doctor.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existingDoctor) {
    return formatResponse(false, null, "Doctor not found", 404);
  }

  if (existingDoctor.userId) {
    await prisma.user.update({
      where: { id: existingDoctor.userId },
      data: {
        name: name,
        email: email,
        phone: phone,
        profilePicture: profilePicture,
      },
    });
  }

  const updatedDoctor = await prisma.doctor.update({
    where: { id },
    data: {
      specialty: specialty,
      status: status,
    },
    include: {
      User: { select: { name: true, email: true, phone: true, profilePicture: true } },
    },
  });

  const formattedUpdatedDoctor = await formatDoctorData(updatedDoctor);
  return formatResponse(true, { data: formattedUpdatedDoctor }, null, 200);
}

// =======================================================================
// DELETE: Delete a doctor by ID
// =======================================================================
async function deleteDoctor(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  const existingDoctor = await prisma.doctor.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existingDoctor) {
    return formatResponse(false, null, "Doctor not found", 404);
  }

  await prisma.doctor.delete({
    where: { id },
  });

  return formatResponse(true, { message: "Doctor deleted successfully" }, null, 200);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDoctor);
export const PUT = withApiHandler(updateDoctor);
export const DELETE = withApiHandler(deleteDoctor);
