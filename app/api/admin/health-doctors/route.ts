// app/api/admin/[adminSlug]/doctors/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import bcrypt from 'bcrypt';

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const filterStatus = searchParams.get("status");
  const searchKeyword = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const validSortBy = ["name", "email", "createdAt"]; // Assuming these are common sortable fields on User/Educator
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
      companyId: company.id, // Educators are linked to a company
    };

    // Assuming a 'status' field exists on the Educator model or can be derived
    // For now, we'll filter by a mock status if provided, or assume all active
    // if (filterStatus && filterStatus !== 'All') {
    //   whereClause.status = filterStatus; // You would need to add a 'status' field to Educator
    // }

    if (searchKeyword) {
      whereClause.OR = [
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { user: { email: { contains: searchKeyword, mode: 'insensitive' } } },
        { bio: { contains: searchKeyword, mode: 'insensitive' } }, // Assuming bio can contain specialty info
      ];
    }

    const [doctors, totalItems] = await prisma.$transaction([
      prisma.educator.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          phone: true,
          profilePicture: true,
          bio: true, // Can contain specialty info
          department: { select: { name: true } },
          user: { select: { email: true } },
          // If you add a 'status' field to Educator, select it here
        },
      }),
      prisma.educator.count({ where: whereClause }),
    ]);

    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.department?.name || 'General Practice', // Mocking specialty from department
      contact: doctor.phone || doctor.user?.email || 'N/A',
      status: filterStatus === 'On Leave' ? 'On Leave' : 'Active', // Mocking status
      imageUrl: doctor.profilePicture || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`,
    }));

    return NextResponse.json({
      doctors: formattedDoctors,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching doctors:", error);
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

  const { name, email, password, phone, specialty, imageUrl, bio, departmentId } = body;

  if (!name || !email || !password || !specialty) {
    return NextResponse.json({ message: "Missing required fields: name, email, password, specialty" }, { status: 400 });
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

    // Create a User record first
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        profilePicture: imageUrl,
        role: "EDUCATOR", // Assuming doctors are educators in your schema
        // Link to company if 'companyAdmin' relation on User is for direct admin association
        Company: {
          connect: { id: company.id } // This assumes User has a direct relation to Company (companyAdmin)
        }
      },
    });

    // Then create the Educator profile linked to the new User
    const newDoctor = await prisma.educator.create({
      data: {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        profilePicture: newUser.profilePicture,
        bio: bio || `Specialist in ${specialty}.`,
        companyId: company.id,
        departmentId: departmentId, // Link to department if provided
        loginCode: Math.random().toString(36).substring(2, 10).toUpperCase(), // Generate a mock login code
      },
    });

    return NextResponse.json(
      { message: "Doctor created successfully", doctor: newDoctor },
      { status: 201 }
    );

  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message || String(error) },
      { status: 500 }
    );
  }
}
