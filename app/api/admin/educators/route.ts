import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to generate a unique 6-digit login code
async function generateUniqueLoginCode(): Promise<string> {
  let code: string = '';
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    code = code.padStart(6, '0');

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
// Fetches all educators, including their associated User data, calculated counts,
// and assigned academic levels.
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
        academicLevelAssignments: { // NEW: Include the junction table
          include: {
            academicLevel: { // NEW: Include the actual AcademicLevel details
              select: {
                id: true,
                name: true,
                sortOrder: true,
              },
            },
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

    // Transform the data to include calculated counts and flattened user/department/academic level info
    const response = await Promise.all(educators.map(async (educator) => {
      // Dynamically calculate totalStudents for each educator
      const totalStudents = 0;
      // await prisma.student.count({
      //   where: {
      //     courses: { // Assuming a Course model links to Educator as instructor
      //       some: {
      //         instructorId: educator.id,
      //       },
      //     },
      //   },
      // });

      // Extract and sort assigned academic levels
      const assignedAcademicLevels = educator.academicLevelAssignments
        .map(assignment => assignment.academicLevel)
        .filter(Boolean) // Remove any nulls if academicLevel somehow wasn't found
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0)) // Sort by sortOrder
        .map(level => ({ id: level!.id, name: level!.name })); // Just id and name

      return {
        id: educator.id,
        userId: educator.userId,
        loginCode: educator.loginCode,
        name: educator.user?.name,
        email: educator.user?.email,
        profilePicture: educator.profilePicture || educator.user?.image,
        phone: educator.phone,
        bio: educator.bio,
        address: educator.address,
        companyId: educator.companyId,
        departmentId: educator.departmentId,
        departmentName: educator.Department?.name || 'N/A',
        assignedAcademicLevels: assignedAcademicLevels, // NEW: Array of assigned academic levels
        totalStudents: totalStudents,
        totalCoursesTaught: educator._count.coursesCreated,
        totalClassesScheduled: educator._count.classesScheduled,
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
// Academic level assignments are NOT handled here; they should be done via a PATCH to /[id]
export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, name, companyId, phone, bio, address, profilePicture, departmentId } = body;

    if (!email || !name || !companyId) {
      return NextResponse.json({ message: "Email, Name, and Company ID are required to create an educator." }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: profilePicture,
        },
      });
    } else {
      const existingEducator = await prisma.educator.findUnique({
        where: { userId: user.id },
      });
      if (existingEducator) {
        return NextResponse.json({ message: "A teacher profile already exists for this user." }, { status: 409 });
      }
    }

    const loginCode = await generateUniqueLoginCode();

    const newEducator = await prisma.educator.create({
      data: {
        userId: user.id,
        companyId,
        loginCode,
        phone,
        bio,
        address,
        profilePicture,
        departmentId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        Department: {
          select: { id: true, name: true },
        },
        academicLevelAssignments: { // Include for consistency, but will be empty
          include: { academicLevel: true }
        }
      },
    });

    const responseData = {
      id: newEducator.id,
      userId: newEducator.userId,
      loginCode: newEducator.loginCode,
      name: newEducator.user?.name,
      email: newEducator.user?.email,
      profilePicture: newEducator.profilePicture || newEducator.user?.image,
      phone: newEducator.phone,
      bio: newEducator.bio,
      address: newEducator.address,
      companyId: newEducator.companyId,
      departmentId: newEducator.departmentId,
      departmentName: newEducator.Department?.name || 'N/A',
      assignedAcademicLevels: [], // Newly created educator has no assignments yet
      totalStudents: 0,
      totalCoursesTaught: 0,
      totalClassesScheduled: 0,
      totalExamsCreated: 0,
      totalMaterialsUploaded: 0,
      createdAt: newEducator.createdAt,
      updatedAt: newEducator.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating educator:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
      return NextResponse.json({ message: "A teacher profile already exists for this user." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create educator", error: error.message }, { status: 500 });
  }
}
