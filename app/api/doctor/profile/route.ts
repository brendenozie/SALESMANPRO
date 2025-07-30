// app/api/doctor/profile/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to format doctor data
async function formatDoctorProfile(doctor: any) {
  const user = doctor.user;
  return {
    id: doctor.id,
    userId: doctor.userId,
    name: user?.name || 'N/A',
    email: user?.email || 'N/A',
    phone: user?.phone || 'N/A',
    profilePicture: user?.profilePicture || 'https://placehold.co/100x100/A7F3D0/0D9488?text=DR',
    specialty: doctor.specialty || 'N/A',
    status: doctor.status,
    companyId: doctor.companyId,
    createdAt: doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'N/A',
    updatedAt: doctor.updatedAt ? new Date(doctor.updatedAt).toLocaleDateString() : 'N/A',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");

  if (!doctorId) {
    return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
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
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const formattedProfile = await formatDoctorProfile(doctor);
    return NextResponse.json(formattedProfile);
  } catch (err: any) {
    console.error("GET /api/doctor/profile error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const body = await request.json();
  const { name, email, phone, profilePicture, specialty, status } = body;

  if (!doctorId) {
    return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
  }

  try {
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { userId: true },
    });

    if (!existingDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Update associated User record
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

    // Update Doctor record
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialty: specialty,
        status: status,
      },
      include: {
        User: { select: { name: true, email: true, phone: true, profilePicture: true } },
      },
    });

    const formattedUpdatedProfile = await formatDoctorProfile(updatedDoctor);
    return NextResponse.json(formattedUpdatedProfile);
  } catch (err: any) {
    console.error("PUT /api/doctor/profile error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}







