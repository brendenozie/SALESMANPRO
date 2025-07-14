// app/api/admin/[adminSlug]/staff/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import bcrypt from 'bcrypt';

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const filterRole = searchParams.get("role");
  const searchKeyword = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const validSortBy = ["name", "email", "createdAt"];
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
      Company: { some: { id: company.id } }, // Users associated with this company
      // Filter out patient-like roles and only include staff/admin roles
      role: {
        in: ["ADMIN", "AGENT", "EDUCATOR", "HEADTEACHER"] // Adjust roles as per your definition of 'staff'
      },
    };

    if (filterRole && filterRole !== 'All') {
      whereClause.role = filterRole;
    }

    if (searchKeyword) {
      whereClause.OR = [
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { email: { contains: searchKeyword, mode: 'insensitive' } },
        { phone: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    const [staffMembers, totalItems] = await prisma.$transaction([
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
          // Include specific staff profile data if needed (e.g., SalesAgent, Educator, HeadTeacher)
          SalesAgentProfile: { select: { id: true } },
          Educator: { select: { id: true, department: { select: { name: true } } } },
          HeadTeacher: { select: { id: true } },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const formattedStaff = staffMembers.map(member => {
      let department = 'N/A';
      if (member.Educator && member.Educator.length > 0 && member.Educator[0].department) {
        department = member.Educator[0].department.name;
      } else if (member.role === 'ADMIN') {
        department = 'Administration';
      } else if (member.role === 'AGENT') {
        department = 'Sales';
      } else if (member.role === 'HEADTEACHER') {
        department = 'Academic Leadership';
      }

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        department: department,
        imageUrl: member.profilePicture || `https://placehold.co/100x100/D1FAE5/065F46?text=${member.name ? member.name[0] : 'U'}`,
      };
    });

    return NextResponse.json({
      staff: formattedStaff,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching staff members:", error);
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

  const { name, email, password, phone, role, departmentId, bio, profilePicture } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ message: "Missing required fields: name, email, password, role" }, { status: 400 });
  }

  // Ensure the role is a valid staff role
  const validStaffRoles = ["ADMIN", "AGENT", "EDUCATOR", "HEADTEACHER"];
  if (!validStaffRoles.includes(role)) {
    return NextResponse.json({ message: "Invalid staff role provided" }, { status: 400 });
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
        profilePicture,
        role,
        Company: {
          connect: { id: company.id } // Link user to company
        }
      },
    });

    // Create specific staff profile based on role
    if (role === "AGENT") {
      await prisma.salesAgent.create({
        data: {
          userId: newUser.id,
          companyId: company.id,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phone,
          profilePicture: newUser.profilePicture,
          bio: bio,
          loginCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        }
      });
    } else if (role === "EDUCATOR") {
      await prisma.educator.create({
        data: {
          userId: newUser.id,
          companyId: company.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          profilePicture: newUser.profilePicture,
          bio: bio,
          departmentId: departmentId,
          loginCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        }
      });
    } else if (role === "HEADTEACHER") {
      await prisma.headTeacher.create({
        data: {
          userId: newUser.id,
          companyId: company.id,
          name: newUser.name,
          phone: newUser.phone,
          profilePicture: newUser.profilePicture,
          bio: bio,
          loginCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        }
      });
    }
    // For ADMIN role, the User record itself might be sufficient, or you could have an AdminProfile model.

    return NextResponse.json(
      { message: "Staff member created successfully", staff: newUser },
      { status: 201 }
    );

  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }
    console.error("Error creating staff member:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message || String(error) },
      { status: 500 }
    );
  }
}
