import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet } from "@/lib/cache";

const getHandler = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const parentUserId = searchParams.get("userId"); // The ID of the Parent's User record

  if (!parentUserId) {
    return formatResponse(false, null, "Missing userId", 400);
  }

    const cacheKey = `parent:children:${parentUserId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    // 1. Fetch Parent and all their Children with necessary relations
    const parentData = await prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: {
        children: {
          include: {
            AttendanceRecord: {
              select: { status: true }
            },
            Grade: {
              select: { gradeValue: true }
            },
            StudentAcademicLevel: {
              orderBy: { assignedAt: "desc" },
              take: 1,
              include: {
                academicLevel: { select: { name: true } }
              }
            },
            Company: { select: { name: true } },
            enrolledCourses: {
              include: {
                course: {
                  include: {
                    assignments: {
                      where: { status: "Published" }
                    }
                  }
                }
              }
            },
            assignmentSubmission: {
              select: { assignmentId: true }
            }
          }
        }
      }
    });

    if (!parentData) {
      return formatResponse(false, null, "Parent profile not found", 404);
    }

    // 2. Map and Calculate Statistics for each child
    const childrenProfiles = parentData.children.map((student) => {
      // A. Calculate Attendance Percentage
      const totalAttendance = student.AttendanceRecord.length;
      const presentCount = student.AttendanceRecord.filter(r => r.status === "PRESENT").length;
      const attendanceRate = totalAttendance > 0 
        ? Math.round((presentCount / totalAttendance) * 100) 
        : 100; // Default to 100 if no records exist yet

      // B. Calculate Average Grade (Numeric to Letter)
      const gradeValues = student.Grade.map(g => g.gradeValue).filter((v) => typeof v === "number" && v !== null) as number[];
      const avgNumeric = gradeValues.length > 0 
        ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length 
        : null;

      const getLetterGrade = (num: number | null) => {
        if (num === null) return "N/A";
        if (num >= 90) return "A";
        if (num >= 80) return "B";
        if (num >= 70) return "C";
        if (num >= 60) return "D";
        return "F";
      };

      // C. Calculate Pending Assignments
      // We look at all assignments in enrolled courses and subtract the ones already submitted
      const allAssignmentIds = student.enrolledCourses.flatMap(ec => 
        ec.course.assignments.map(a => a.id)
      );
      const submittedIds = new Set(student.assignmentSubmission.map(s => s.assignmentId));
      const pendingCount = allAssignmentIds.filter(id => !submittedIds.has(id)).length;

      // D. Calculate Age
      let age = 0;
      if (student.dateOfBirth) {
        const birth = new Date(student.dateOfBirth);
        age = new Date().getFullYear() - birth.getFullYear();
      }

      return {
        id: student.id,
        userId: student.userId, // Useful for the nested "view details" link
        name: `${student.firstName} ${student.lastName}`,
        age: age,
        grade: student.StudentAcademicLevel[0]?.academicLevel?.name || "Unassigned",
        schoolName: student.Company?.name || "Main Academy",
        profileImageUrl: student.profilePicture || null,
        attendance: attendanceRate,
        avgGrade: getLetterGrade(avgNumeric),
        pendingAssignments: pendingCount,
        lastActivity: student.updatedAt?.toISOString() || new Date().toISOString()
      };
    });

    // 3. Aggregate Global Family Stats for the top cards
    const familyStats = {
      totalChildren: childrenProfiles.length,
      avgFamilyAttendance: childrenProfiles.length > 0 
        ? Math.round(childrenProfiles.reduce((acc, curr) => acc + curr.attendance, 0) / childrenProfiles.length)
        : 0,
      totalFamilyPending: childrenProfiles.reduce((acc, curr) => acc + curr.pendingAssignments, 0)
    };

    try { await cacheSet(cacheKey, { stats: familyStats, children: childrenProfiles }, 60); }
    catch (e) {}
    
    return formatResponse(true, {
      stats: familyStats,
      children: childrenProfiles
    });

  } catch (error) {
    console.error("My Children API Error:", error);
    return formatResponse(false, null, "Internal Server Error", 500);
  }
};

export const GET = withApiHandler(getHandler);