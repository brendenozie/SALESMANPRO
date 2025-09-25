// app/api/donors/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

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

// app/api/admin/doctors/[id]/route.ts
// This file handles GET, PUT, DELETE for a specific doctor by ID

export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const formattedDoctor = await formatDoctorData(doctor);
    return NextResponse.json(formattedDoctor);
  } catch (err: any) {
    console.error(`GET /api/admin/doctors/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  const body = await request.json();
  const { name, email, phone, profilePicture, specialty, status } = body;

  try {
    // Find the doctor to get their associated userId
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Update the associated User record
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

    // Update the Doctor record
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        specialty: specialty,
        status: status,
        phone: phone, // Update doctor's specific phone if needed
        profilePicture: profilePicture, // Update doctor's specific profile picture if needed
      },
      include: {
        User: { select: { name: true, email: true, phone: true, profilePicture: true } },
      },
    });

    const formattedUpdatedDoctor = await formatDoctorData(updatedDoctor);

    return NextResponse.json(formattedUpdatedDoctor);
  } catch (err: any) {
    console.error(`PUT /api/admin/doctors/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    // Find the doctor to get their associated userId
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Delete the Doctor record
    await prisma.doctor.delete({
      where: { id },
    });

    // Optionally, you might want to update the user's role or delete the user
    // if they are no longer associated with any other roles.
    // For now, we'll just delete the Doctor profile.
    // If you want to delete the user if they are *only* a doctor:
    // const userRoles = await prisma.user.findUnique({
    //   where: { id: existingDoctor.userId },
    //   select: {
    //     consumerProfile: { select: { id: true } },
    //     salesAgentProfile: { select: { id: true } },
    //     clientProfile: { select: { id: true } },
    //     educator: { select: { id: true } }, // Assuming Doctor is an Educator
    //     headTeacher: { select: { id: true } },
    //     parent: { select: { id: true } },
    //     student: { select: { id: true } },
    //     writer: { select: { id: true } },
    //     donorProfile: { select: { id: true } },
    //   }
    // });
    // const hasOtherRoles = Object.values(userRoles || {}).some(role => role !== null);
    // if (!hasOtherRoles) {
    //   await prisma.user.delete({ where: { id: existingDoctor.userId } });
    // }


    return NextResponse.json({ message: "Doctor deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error(`DELETE /api/admin/doctors/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
