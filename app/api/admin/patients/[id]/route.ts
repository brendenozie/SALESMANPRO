// app/api/admin/clients/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --- Helper to format patient data ---
async function formatPatientData(consumer: any) {
  const user = consumer.user;
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
    id: consumer.id,
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
    createdAt: consumer.createdAt
      ? new Date(consumer.createdAt).toLocaleDateString()
      : "N/A",
  };
}

// --- GET /api/admin/clients/[id] ---
async function handleGetClient(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const consumer = await prisma.consumer.findUnique({
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

  if (!consumer) return formatResponse(false, null, "Patient not found", 404);

  const patient = await formatPatientData(consumer);
  return formatResponse(true, patient, "Patient fetched successfully", 200);
}

// --- PUT /api/admin/clients/[id] ---
async function handlePutClient(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const body = await request.json();
  const { name, email, phone, dob, gender, profilePicture } = body;

  const consumer = await prisma.consumer.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!consumer) return formatResponse(false, null, "Patient not found", 404);

  try {
    await prisma.user.update({
      where: { id: consumer.userId },
      data: {
        name,
        email,
        phone,
        profilePicture,
        dateOfBirth: dob ? new Date(dob) : null,
        gender: gender || null,
      },
    });

    const updatedConsumer = await prisma.consumer.findUnique({
      where: { id },
      include: { user: true },
    });

    const updatedPatient = await formatPatientData(updatedConsumer);
    return formatResponse(true, updatedPatient, "Patient updated successfully", 200);
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("email")) {
      return formatResponse(false, null, "Email already exists.", 409);
    }
    throw err;
  }
}

// --- DELETE /api/admin/clients/[id] ---
async function handleDeleteClient(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const consumer = await prisma.consumer.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!consumer) return formatResponse(false, null, "Patient not found", 404);

  await prisma.consumer.delete({ where: { id } });
  await prisma.user.delete({ where: { id: consumer.userId } });

  return formatResponse(true, { deletedId: id }, "Patient deleted successfully", 200);
}

// --- Export with handler wrapper ---
export const GET = withApiHandler(handleGetClient);
export const PUT = withApiHandler(handlePutClient);
export const DELETE = withApiHandler(handleDeleteClient);
