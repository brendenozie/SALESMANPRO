import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to generate a unique 6-digit login code for parents
async function generateUniqueLoginCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    code = code.padStart(6, '0');

    const existingParent = await prisma.parent.findUnique({
      where: { loginCode: code },
    });

    if (!existingParent) {
      isUnique = true;
    }
  }
  return code;
}

// GET /api/parents
// Fetches all parent profiles, including their associated User data.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const whereClause: any = {};
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const parents = await prisma.parent.findMany({
      where: whereClause,
      include: {
        user: { // Include the linked User details
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
          },
        },
        _count: { // Include count of children
          select: {
            children: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc', // Order by parent's name
        },
      },
    });

    // Transform the data to include flattened user info and children count
    const response = parents.map((parent) => {
      return {
        id: parent.id,
        userId: parent.userId,
        loginCode: parent.loginCode,
        name: parent.user?.name,
        email: parent.user?.email,
        profilePicture: parent.profilePicture || parent.user?.image,
        phone: parent.phone,
        bio: parent.bio,
        address: parent.address,
        companyId: parent.companyId,
        totalChildren: parent._count.children,
        createdAt: parent.createdAt,
        updatedAt: parent.updatedAt,
      };
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching parents:", error);
    return NextResponse.json({ message: "Failed to fetch parents", error: error.message }, { status: 500 });
  }
}

// POST /api/parents
// Creates a new Parent profile, linking to an existing User or creating a new basic User.
export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, name, companyId, phone, bio, address, profilePicture } = body;

    // Basic validation
    if (!email || !name) {
      return NextResponse.json({ message: "Email and Name are required to create a parent." }, { status: 400 });
    }

    // 1. Find or Create User
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // If user doesn't exist, create a new basic user
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: profilePicture,
        },
      });
    } else {
      // If user exists, check if they already have a parent profile for this user
      const existingParent = await prisma.parent.findUnique({
        where: { userId: user.id },
      });
      if (existingParent) {
        return NextResponse.json({ message: "A parent profile already exists for this user." }, { status: 409 });
      }
    }

    // 2. Generate a unique login code
    const loginCode = await generateUniqueLoginCode();

    // 3. Create Parent Profile
    const newParent = await prisma.parent.create({
      data: {
        userId: user.id,
        loginCode,
        companyId,
        phone,
        bio,
        address,
        profilePicture,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // Transform the response
    const responseData = {
      id: newParent.id,
      userId: newParent.userId,
      loginCode: newParent.loginCode,
      name: newParent.user?.name,
      email: newParent.user?.email,
      profilePicture: newParent.profilePicture || newParent.user?.image,
      phone: newParent.phone,
      bio: newParent.bio,
      address: newParent.address,
      companyId: newParent.companyId,
      totalChildren: 0, // Will be calculated on GET
      createdAt: newParent.createdAt,
      updatedAt: newParent.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating parent:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
      return NextResponse.json({ message: "A parent profile already exists for this user." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create parent", error: error.message }, { status: 500 });
  }
}
