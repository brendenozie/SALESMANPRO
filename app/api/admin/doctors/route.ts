import { NextResponse, NextRequest } from "next/server";
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
// GET: Fetch all doctors
// =======================================================================
async function getDoctors(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus");

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  const whereClause: any = {
    companyId: companyId,
  };

  if (filterStatus && filterStatus !== 'All') {
    whereClause.status = filterStatus;
  }

  let doctors = await prisma.doctor.findMany({
    where: whereClause,
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
    orderBy: { createdAt: 'asc' },
  });

  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    doctors = doctors.filter(doctor =>
      doctor.User?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      doctor.User?.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
      doctor.User?.phone?.toLowerCase().includes(lowerCaseSearchTerm) ||
      doctor.specialty?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }

  const enrichedDoctors = await Promise.all(
    doctors.map(async (doctor) => formatDoctorData(doctor))
  );

  return formatResponse(true, { data: enrichedDoctors }, null, 200);
}

// =======================================================================
// POST: Create a new doctor
// =======================================================================
async function createDoctor(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await request.json();
  const { name, email, phone, profilePicture, specialty, status, companyId } = body;

  if (!name || !email || !companyId) {
    return formatResponse(false, null, "Missing required fields: name, email, companyId", 400);
  }

  let user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        phone: phone,
        profilePicture: profilePicture,
        role: 'EDUCATOR',
      },
    });
  } else {
    if (user.role !== 'EDUCATOR' && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'EDUCATOR' },
      });
    }
  }

  let doctor = await prisma.doctor.findFirst({
    where: { userId: user.id },
  });

  if (doctor) {
    return formatResponse(false, null, "Doctor profile already exists for this user", 409);
  }

  let loginCode: string;
  let isUnique = false;
  do {
    loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    const existingAgentWithCode = await prisma.doctor.findUnique({
      where: { loginCode },
    });
    if (!existingAgentWithCode) {
      isUnique = true;
    }
  } while (!isUnique);

  const newDoctor = await prisma.doctor.create({
    data: {
      userId: user.id,
      companyId: companyId,
      specialty: specialty,
      status: status,
      phone: phone,
      profilePicture: profilePicture,
      loginCode: loginCode,
    },
    include: {
      User: { select: { name: true, email: true, phone: true, profilePicture: true } },
    },
  });

  const formattedNewDoctor = await formatDoctorData(newDoctor);

  return formatResponse(true, { data: formattedNewDoctor }, null, 201);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDoctors);
export const POST = withApiHandler(createDoctor);
