import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to generate a unique 6-digit login code (admission number)
async function generateUniqueLoginCode(): Promise<string> {
  let code: string = '';
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    code = code.padStart(6, '0');

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
// Fetches all student profiles, including their associated User data, calculated counts,
// and linked academic level.
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
          },
        },
        parent: {
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
        academicLevel: { // NEW: Include academic level details
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
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
          name: 'asc',
        },
      },
    });

    // Transform the data to include calculated counts and flattened user/parent/academic level info
    const response = students.map((student) => {
      return {
        id: student.id,
        userId: student.userId,
        loginCode: student.loginCode,
        name: student.user?.name,
        email: student.user?.email,
        profilePicture: student.profilePicture || student.user?.image,
        phone: student.phone,
        bio: student.bio,
        address: student.address,
        companyId: student.companyId,
        parentId: student.parentId,
        parentName: student.parent?.user.name,
        parentEmail: student.parent?.user.email,
        parentPhone: student.parent?.phone,
        academicLevelId: student.academicLevelId, // NEW: Include academicLevelId
        academicLevelName: student.academicLevel?.name, // NEW: Flatten academic level name
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
// Creates a new Student profile, linking to an existing User and optionally an existing Parent and AcademicLevel.
export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, name, companyId, phone, bio, address, profilePicture, studentGrade, parentId, academicLevelId } = body; // studentGrade is now academicLevelId

    if (!email || !name) {
      return NextResponse.json({ message: "Email and Name are required to create a student." }, { status: 400 });
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
      const existingStudent = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (existingStudent) {
        return NextResponse.json({ message: "A student profile already exists for this user." }, { status: 409 });
      }
    }

    if (parentId) {
      const existingParent = await prisma.parent.findUnique({
        where: { id: parentId },
      });
      if (!existingParent) {
        return NextResponse.json({ message: "Provided parentId does not exist." }, { status: 400 });
      }
    }

    // NEW: Validate academicLevelId if provided
    if (academicLevelId) {
      const existingAcademicLevel = await prisma.academicLevel.findUnique({
        where: { id: academicLevelId },
      });
      if (!existingAcademicLevel) {
        return NextResponse.json({ message: "Provided academicLevelId does not exist." }, { status: 400 });
      }
    }

    const loginCode = await generateUniqueLoginCode();

    const newStudent = await prisma.student.create({
      data: {
        userId: user.id,
        loginCode,
        companyId,
        parentId,
        academicLevelId, // NEW: Assign academicLevelId
        phone,
        bio,
        address,
        profilePicture,
        studentGrade: studentGrade, // Keep for now if you still use it for other purposes, but academicLevelId is the primary
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        parent: {
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
        academicLevel: { // NEW: Include academic level for response
          select: { id: true, name: true },
        },
      },
    });

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
      academicLevelId: newStudent.academicLevelId,
      academicLevelName: newStudent.academicLevel?.name,
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
