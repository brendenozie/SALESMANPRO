import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getHandler = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const parentUserId = searchParams.get("userId");

  if (!parentUserId) return formatResponse(false, null, "Missing userId", 400);

  try {
    // 1. Find Parent and their children with their active Classroom
    
    const cacheKey = `admin:parent:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const parent = await prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: {
        children: {
          include: {
            StudentAcademicLevel: {
              orderBy: { assignedAt: "desc" },
              take: 1,
              include: {
                academicLevel: { select: { id: true, name: true } },
                classRoom: { 
                    select: { 
                        id: true, 
                        name: true,
                        // Link Classroom to Courses via the CourseEducatorAssignment junction
                        courseEducatorAssignments: {
                            include: {
                                course: {
                                    include: {
                                        assignments: { 
                                            where: { status: "Published", dueDate: { gte: new Date() } } 
                                        },
                                        classSchedules:     {
                                            // We filter by classroomId to get the specific schedule for this child
                                            // where: { classroomId: ... } is handled in the map below
                                            include: { 
                                                educator: { include: { user: { select: { name: true } } } },
                                                course: { select: { id: true, title: true } }
                                            }
                                        },
                                    },
                                }
                            }
                        }
                    } 
                }
              }
            },
            AttendanceRecord: { take: 1, orderBy: { date: 'desc' } },
            Grade: { take: 1, orderBy: { createdAt: 'desc' } },
          }
        }
      }
    });

  try {
    if (parent) {
      await cacheSet(cacheKey, parent, 60);
    }
  } catch (e) {}

    if (!parent) return formatResponse(false, null, "Parent not found", 404);

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    
    const childrenSummaries = parent.children.map(child => {
      const activeLevel = child.StudentAcademicLevel[0];
      const classroom = activeLevel?.classRoom;
      
      // Extract courses assigned to this specific classroom
      const classroomCourses = classroom?.courseEducatorAssignments.map(cea => cea.course) || [];

      // Logic to find current active class based on the student's classroom schedules
      const currentClass = classroomCourses.flatMap(c => c.classSchedules)
        .filter(s => s.classroomId === classroom?.id && s.dayOfWeek === currentDay)
        .find(s => {
          const start = new Date(s.startTime);
          const end = new Date(s.endTime);
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const startTime = start.getHours() * 60 + start.getMinutes();
          const endTime = end.getHours() * 60 + end.getMinutes();
          return currentTime >= startTime && currentTime <= endTime;
        });

      return {
        id: child.id,
        name: `${child.firstName} ${child.lastName}`,
        avatar: child.profilePicture,
        gradeLevel: activeLevel?.academicLevel?.name || "N/A",
        roomName: classroom?.name || "General",
        currentStatus: currentClass 
          ? `In ${currentClass.course?.title || 'Unknown Course'} with ${currentClass.educator?.user?.name || 'Teacher'}` 
          : "No active class",
        totalPendingTasks: classroomCourses.reduce((acc, c) => acc + c.assignments.length, 0),
        recentGrade: child.Grade[0]?.gradeValue || null,
        lastAttendance: child.AttendanceRecord[0]?.status || "No data"
      };
    });

    const stats = {
      totalChildren: childrenSummaries.length,
      familyPendingTasks: childrenSummaries.reduce((acc, c) => acc + c.totalPendingTasks, 0),
      attendanceAlerts: childrenSummaries.filter(c => c.lastAttendance === "ABSENT").length
    };

    return formatResponse(true, { stats, children: childrenSummaries });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return formatResponse(false, null, "Aggregation failed", 500);
  }
};

export const GET = withApiHandler(getHandler);