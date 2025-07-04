// app/api/teacher-classes/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define types for the API response structure
export type TeacherInfo = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type StudentInClass = {
  studentId: string;
  name: string;
  email: string;
  parentEmail: string;
};

export type ClassAssignment = {
  id: string;
  title: string;
  dueDate: string; // ISO string
  status: 'pending' | 'completed' | 'graded';
};

export type ClassResource = {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'Doc', 'Link'
  url?: string;
};

export type ClassEvent = {
  id: string;
  name: string;
  date: string; // ISO string or specific date format
  time: string; // e.g., '3:00 PM'
};

export type TeacherClass = {
  id: string;
  name: string; // Course name
  grade: string; // Academic level (e.g., '7', 'Grade 8', 'Form 1')
  studentsEnrolled: number;
  schedule: string; // e.g., 'Mon, Wed, Fri | 9:00 AM - 9:45 AM'
  room: string;
  description: string;
  students: StudentInClass[];
  assignments: ClassAssignment[];
  resources: ClassResource[];
  events: ClassEvent[];
};

export type TeacherClassesPageData = {
  teacherInfo: TeacherInfo;
  themeSettings: {
    primaryColor: string;
    accentColor: string;
  };
  teacherClasses: TeacherClass[];
};

// GET /api/teacher-classes
// Fetches all classes assigned to a specific teacher within a company.
// Query Params: companyId (required), teacherId (required)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const teacherId = searchParams.get('teacherId'); // This should be the Educator.userId

    if (!companyId || !teacherId) {
      return NextResponse.json({ message: "Company ID and Teacher ID are required." }, { status: 400 });
    }

    // 1. Fetch Teacher (Educator) Info
    const educator = await prisma.educator.findUnique({
      where: {
        userId: teacherId, // Assuming educatorId in Course model refers to Educator.userId
      },
      include: {
        user: { // Include the related User model to get name and email
          select: {
            id: true,
            name: true,
            email: true,
            role: true, // Assuming role is on User model
          },
        },
      },
    });

    if (!educator || educator.companyId !== companyId) {
      return NextResponse.json({ message: "Teacher not found or not associated with this company." }, { status: 404 });
    }

    const teacherInfo: TeacherInfo = {
      id: educator.userId,
      name: educator.user?.name || "Unknown Teacher",
      email: educator.user?.email || "N/A",
      role: educator.user?.role || "Educator",
    };

    // 2. Fetch Classes (Courses) assigned to this teacher
    const courses = await prisma.course.findMany({
      where: {
        companyId: companyId,
        educatorId: educator.id, // Link to Educator model's ID
      },
      orderBy: {
        name: 'asc', // Order by class name
      },
      // In a real app, you'd include relations for students, assignments, etc.
      // For now, we'll mock these nested arrays.
    });

    const teacherClasses: TeacherClass[] = courses.map(course => {
      // Mocking nested data as per the UI's sample structure
      const mockStudents: StudentInClass[] = [
        { studentId: 'S001', name: 'Alice Smith', email: 'alice.s@example.com', parentEmail: 'parent.alice@example.com' },
        { studentId: 'S002', name: 'Bob Johnson', email: 'bob.j@example.com', parentEmail: 'parent.bob@example.com' },
        { studentId: 'S003', name: 'Charlie Brown', email: 'charlie.b@example.com', parentEmail: 'parent.charlie@example.com' },
      ];
      const mockAssignments: ClassAssignment[] = [
        { id: 'A001', title: `Assignment for ${course.name}`, dueDate: new Date('2025-07-10').toISOString(), status: 'pending' },
      ];
      const mockResources: ClassResource[] = [
        { id: 'R001', name: `Syllabus for ${course.name}`, type: 'PDF', url: '#' },
      ];
      const mockEvents: ClassEvent[] = [
        { id: 'E001', name: `Quiz for ${course.name}`, date: new Date('2025-07-15').toISOString(), time: '10:00 AM' },
      ];

      return {
        id: course.id,
        name: course.name,
        grade: course.academicLevel, // Assuming academicLevel maps to 'grade'
        studentsEnrolled: mockStudents.length, // Or fetch real count if Enrollment model exists
        schedule: course.schedule || 'Not set', // Assuming schedule field exists
        room: course.room || 'N/A', // Assuming room field exists
        description: course.description || `No description provided for ${course.name}.`,
        students: mockStudents,
        assignments: mockAssignments,
        resources: mockResources,
        events: mockEvents,
      };
    });

    // 3. Mock Theme Settings (as they are hardcoded in the UI's mock context)
    const themeSettings = {
      primaryColor: "#fd2121",
      accentColor: "#FFC107",
    };

    const responseData: TeacherClassesPageData = {
      teacherInfo,
      themeSettings,
      teacherClasses,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json({ message: "Failed to fetch teacher classes", error: error.message }, { status: 500 });
  }
}
