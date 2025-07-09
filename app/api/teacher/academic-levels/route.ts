// app/api/class-teacher-academic-levels/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define types for the API response structure
export type ClassTeacherInfo = {
  id: string; // Educator's userId
  name: string;
  email: string;
  role: string;
};

export type StudentInAcademicLevel = {
  studentId: string; // Student ID
  name: string;
  email: string;
  parentEmail: string | null; // Assuming parent email can be fetched via student.user.parent
};

export type AssignedAcademicLevel = {
  id: string; // AcademicLevel ID
  name: string; // e.g., "Grade 7"
  description: string | null;
  roleInLevel: string | null; // From EducatorAcademicLevelAssignment
  studentsCount: number; // Number of students primarily assigned to this AcademicLevel
  students: StudentInAcademicLevel[]; // List of students in this AcademicLevel
  // You could add mock/real data for events, announcements specific to this AcademicLevel here
  academicLevelEvents: { id: string; name: string; date: string; time: string }[];
  academicLevelAnnouncements: { id: string; text: string; type: 'info' | 'warning' }[];
};

export type ClassTeacherAcademicLevelsPageData = {
  classTeacherInfo: ClassTeacherInfo;
  themeSettings: {
    primaryColor: string;
    accentColor: string;
  };
  assignedAcademicLevels: AssignedAcademicLevel[];
};

// GET /api/class-teacher-academic-levels
// Fetches academic levels assigned to a class teacher within a company.
// Query Params: teacherId (required - User.id linked to Educator)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const teacherId = searchParams.get('teacherId'); // This is the User.id linked to Educator

    if (!teacherId) {
      return NextResponse.json({ message: "Teacher User ID is required." }, { status: 400 });
    }

    // 1. Fetch Educator Profile using teacherUserId
    // Include the associated User details for the class teacher info
    const educator = await prisma.educator.findUnique({
      where: {
        userId: teacherId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!educator) {
      return NextResponse.json({ message: "Teacher not found." }, { status: 404 });
    }

    // 2. Fetch AcademicLevel assignments for this Educator
    // This now includes the new StudentAcademicLevel junction table to get student details
    const academicLevelAssignments = await prisma.educatorAcademicLevelAssignment.findMany({
      where: {
        educatorId: educator.id, // Link to Educator model's ID
      },
      include: {
        academicLevel: {
          include: {
            // Updated: Fetch students via the StudentAcademicLevel junction table
            StudentAcademicLevel: {
              include: {
                student: { // Include the Student model
                  include: {
                    user: { // Include the User model for student's name and email
                      select: { id: true, name: true, email: true },
                    },
                    parent: { // Include the Parent model
                      include: {
                        user: { // Include the User model for parent's email
                          select: { email: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        academicLevel: {
          sortOrder: 'asc', // Order by the defined sort order for academic levels
        },
      },
    });

    const assignedAcademicLevels: AssignedAcademicLevel[] = academicLevelAssignments.map(assignment => {
      const academicLevel = assignment.academicLevel;

      // Map through the StudentAcademicLevel records to get the actual student data
      const studentsInLevel: StudentInAcademicLevel[] = academicLevel.StudentAcademicLevel.map(studentAcademicLevel => {
        const student = studentAcademicLevel.student;
        return {
          studentId: student.id,
          name: student.user?.name || 'N/A',
          email: student.user?.email || 'N/A',
          parentEmail: student.parent?.user?.email || null, // Access parent email via parent.user
        };
      });

      // --- Mocking nested data for Academic Level specific events/announcements ---
      // In a real application, these would be fetched from your database
      const mockAcademicLevelEvents = [
        { id: `ALE-${academicLevel.id}-001`, name: `Parent-Teacher Meeting for ${academicLevel.name}`, date: new Date('2025-08-01T15:00:00Z').toISOString(), time: '3:00 PM' },
        { id: `ALE-${academicLevel.id}-002`, name: `Field Trip to Museum for ${academicLevel.name}`, date: new Date('2025-09-10T09:00:00Z').toISOString(), time: '9:00 AM' },
      ];
      const mockAcademicLevelAnnouncements = [
        { id: `ALA-${academicLevel.id}-001`, text: `Reminder: ${academicLevel.name} project deadline is next Friday.`, type: 'info' as 'info' },
        { id: `ALA-${academicLevel.id}-002`, text: `Urgent: ${academicLevel.name} class photo rescheduled.`, type: 'warning' as 'warning' },
      ];
      // --- End Mocking ---

      return {
        id: academicLevel.id,
        name: academicLevel.name,
        description: academicLevel.description,
        roleInLevel: assignment.roleInLevel, // This field comes directly from the EducatorAcademicLevelAssignment
        studentsCount: studentsInLevel.length,
        students: studentsInLevel,
        academicLevelEvents: mockAcademicLevelEvents,
        academicLevelAnnouncements: mockAcademicLevelAnnouncements,
      };
    });

    // Prepare the final response object
    const classTeacherAcademicLevelsPageData: ClassTeacherAcademicLevelsPageData = {
      classTeacherInfo: {
        id: educator.user.id,
        name: educator.user.name || 'N/A',
        email: educator.user.email || 'N/A',
        role: educator.user.role || 'EDUCATOR', // Default to EDUCATOR if role is not explicitly set
      },
      themeSettings: {
        primaryColor: "#4A90E2", // Mocked theme settings
        accentColor: "#F5A623", // Mocked theme settings
      },
      assignedAcademicLevels: assignedAcademicLevels,
    };

    return NextResponse.json(classTeacherAcademicLevelsPageData, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching class teacher academic levels:", error);
    return NextResponse.json({ message: "Failed to fetch assigned academic levels", error: error.message }, { status: 500 });
  }
}
