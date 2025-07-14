// app/api/admin/[adminSlug]/patients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import bcrypt from 'bcrypt';

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const searchKeyword = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const validSortBy = ["name", "email", "createdAt"]; // Assuming these are common sortable fields on User
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const whereClause: any = {
      // Filter users who are associated with this company AND have a patient-like role
      companyAdmin: { some: { id: company.id } }, // This relation needs careful checking based on your schema
      OR: [
        { role: "CLIENT" },
        { role: "CONSUMER" },
        { role: "STUDENT" }, // If students are considered patients
        { role: "PARENT" }, // If parents are considered patients
      ],
    };

    if (searchKeyword) {
      whereClause.OR.push(
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { email: { contains: searchKeyword, mode: 'insensitive' } },
        { phone: { contains: searchKeyword, mode: 'insensitive' } },
      );
    }

    const [patients, totalItems] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          // You might need to fetch lastVisit from Appointment model
          Appointment: {
            orderBy: { date: 'desc' },
            take: 1,
            select: { date: true }
          }
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const formattedPatients = patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      role: patient.role,
      imageUrl: patient.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${patient.name ? patient.name[0] : 'U'}`,
      lastVisit: patient.Appointment.length > 0 ? new Date(patient.Appointment[0].date).toISOString().split('T')[0] : 'N/A',
      dob: 'N/A', // DOB is not directly on User in your schema, would need a profile model
      gender: 'N/A', // Gender is not directly on User in your schema, would need a profile model
    }));

    return NextResponse.json({
      patients: formattedPatients,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const { name, email, password, phone, dob, gender, address, role = "CLIENT" } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ message: "Missing required fields: name, email, password" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role,
        // Link to company if 'companyAdmin' relation on User is for direct admin association
        // For patients, you might need to link via Client/Consumer/Student/Parent models
        // For simplicity, we'll assume the user is directly associated with the company for now
        // This might need adjustment based on how you link users to companies for patients
        Company: {
          connect: { id: company.id } // This assumes User has a direct relation to Company (companyAdmin)
        }
      },
    });

    // Create specific patient profile based on role
    if (role === "CLIENT") {
      await prisma.client.create({
        data: {
          userId: newUser.id,
          companyId: company.id,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phone,
          address: newUser.address,
          profilePicture: newUser.profilePicture,
          // Add dob, gender if Client model supports it
        }
      });
    } else if (role === "CONSUMER") {
      await prisma.consumer.create({
        data: {
          userId: newUser.id,
          companyId: company.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
          profilePicture: newUser.profilePicture,
        }
      });
    }
    // Add logic for STUDENT, PARENT roles if needed

    return NextResponse.json(
      { message: "Patient created successfully", patient: newUser },
      { status: 201 }
    );

  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message || String(error) },
      { status: 500 }
    );
  }
}
