// app/api/patient/profile/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";

// Helper function to format patient data
async function formatPatientProfile(user: any) {
  // Assuming the patient's core profile is directly on the User model
  // If you use a separate ConsumerProfile model, you'd include it here
  return {
    id: user.id, // User ID, which acts as patientId for relations
    name: user.name || 'N/A',
    email: user.email || 'N/A',
    phone: user.phone || 'N/A',
    profilePicture: user.profilePicture || 'https://placehold.co/100x100/A7F3D0/0D9488?text=PT',
    // Add any ConsumerProfile specific fields if you have them and include them in the query
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A',
  };
}

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId"); // This is the User.id for the patient

  if (!patientId) {
    return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: patientId },
      // Include ConsumerProfile if you have it and want to display its fields
      // include: {
      //   consumerProfile: true,
      // },
    });

    if (!user) {
      return NextResponse.json({ error: "Patient (User) not found" }, { status: 404 });
    }

    const formattedProfile = await formatPatientProfile(user);
    return NextResponse.json(formattedProfile);
  } catch (err: any) {
    console.error("GET /api/patient/profile error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId"); // This is the User.id for the patient
  const body = await request.json();
  const { name, email, phone, profilePicture } = body;

  if (!patientId) {
    return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: patientId },
      data: {
        name: name,
        email: email,
        phone: phone,
        profilePicture: profilePicture,
      },
      // Include ConsumerProfile if you have it and want to update its fields
      // include: {
      //   consumerProfile: true,
      // },
    });

    const formattedUpdatedProfile = await formatPatientProfile(updatedUser);
    return NextResponse.json(formattedUpdatedProfile);
  } catch (err: any) {
    console.error("PUT /api/patient/profile error:", err);
    // Handle unique constraint violation for email if applicable
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}



