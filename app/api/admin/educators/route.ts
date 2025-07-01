import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to generate a unique 6-digit login code
async function generateUniqueLoginCode(): Promise<string> {
  let code: string = '';
  let isUnique = false;
  while (!isUnique) {
    // Generate a random 6-digit number (000000 to 999999)
    code = Math.floor(100000 + Math.random() * 900000).toString();
    // Pad with leading zeros if necessary
    code = code.padStart(6, '0');

    // Check if the code already exists in the database
    const existingEducator = await prisma.educator.findUnique({
      where: { loginCode: code },
    });

    if (!existingEducator) {
      isUnique = true;
    }
  }
  return code;
}

// GET /api/educators
// Fetches all educators, including their associated User data and calculated counts.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const whereClause: any = {};
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const educators = await prisma.educator.findMany({
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
        Department: { // Include department details
          select: {
            id: true,
            name: true,
          },
        },
        _count: { // Include counts of related records
          select: {
            classesScheduled: true,
            coursesCreated: true,
            Exam: true,
            CourseMaterial: true,
            AttendanceRecord: true,
            createdDiscussionTopics: true,
            uploadedMaterials: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc', // Order by educator's name
        },
      },
    });

    // Transform the data to include calculated counts and flattened user/department info
    const response = await Promise.all(educators.map(async (educator) => {
      // Dynamically calculate totalStudents for each educator
      const totalStudents = 0;
      // await prisma.student.count({
      //   where: {
      //     courses: {
      //       some: {
      //         instructorId: educator.id,
      //       },
      //     },
      //   },
      // });

      return {
        id: educator.id,
        userId: educator.userId,
        loginCode: educator.loginCode, // Include the new loginCode
        name: educator.user?.name,
        email: educator.user?.email,
        profilePicture: educator.profilePicture || educator.user?.image, // Prefer educator's specific pic, fallback to user's
        phone: educator.phone,
        bio: educator.bio,
        address: educator.address,
        companyId: educator.companyId,
        departmentId: educator.departmentId,
        departmentName: educator.Department?.name || 'N/A',
        totalStudents: totalStudents, // Calculated
        totalCoursesTaught: educator._count.coursesCreated, // From _count
        totalClassesScheduled: educator._count.classesScheduled, // From _count
        totalExamsCreated: educator._count.Exam,
        totalMaterialsUploaded: educator._count.CourseMaterial,
        createdAt: educator.createdAt,
        updatedAt: educator.updatedAt,
      };
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching educators:", error);
    return NextResponse.json({ message: "Failed to fetch educators", error: error.message }, { status: 500 });
  }
}

// POST /api/educators
// Creates a new Educator profile, linking to an existing User or creating a new basic User.
export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, name, companyId, phone, bio, address, profilePicture, departmentId } = body;

    // Basic validation
    if (!email || !name || !companyId) {
      return NextResponse.json({ message: "Email, Name, and Company ID are required to create an educator." }, { status: 400 });
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
          image: profilePicture, // Use provided profile picture for user's image too
          // You might want to set a default role here if your User model has one
          // role: 'EDUCATOR', // Assuming your User model has a role field
        },
      });
    } else {
      // If user exists, check if they already have an educator profile for this user
      const existingEducator = await prisma.educator.findUnique({
        where: { userId: user.id },
      });
      if (existingEducator) {
        return NextResponse.json({ message: "A teacher profile already exists for this user." }, { status: 409 });
      }
    }

    // 2. Generate a unique login code
    const loginCode = await generateUniqueLoginCode();

    // 3. Create Educator Profile
    const newEducator = await prisma.educator.create({
      data: {
        userId: user.id,
        companyId,
        loginCode, // Assign the generated unique code
        phone,
        bio,
        address,
        profilePicture,
        // departmentId: typeof departmentId !== 'undefined' ? departmentId : null, // Allow null if no department is specified
        // totalStudents and totalCoursesTaught are @default(0) and calculated dynamically
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        Department: {
          select: { id: true, name: true },
        },
      },
    });

    // Transform the response
    const responseData = {
      id: newEducator.id,
      userId: newEducator.userId,
      loginCode: newEducator.loginCode, // Include the login code in the response
      name: newEducator.user?.name,
      email: newEducator.user?.email,
      profilePicture: newEducator.profilePicture || newEducator.user?.image,
      phone: newEducator.phone,
      bio: newEducator.bio,
      address: newEducator.address,
      companyId: newEducator.companyId,
      departmentId: newEducator.departmentId,
      departmentName: newEducator.Department?.name || 'N/A',
      totalStudents: 0, // Will be calculated on GET
      totalCoursesTaught: 0, // Will be calculated on GET
      totalClassesScheduled: 0,
      totalExamsCreated: 0,
      totalMaterialsUploaded: 0,
      createdAt: newEducator.createdAt,
      updatedAt: newEducator.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating educator:", error);
    // Handle unique constraint error for userId on Educator model
    if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
      return NextResponse.json({ message: "A teacher profile already exists for this user." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create educator", error: error.message }, { status: 500 });
  }
}
