// app/api/admin/clients/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

interface Params {
  params: { id: string };
}
// Helper function to format patient data
async function formatPatientData(consumer: any) {
  const user = consumer.user;
  let lastVisitDate: string | null = null;

  // Fetch the latest appointment for the user
  if (user && user.id) {
    const latestAppointment = await prisma.appointment.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
    if (latestAppointment && latestAppointment.date) {
      lastVisitDate = new Date(latestAppointment.date).toLocaleDateString();
    }
  }

  // Note: dob and gender are assumed to be directly on the User model for simplicity.
  // If not, you'd need to extend your User schema or store them elsewhere (e.g., on Consumer model, or a dedicated PatientProfile).
  return {
    id: consumer.id, // Consumer's ID
    name: user?.name || 'N/A',
    email: user?.email || 'N/A',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${user?.name ? user.name.charAt(0) : '?'}${user?.name ? user.name.charAt(1) : ''}`,
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : 'N/A', // Assuming dob is a Date in User
    gender: user?.gender || 'Other', // Assuming gender is a string in User
    lastVisit: lastVisitDate || 'N/A',
    createdAt: consumer.createdAt ? new Date(consumer.createdAt).toLocaleDateString() : 'N/A',
  };
}

// app/api/admin/patients/[id]/route.ts
// This file handles GET, PUT, DELETE for a specific patient by ID

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // This is the Consumer ID

  try {
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
            dob: true,
            gender: true,
          },
        },
      },
    });

    if (!consumer) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patient = await formatPatientData(consumer);
    return NextResponse.json(patient);
  } catch (err: any) {
    console.error(`GET /api/admin/patients/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // This is the Consumer ID
  const body = await request.json();
  const { name, email, phone, dob, gender, profilePicture } = body;

  try {
    // Find the consumer to get the associated userId
    const consumer = await prisma.consumer.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!consumer) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update the associated User record
    const updatedUser = await prisma.user.update({
      where: { id: consumer.userId },
      data: {
        name,
        email,
        phone,
        profilePicture,
        dob: dob ? new Date(dob) : null,
        gender: gender || null,
      },
    });

    // If there are fields specific to the Consumer model that need updating, do it here.
    // For now, assuming all updatable patient-related fields are on the User model.
    // const updatedConsumer = await prisma.consumer.update({
    //   where: { id },
    //   data: {
    //     // consumer-specific fields here if any
    //   },
    // });

    // Re-fetch the consumer with updated user data to format the response
    const updatedConsumerWithUser = await prisma.consumer.findUnique({
      where: { id },
      include: { user: true },
    });

    const updatedPatient = await formatPatientData(updatedConsumerWithUser);

    return NextResponse.json(updatedPatient);
  } catch (err: any) {
    console.error(`PUT /api/admin/patients/${id} error:`, err);
    // Handle unique constraint violation for email
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // This is the Consumer ID

  try {
    // Find the consumer to get the associated userId
    const consumer = await prisma.consumer.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!consumer) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Delete the Consumer record
    await prisma.consumer.delete({
      where: { id },
    });

    // Delete the associated User record.
    // Ensure your Prisma schema has `onDelete: Cascade` on the User-Consumer relation
    // if you want the User to be deleted automatically when the Consumer is deleted.
    // Otherwise, you need to explicitly delete the User here.
    await prisma.user.delete({
      where: { id: consumer.userId },
    });

    return NextResponse.json({ message: "Patient deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error(`DELETE /api/admin/patients/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
