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
  currentStatus: AttendanceStatus; // Current attendance status for the selected date
};

export type TakeAttendancePageData = {
  academicLevelInfo: {
    id: string; // AcademicLevel ID
    name: string; // e.g., "Grade 7"
    description: string | null;
    studentsCount: number;
  };
  students: StudentForAttendance[];
  themeSettings: {
    primaryColor: string;
    accentColor: string;
  };
};

// Interface for the structure of each attendance record in the POST body
interface StudentAttendanceRecordPayload {
  status: AttendanceStatus;
  reason?: string | null; // Explicitly allow null or undefined for reason
}

// GET /api/academic-levels/[academicLevelId]/attendance
// Fetches students and their attendance status for a specific academic level and date.
// Path Params: academicLevelId
// Query Params: companyId (required), date (required,YYYY-MM-DD), educatorId (required - Educator.id)
export async function GET(request: Request, { params }: { params: { academicLevelId: string } }) {
  try {
    const { academicLevelId } = params;
    const { searchParams } = new URL(request.url);
    // companyId is removed from direct query check as per user's latest API code,
    // but it's still good practice to validate it if it's logically required for access.
    // For now, we follow the provided code.
    const dateStr = searchParams.get('date'); //YYYY-MM-DD
    const educatorId = searchParams.get('educatorId'); // The Educator.id who is recording attendance

    if (!dateStr || !educatorId) {
      // Re-added companyId check if it's still expected from the frontend,
      // assuming it's passed as a path parameter or query parameter in the original context.
      // If companyId is truly no longer needed for GET, this check can be adjusted.
      // For now, let's assume it's implicitly handled by the academicLevel lookup.
      return NextResponse.json({ message: "Date and educatorId are required." }, { status: 400 });
    }

    const attendanceDate = new Date(dateStr);
    attendanceDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC for consistent querying

    // 1. Verify AcademicLevel exists
    const academicLevel = await prisma.academicLevel.findUnique({
      where: {
        id: academicLevelId,
        // companyId is implicitly linked if academicLevelId is unique within a company,
        // or if the educator is tied to a specific company.
        // If academicLevelId is globally unique, companyId check here might be redundant.
        // If academicLevelId is only unique within a company, companyId should be included here.
        // Based on the provided code, companyId is removed from `where` clause for academicLevel.
      },
      include: {
        _count: {
          select: { students: true }, // Count students associated with this academic level
        },
      },
    });

    if (!academicLevel) {
      return NextResponse.json({ message: "Academic Level not found." }, { status: 404 });
    }

    // 2. Fetch students primarily assigned to this AcademicLevel
    const students = await prisma.student.findMany({
      where: {
        academicLevelId: academicLevelId,
        // companyId is removed from student where clause as per user's latest API code.
        // This implies academicLevelId uniquely identifies students within a company,
        // or security is handled elsewhere.
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        // Fetch existing attendance records for these students on the given date,
        // specifically for this academic level and where classScheduleId is null
        AttendanceRecord: {
          where: {
            date: attendanceDate,
            academicLevelId: academicLevelId, // Crucial: Filter by the current academic level
            classScheduleId: null,           // Crucial: This is for general daily attendance
            recordedById: educatorId,        // Filter by the educator who recorded it
          },
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    const studentsForAttendance: StudentForAttendance[] = students.map(student => ({
      id: student.id,
      userId: student.userId,
      name: student.user?.name || 'N/A',
      profilePicture: student.profilePicture,
      // Set currentStatus based on fetched record, default to 'ABSENT' if no record
      currentStatus: (student.AttendanceRecord.length > 0 ? student.AttendanceRecord[0].status : 'ABSENT') as AttendanceStatus,
    }));

    // 3. Mock Theme Settings (as in original)
    const themeSettings = {
      primaryColor: "#fd2121",
      accentColor: "#FFC107",
    };

    const responseData: TakeAttendancePageData = {
      academicLevelInfo: {
        id: academicLevel.id,
        name: academicLevel.name,
        description: academicLevel.description,
        studentsCount: academicLevel._count.students,
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

// POST /api/academic-levels/[academicLevelId]/attendance
// Saves/updates attendance records for a specific academic level and date.
// Path Params: academicLevelId
// Body: {
//   companyId: string, // Re-added to body destructuring as UI sends it
//   date: string (YYYY-MM-DD),
//   educatorId: string (Educator.id),
//   attendanceRecords: { [studentId: string]: { status: AttendanceStatus, reason?: string | null } }
// }

export async function POST(
  request: Request,
  { params }: { params: { academicLevelId: string } }
) {
  try {
    const { academicLevelId } = params;
    const { date: dateStr, educatorId, attendanceRecords } =
      await request.json() as {
        date: string;
        educatorId: string;
        attendanceRecords: Record<string, StudentAttendanceRecordPayload>;
      };

    if (!dateStr || !educatorId || !attendanceRecords || typeof attendanceRecords !== 'object') {
      return NextResponse.json(
        { message: 'Missing required fields: date, educatorId, or attendanceRecords.' },
        { status: 400 }
      );
    }

    // Normalize date to start-of-day UTC
    const attendanceDate = new Date(dateStr);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // Verify educator
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorId },
    });
    if (!educator) {
      return NextResponse.json(
        { message: 'Educator not found or not authorized.' },
        { status: 403 }
      );
    }

    // (Optional) Check assignment
    const assignment = await prisma.educatorAcademicLevelAssignment.findFirst({
      where: { educatorId: educator.id, academicLevelId },
    });
    if (!assignment) {
      console.warn(`Educator ${educatorId} not assigned to level ${academicLevelId}`);
      // throw or continue based on your policy
    }

    // Run all find→update/create inside one interactive transaction
    const results = await prisma.$transaction(async (tx) => {
      const ops: Array<ReturnType<typeof tx.attendanceRecord.update> | ReturnType<typeof tx.attendanceRecord.create>> = [];

      for (const [studentId, recordData] of Object.entries(attendanceRecords)) {
        // 1) find existing “general” record
        const existing = await tx.attendanceRecord.findFirst({
          where: {
            studentId,
            date: attendanceDate,
            classScheduleId: null,
          },
        });

        if (existing) {
          // 2a) schedule an update
          ops.push(
            tx.attendanceRecord.update({
              where: { id: existing.id },
              data: {
                status: recordData.status,
                reason: recordData.reason,
                recordedById: educator.id,
                academicLevelId,
              },
            })
          );
        } else {
          // 2b) schedule a create
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
              },
            })
          );
        }
      }

      // Return an *array* of PrismaPromises; Prisma will execute them atomically
      return ops;
    });

    return NextResponse.json(
      { message: 'Attendance saved successfully!', recordsProcessed: results.length },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      {
        message: 'Failed to save attendance',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// export async function POST(request: Request, { params }: { params: { academicLevelId: string } }) {
//   try {
//     const { academicLevelId } = params;
//     const body = await request.json();
//     // Explicitly type attendanceRecords and re-add companyId to destructuring
//     const { date: dateStr, educatorId, attendanceRecords }: {
//       date: string;
//       educatorId: string;
//       attendanceRecords: Record<string, StudentAttendanceRecordPayload>;
//     } = body;

//     if ( !dateStr || !educatorId || !attendanceRecords || typeof attendanceRecords !== 'object') {
//       return NextResponse.json({ message: "Missing required fields: companyId, date, educatorId, or attendanceRecords." }, { status: 400 });
//     }

//     const attendanceDate = new Date(dateStr);
//     attendanceDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC

//     // Verify Educator exists and belongs to the company
//     // Changed lookup from userId to id for consistency with recordedById in AttendanceRecord model
//     const educator = await prisma.educator.findUnique({
//       where: { userId: educatorId, }, // Ensure educator belongs to the company
//     });
//     if (!educator) {
//       return NextResponse.json({ message: "Educator not found or not authorized for this company." }, { status: 403 });
//     }

//     // Optional: Verify that the educator is actually assigned to this academicLevel
//     const isEducatorAssignedToAcademicLevel = await prisma.educatorAcademicLevelAssignment.findFirst({
//       where: {
//         educatorId: educator.id,
//         academicLevelId: academicLevelId,
//       },
//     });

//     if (!isEducatorAssignedToAcademicLevel) {
//       console.warn(`Educator ${educatorId} is attempting to record attendance for AcademicLevel ${academicLevelId} but is not explicitly assigned.`);
//       // Depending on your policy, you might return a 403 here.
//       // For now, it proceeds with a warning.
//     }

//     const transaction = await prisma.$transaction(
//       // Explicitly type recordData in the map callback
//       Object.entries(attendanceRecords).map(([studentId, recordData]: [string, StudentAttendanceRecordPayload]) =>
//         prisma.attendanceRecord.upsert({
//           where: {
//             // Updated unique constraint to match @@unique([studentId, date, classScheduleId])
//             studentId_date_classScheduleId: {
//               studentId: studentId,
//               date: attendanceDate,
//               // Corrected Type assertion: Use 'null as any' to bypass strict TS checks for nullable field in unique key.
//               // 'undefined' is not a valid value for a column in a unique index, 'null' is.
//               classScheduleId: null as any,
//             },
//           },
//           update: {
//             status: recordData.status,
//             reason: recordData.reason, // Update reason if provided
//             updatedAt: new Date(),
//             recordedById: educator.id, // Use educator.id from the found educator
//             academicLevelId: academicLevelId, // Ensure academicLevelId is consistent
//           },
//           create: {
//             studentId: studentId,
//             date: attendanceDate,
//             status: recordData.status,
//             // Corrected Type assertion: Use 'null as any'.
//             classScheduleId: null as any,
//             academicLevelId: academicLevelId, // Associate with the academic level
//             recordedById: educator.id, // Use educator.id from the found educator
//             reason: recordData.reason,      // Create reason if provided
//           },
//         })
//       )
//     );

//     return NextResponse.json({ message: "Attendance saved successfully!", recordsUpdated: transaction.length }, { status: 200 });
//   } catch (error: any) {
//     console.error("Error saving attendance:", error);
//     // Ensure error is an object before accessing properties or passing to NextResponse
//     return NextResponse.json({ message: "Failed to save attendance", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
//   }
// }
