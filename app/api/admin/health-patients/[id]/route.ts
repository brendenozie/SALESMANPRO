// app/api/admin/[adminSlug]/patients/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const patient = await prisma.user.findUnique({
      where: {
        id: id,
        // Ensure the user belongs to this company and is a patient-like role
        OR: [
            { role: "CLIENT" },
            { role: "CONSUMER" },
            { role: "STUDENT" },
            { role: "PARENT" },
        ],
        Company: { some: { id: company.id } } // Check company association
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        // Include related profile data if needed
        Client: { select: { id: true, salesAgentId: true } },
        Consumer: { select: { id: true } },
        Student: { select: { id: true, parentId: true, levelStatus: true } },
        Parent: { select: { id: true } },
        Appointment: {
          orderBy: { date: 'desc' },
          take: 5, // Fetch recent appointments
          select: { id: true, date: true, time: true, status: true, service: true }
        }
      },
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found or not associated with this company" }, { status: 404 });
    }

    // You might need to format the patient data further for the frontend
    const formattedPatient = {
      ...patient,
      lastVisit: patient.Appointment.length > 0 ? new Date(patient.Appointment[0].date).toISOString().split('T')[0] : 'N/A',
      imageUrl: patient.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${patient.name ? patient.name[0] : 'U'}`,
      // Add DOB and Gender if these are stored in Client/Consumer/Student models
      dob: 'N/A',
      gender: 'N/A',
    };

    return NextResponse.json(formattedPatient, { status: 200 });

  } catch (error) {
    console.error("Error fetching patient details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;
  const body = await request.json();

  const { name, email, phone, address, profilePicture, role } = body; // Allow updating role if necessary

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
        // Ensure the user belongs to this company and is a patient-like role
        OR: [
            { role: "CLIENT" },
            { role: "CONSUMER" },
            { role: "STUDENT" },
            { role: "PARENT" },
        ],
        Company: { some: { id: company.id } } // Check company association
      },
      data: {
        name,
        email,
        phone,
        address,
        profilePicture,
        role,
        updatedAt: new Date(),
      },
    });

    // If role is updated, you might need to update/create/delete associated profile models (Client, Consumer etc.)
    // This logic can be complex and depends on your exact business rules for role changes.

    return NextResponse.json(
      { message: "Patient updated successfully", patient: updatedUser },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Before deleting, ensure the user exists and is associated with the company
    const patientToDelete = await prisma.user.findUnique({
        where: {
            id: id,
            OR: [
                { role: "CLIENT" },
                { role: "CONSUMER" },
                { role: "STUDENT" },
                { role: "PARENT" },
            ],
            Company: { some: { id: company.id } }
        },
        select: { id: true }
    });

    if (!patientToDelete) {
        return NextResponse.json({ message: "Patient not found or not associated with this company" }, { status: 404 });
    }

    // Perform deletion. Consider soft delete (e.g., setting a 'deletedAt' field)
    // instead of hard delete in a real application.
    await prisma.user.delete({
      where: { id: id },
    });

    // Also delete associated profiles (Client, Consumer, Student, Parent) if they exist
    await prisma.client.deleteMany({ where: { userId: id } });
    await prisma.consumer.deleteMany({ where: { userId: id } });
    await prisma.student.deleteMany({ where: { userId: id } });
    await prisma.parent.deleteMany({ where: { userId: id } });


    return NextResponse.json({ message: "Patient deleted successfully" }, { status: 204 });

  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
