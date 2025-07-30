// app/api/admin/doctors/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Assuming this path correctly points to your Prisma client initialization

// Helper function to format doctor data for the frontend
async function formatDoctorData(doctor: any) {
  const userName = doctor.user?.name || 'N/A';
  const userEmail = doctor.user?.email || 'N/A';
  const userPhone = doctor.user?.phone || 'N/A';
  const userProfilePicture = doctor.user?.profilePicture || 'https://placehold.co/100x100/A7F3D0/0D9488?text=DR'; // Default image

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus"); // 'ACTIVE', 'ON_LEAVE', 'INACTIVE', 'All'

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
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

    // Client-side filtering for search term across doctor name, email, phone, and specialty
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

    return NextResponse.json(enrichedDoctors);
  } catch (err: any) {
    console.error("GET /api/admin/doctors error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, profilePicture, specialty, status, companyId } = body;

  if (!name || !email || !companyId) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, companyId" },
      { status: 400 }
    );
  }

  try {
    // First, check if a User with this email already exists
    let user = await prisma.user.findUnique({
      where: { email: email },
    });

    // If user does not exist, create a new User record
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name,
          email: email,
          phone: phone,
          profilePicture: profilePicture,
          role: 'EDUCATOR', // Assuming doctors are typically EDUCATORs in your schema
        },
      });
    } else {
      // If user exists, update their role to EDUCATOR if it's not already
      // This prevents creating duplicate users if a user already exists but isn't a doctor
      if (user.role !== 'EDUCATOR' && user.role !== 'ADMIN') { // Allow ADMIN to also be a doctor
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'EDUCATOR' },
        });
      }
    }

    // Check if a Doctor profile already exists for this user
    let doctor = await prisma.doctor.findFirst({
      where: { userId: user.id },
    });

    if (doctor) {
      return NextResponse.json({ error: "Doctor profile already exists for this user" }, { status: 409 });
    }

    let loginCode: string;
    
    let isUnique = false;
    do {
      // Generate a random 6-digit code
      loginCode = Math.floor(100000 + Math.random() * 900000).toString();
      // Check if the code already exists
      const existingAgentWithCode = await prisma.doctor.findUnique({
        where: { loginCode },
      });
      if (!existingAgentWithCode) {
        isUnique = true;
      }
    } while (!isUnique);

    // Create the Doctor profile linked to the User
    const newDoctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        companyId: companyId,
        specialty: specialty,
        status: status,
        phone: phone, // Can be duplicated from user, or kept here for doctor-specific contact
        profilePicture: profilePicture, // Can be duplicated from user
        loginCode: loginCode, // Provide a default or generated loginCode as required by your schema
      },
      include: {
        User: { select: { name: true, email: true, phone: true, profilePicture: true } },
      },
    });

    const formattedNewDoctor = await formatDoctorData(newDoctor);

    return NextResponse.json(formattedNewDoctor, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/doctors error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
