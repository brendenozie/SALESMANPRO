// app/api/academic-levels/[academicLevelId]/students/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define types for the API response structure
export type StudentRosterStudent = {
  id: string; // Student ID
  userId: string; // User ID associated with the student
  name: string; // Student's name (from User model)
  email: string; // Student's email (from User model)
  profilePicture: string | null; // Student's profile picture (from Student model)
  parentId: string | null;
  parentEmail: string | null; // Parent's email (from Parent.User model)
  studentGrade: string | null; // From Student model
  // Add other relevant student fields as needed
};

export type StudentRosterAcademicLevelInfo = {
  id: string; // AcademicLevel ID
  name: string; // e.g., "Grade 7"
  description: string | null;
  studentsCount: number;
};

export type StudentRosterPageData = {
  academicLevelInfo: StudentRosterAcademicLevelInfo;
  students: StudentRosterStudent[];
  themeSettings: {
    primaryColor: string;
    accentColor: string;
  };
};

// GET /api/academic-levels/[academicLevelId]/students
// Fetches the student roster for a specific academic level within a company.
// Path Params: academicLevelId
// Query Params: companyId (required)
export async function GET(request: Request, { params }: { params: { academicLevelId: string } }) {
  try {
    const { academicLevelId } = params;
    const { searchParams } = new URL(request.url);
    // const companyId = searchParams.get('companyId');

    // if (!companyId) {
    //   return NextResponse.json({ message: "Company ID is required." }, { status: 400 });
    // }

    // 1. Fetch the AcademicLevel details
    const academicLevel = await prisma.academicLevel.findUnique({
      where: {
        id: academicLevelId,
        // companyId: companyId,
      },
      include: {
        _count: {
          select: { students: true }, // Count students associated with this academic level
        },
      },
    });

    if (!academicLevel) {
      return NextResponse.json({ message: "Academic Level not found or not associated with this company." }, { status: 404 });
    }

    const academicLevelInfo: StudentRosterAcademicLevelInfo = {
      id: academicLevel.id,
      name: academicLevel.name,
      description: academicLevel.description,
      studentsCount: academicLevel._count.students,
    };

    // 2. Fetch students associated with this AcademicLevel
    const students = await prisma.student.findMany({
      where: {
        academicLevelId: academicLevelId,
        // companyId: companyId,
      },
      include: {
        user: { // Include the related User model for name and email
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parent: { // Include the related Parent and its User model for parent email
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc', // Order students by name
        },
      },
    });

    const studentRosterStudents: StudentRosterStudent[] = students.map(student => ({
      id: student.id,
      userId: student.userId,
      name: student.user?.name || 'N/A',
      email: student.user?.email || 'N/A',
      profilePicture: student.profilePicture,
      parentId: student.parentId,
      parentEmail: student.parent?.user?.email || null,
      studentGrade: student.studentGrade,
    }));

    // 3. Mock Theme Settings (as they are hardcoded in the UI's mock context)
    const themeSettings = {
      primaryColor: "#fd2121",
      accentColor: "#FFC107",
    };

    const responseData: StudentRosterPageData = {
      academicLevelInfo,
      students: studentRosterStudents,
      themeSettings,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching student roster:", error);
    return NextResponse.json({ message: "Failed to fetch student roster", error: error.message }, { status: 500 });
  }
}
