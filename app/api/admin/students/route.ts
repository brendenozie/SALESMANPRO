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

    // Transform the data to include calculated counts and flattened user info
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
        totalCourses: student._count.enrolledCourses,
        completedCourses: student.completedCourses, // Assuming this is directly stored
        certificatesEarned: student.certificatesEarned, // Assuming this is directly stored
        averageProgress: student.averageProgress, // Assuming this is directly stored
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
// Creates a new Student profile, linking to an existing User or creating a new basic User.
export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, name, companyId, phone, bio, address, profilePicture, studentGrade } = body;

    // Basic validation
    if (!email || !name) { // companyId is optional on Student model
      return NextResponse.json({ message: "Email and Name are required to create a student." }, { status: 400 });
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
          // role: 'STUDENT',
        },
      });
    } else {
      // If user exists, check if they already have a student profile for this user
      const existingStudent = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (existingStudent) {
        return NextResponse.json({ message: "A student profile already exists for this user." }, { status: 409 });
      }
    }

    // 2. Generate a unique login code (admission number)
    const loginCode = await generateUniqueLoginCode();

    // 3. Create Student Profile
    const newStudent = await prisma.student.create({
      data: {
        userId: user.id,
        loginCode, // Assign the generated unique code
        companyId, // This is optional in your model
        phone,
        bio,
        address,
        profilePicture,
        studentGrade,
        // totalCourses, completedCourses, certificatesEarned, averageProgress are @default(0)
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // Transform the response
    const responseData = {
      id: newStudent.id,
      userId: newStudent.userId,
      loginCode: newStudent.loginCode, // Include the login code in the response
      name: newStudent.user?.name,
      email: newStudent.user?.email,
      profilePicture: newStudent.profilePicture || newStudent.user?.image,
      phone: newStudent.phone,
      bio: newStudent.bio,
      address: newStudent.address,
      companyId: newStudent.companyId,
      studentGrade: newStudent.studentGrade,
      totalCourses: 0, // Will be calculated on GET
      completedCourses: 0, // Will be calculated on GET
      certificatesEarned: 0, // Will be calculated on GET
      averageProgress: 0.0, // Will be calculated on GET
      totalSubmissions: 0,
      totalAttendanceRecords: 0,
      totalExamSubmissions: 0,
      createdAt: newStudent.createdAt,
      updatedAt: newStudent.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating student:", error);
    // Handle unique constraint error for userId on Student model
    if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
      return NextResponse.json({ message: "A student profile already exists for this user." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create student", error: error.message }, { status: 500 });
  }
}
