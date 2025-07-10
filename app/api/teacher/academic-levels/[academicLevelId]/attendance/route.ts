// app/api/academic-levels/[academicLevelId]/attendance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define types for API request/response
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'TARDY' | 'EXCUSED'; // Matches Prisma Enum

export type StudentForAttendance = {
  id: string; // Student ID
  userId: string; // User ID associated with the student
  name: string; // Student's name (from User model)
  profilePicture: string | null; // Student's profile picture (from Student model)
  currentStatus: AttendanceStatus;
};

interface AcademicLevelInfo {
  id: string;
  name: string;
  description: string | null;
  studentsCount: number;
}

interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
}

export interface TakeAttendancePageData { // Changed to export for external use if needed
  academicLevelInfo: AcademicLevelInfo;
  students: StudentForAttendance[];
  themeSettings: ThemeSettings;
}

// Interface for the structure of each attendance record in the POST body
interface StudentAttendanceRecordPayload {
  status: AttendanceStatus;
  reason?: string | null;
}

// GET /api/academic-levels/[academicLevelId]/attendance
// Fetches students and their attendance status for a specific academic level and date.
// Path Params: academicLevelId
// Query Params: date (required, YYYY-MM-DD), educatorId (required - Educator's User.id)
export async function GET(request: Request, { params }: { params: { academicLevelId: string } }) {
  try {
    const { academicLevelId } = params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date'); //YYYY-MM-DD
    const educatorUserId = searchParams.get('educatorId'); // The Educator's User.id who is recording attendance

    if (!dateStr || !educatorUserId) {
      return NextResponse.json({ message: "Date and educatorId are required." }, { status: 400 });
    }

    const attendanceDate = new Date(dateStr);
    attendanceDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC for consistent querying

    // Resolve educatorUserId to Educator.id for authorization/validation purposes
    const recordingEducator = await prisma.educator.findUnique({
      where: { userId: educatorUserId },
      select: { id: true, companyId: true } // Also get companyId for future validation if needed
    });

    if (!recordingEducator) {
      return NextResponse.json({ message: "Educator not found or not authorized to access this page." }, { status: 403 });
    }
    const recordingEducatorId = recordingEducator.id;

    // Verify AcademicLevel exists and get its details
    const academicLevel = await prisma.academicLevel.findUnique({
      where: {
        id: academicLevelId,
        // Optional: Add companyId check here if academic levels are strictly tied to a company
        // companyId: recordingEducator.companyId,
      },
      include: {
        _count: {
          select: { StudentAcademicLevel: true },
        },
      },
    });

    if (!academicLevel) {
      return NextResponse.json({ message: "Academic Level not found." }, { status: 404 });
    }

    // Check EducatorAcademicLevelAssignment for authorization
    const assignment = await prisma.educatorAcademicLevelAssignment.findFirst({
      where: { educatorId: recordingEducatorId, academicLevelId },
    });
    if (!assignment) {
      return NextResponse.json(
        { message: 'Educator is not assigned to this academic level and cannot view/record attendance.' },
        { status: 403 }
      );
    }

    // Fetch students associated with this AcademicLevel through the StudentAcademicLevel junction table
    const studentAcademicLevels = await prisma.studentAcademicLevel.findMany({
      where: {
        academicLevelId: academicLevelId,
      },
      include: {
        student: { // Include the student details
          include: {
            user: {
              select: { id: true, name: true, image: true }, // Added image for profile picture if User has it
            },
            AttendanceRecord: { // Fetch existing attendance records for *this* student on the given date
              where: {
                date: attendanceDate,
                academicLevelId: academicLevelId,
                classScheduleId: null, // For general daily attendance
                // REMOVED: recordedById filter, to show overall attendance regardless of who recorded it.
              },
              select: {
                status: true,
                createdAt: true, // Used for ordering to get the latest status
              },
              orderBy: {
                createdAt: 'desc', // Get the latest record if multiple exist for the same student/date
              },
              take: 1, // Only need the most recent one
            },
          },
        },
      },
      orderBy: {
        student: {
          user: {
            name: 'asc',
          },
        },
      },
    });

    // Map the results to the desired StudentForAttendance format
    const studentsForAttendance: StudentForAttendance[] = studentAcademicLevels.map(sal => ({
      id: sal.student.id,
      userId: sal.student.userId,
      name: sal.student.user?.name || 'N/A',
      profilePicture: sal.student.profilePicture || sal.student.user?.image || null, // Prioritize student's picture, then user's, then null
      // Set currentStatus based on fetched record, default to 'ABSENT' if no record
      currentStatus: (sal.student.AttendanceRecord.length > 0 ? sal.student.AttendanceRecord[0].status : 'ABSENT') as AttendanceStatus,
    }));

    // Mock Theme Settings
    const themeSettings = {
      primaryColor: "#fd2121",
      accentColor: "#FFC107",
    };

    const responseData: TakeAttendancePageData = {
      academicLevelInfo: {
        id: academicLevel.id,
        name: academicLevel.name,
        description: academicLevel.description,
        studentsCount: academicLevel._count.StudentAcademicLevel,
      },
      students: studentsForAttendance,
      themeSettings,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json({ message: "Failed to fetch attendance data", error: error.message }, { status: 500 });
  }
}

// POST /api/academic-levels/[academicLevelId]/attendance (No changes in this part)
// Saves/updates attendance records for a specific academic level and date.
// ... (rest of the POST code remains the same as previously provided)
// app/api/academic-levels/[academicLevelId]/attendance/route.ts

export async function POST(
  request: Request,
  { params }: { params: { academicLevelId: string } }
) {
  try {
    const { academicLevelId } = params;
    const { date: dateStr, educatorId, attendanceRecords } =
      await request.json() as {
        date: string;
        educatorId: string; // This is Educator.userId from the request body
        attendanceRecords: Record<string, StudentAttendanceRecordPayload>;
      };

    console.log("POST Request Received:");
    console.log("  academicLevelId:", academicLevelId);
    console.log("  dateStr:", dateStr);
    console.log("  educatorId (from frontend):", educatorId);
    console.log("  attendanceRecords payload:", JSON.stringify(attendanceRecords, null, 2));


    const attendanceDate = new Date(dateStr);
    attendanceDate.setUTCHours(0, 0, 0, 0);
    console.log("  Normalized attendanceDate:", attendanceDate.toISOString());

    // 1. Verify educator using their User.id to find the Educator record
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorId },
      select: { id: true, companyId: true }
    });
    console.log("  Educator found:", educator ? educator.id : "NOT FOUND");
    if (!educator) {
      console.error("  Error: Educator not found or not authorized for userId:", educatorId);
      return NextResponse.json(
        { message: 'Educator not found or not authorized.' },
        { status: 403 }
      );
    }

    // 2. Get the academic level's companyId for setting on the attendance record
    const academicLevelDetails = await prisma.academicLevel.findUnique({
      where: { id: academicLevelId },
      select: { companyId: true }
    });
    console.log("  Academic Level Company ID:", academicLevelDetails ? academicLevelDetails.companyId : "NOT FOUND");

    if (!academicLevelDetails) {
      console.error("  Error: Academic Level not found for company ID lookup:", academicLevelId);
      return NextResponse.json({ message: "Academic Level not found for company ID lookup." }, { status: 404 });
    }
    const companyIdToSet = academicLevelDetails.companyId;

    // 3. Check EducatorAcademicLevelAssignment (now present in schema)
    const assignment = await prisma.educatorAcademicLevelAssignment.findFirst({
      where: { educatorId: educator.id, academicLevelId },
    });
    console.log("  Educator Academic Level Assignment found:", assignment ? "YES" : "NO");
    if (!assignment) {
      console.warn(`Educator ${educator.id} is not assigned to academic level ${academicLevelId}. Denying attendance submission.`);
      return NextResponse.json(
        { message: 'Educator is not assigned to this academic level and cannot record attendance.' },
        { status: 403 }
      );
    }

    console.log("Starting Prisma transaction...");
    const results = await prisma.$transaction(async (tx) => {
      const ops: Array<ReturnType<typeof tx.attendanceRecord.update> | ReturnType<typeof tx.attendanceRecord.create>> = [];

      for (const [studentId, recordData] of Object.entries(attendanceRecords)) {
        console.log(`  Processing studentId: ${studentId}, status: ${recordData.status}`);
        const existing = await tx.attendanceRecord.findFirst({
          where: {
            studentId,
            date: attendanceDate,
            classScheduleId: null,
            academicLevelId,
            companyId: companyIdToSet,
          },
        });
        console.log(`    Existing record for ${studentId}:`, existing ? `ID: ${existing.id}, Status: ${existing.status}` : "NOT FOUND");

        if (existing) {
          ops.push(
            tx.attendanceRecord.update({
              where: { id: existing.id },
              data: {
                status: recordData.status,
                reason: recordData.reason,
                recordedById: educator.id,
                academicLevelId,
                companyId: companyIdToSet,
              },
            })
          );
          console.log(`    Scheduled UPDATE for ${studentId}`);
        } else {
          ops.push(
            tx.attendanceRecord.create({
              data: {
                studentId,
                date: attendanceDate,
                status: recordData.status,
                classScheduleId: null,
                academicLevelId,
                recordedById: educator.id,
                reason: recordData.reason,
                companyId: companyIdToSet,
              },
            })
          );
          console.log(`    Scheduled CREATE for ${studentId}`);
        }
      }
      console.log(`  Total operations scheduled in transaction: ${ops.length}`);
      // return ops; // This will execute the scheduled operations
      const executedResults = await Promise.all(ops); // <--- ADD THIS LINE
      return executedResults;
    });

    console.log("Prisma transaction completed. Results:", results);
    return NextResponse.json(
      { message: 'Attendance saved successfully!', recordsProcessed: results.length },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error saving attendance (caught in catch block):', error);
    return NextResponse.json(
      {
        message: 'Failed to save attendance',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}