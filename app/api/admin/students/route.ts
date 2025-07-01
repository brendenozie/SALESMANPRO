import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to generate a unique 6-digit login code (admission number)
async function generateUniqueLoginCode(): Promise<string> {
  let code: string = '';
  let isUnique = false;
  while (!isUnique) {
    // Generate a random 6-digit number (000000 to 999999)
    code = Math.floor(100000 + Math.random() * 900000).toString();
    // Pad with leading zeros if necessary
    code = code.padStart(6, '0');

    // Check if the code already exists in the database for students
    const existingStudent = await prisma.student.findUnique({
      where: { loginCode: code },
    });

    if (!existingStudent) {
      isUnique = true;
    }
  }
  return code;
}

// GET /api/students
// Fetches all student profiles, including their associated User data and calculated counts.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const whereClause: any = {};
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const students = await prisma.student.findMany({
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
        parent: { // NEW: Include the linked Parent details
          select: {
            id: true,
            phone: true,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        _count: { // Include counts of related records
          select: {
            enrolledCourses: true,
            submissions: true,
            AttendanceRecord: true,
            ExamSubmission: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc', // Order by student's name
        },
      },
    });

    // Transform the data to include calculated counts and flattened user/parent info
    const response = students.map((student) => {
      return {
        id: student.id,
        userId: student.userId,
        loginCode: student.loginCode, // Include the new loginCode (admission number)
        name: student.user?.name,
        email: student.user?.email,
        profilePicture: student.profilePicture || student.user?.image, // Prefer student's specific pic, fallback to user's
        phone: student.phone,
        bio: student.bio,
        address: student.address,
        companyId: student.companyId,
        studentGrade: student.studentGrade,
        parentId: student.parentId, // NEW: Include parentId
        parentName: student.parent?.user.name, // NEW: Flatten parent name
        parentEmail: student.parent?.user.email, // NEW: Flatten parent email
        parentPhone: student.parent?.phone, // NEW: Flatten parent phone
        totalCourses: student._count.enrolledCourses,
        completedCourses: student.completedCourses,
        certificatesEarned: student.certificatesEarned,
        averageProgress: student.averageProgress,
        totalSubmissions: student._count.submissions,
        totalAttendanceRecords: student._count.AttendanceRecord,
        totalExamSubmissions: student._count.ExamSubmission,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      };
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ message: "Failed to fetch students", error: error.message }, { status: 500 });
  }
}

// POST /api/students
// Creates a new Student profile, linking to an existing User and optionally an existing Parent.
export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, name, companyId, phone, bio, address, profilePicture, studentGrade, parentId } = body; // NEW: parentId

    // Basic validation
    if (!email || !name) {
      return NextResponse.json({ message: "Email and Name are required to create a student." }, { status: 400 });
    }

    // 1. Find or Create User
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
      const existingStudent = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (existingStudent) {
        return NextResponse.json({ message: "A student profile already exists for this user." }, { status: 409 });
      }
    }

    // 2. Validate ParentId if provided
    if (parentId) {
      const existingParent = await prisma.parent.findUnique({
        where: { id: parentId },
      });
      if (!existingParent) {
        return NextResponse.json({ message: "Provided parentId does not exist." }, { status: 400 });
      }
    }

    // 3. Generate a unique login code (admission number)
    const loginCode = await generateUniqueLoginCode();

    // 4. Create Student Profile
    const newStudent = await prisma.student.create({
      data: {
        userId: user.id,
        loginCode,
        companyId,
        parentId, // NEW: Assign parentId
        phone,
        bio,
        address,
        profilePicture,
        studentGrade,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        parent: { // NEW: Include parent for response
          select: { id: true, phone: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Transform the response
    const responseData = {
      id: newStudent.id,
      userId: newStudent.userId,
      loginCode: newStudent.loginCode,
      name: newStudent.user?.name,
      email: newStudent.user?.email,
      profilePicture: newStudent.profilePicture || newStudent.user?.image,
      phone: newStudent.phone,
      bio: newStudent.bio,
      address: newStudent.address,
      companyId: newStudent.companyId,
      studentGrade: newStudent.studentGrade,
      parentId: newStudent.parentId,
      parentName: newStudent.parent?.user.name,
      parentEmail: newStudent.parent?.user.email,
      parentPhone: newStudent.parent?.phone,
      totalCourses: 0,
      completedCourses: 0,
      certificatesEarned: 0,
      averageProgress: 0.0,
      totalSubmissions: 0,
      totalAttendanceRecords: 0,
      totalExamSubmissions: 0,
      createdAt: newStudent.createdAt,
      updatedAt: newStudent.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating student:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
      return NextResponse.json({ message: "A student profile already exists for this user." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create student", error: error.message }, { status: 500 });
  }
}
