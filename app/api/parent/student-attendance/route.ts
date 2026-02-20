import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet } from "@/lib/cache";

const getHandler = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) return formatResponse(false, null, "Missing studentId", 400);

  const cacheKey = `parent:studentAttendance:${studentId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const attendance = await prisma.attendanceRecord.findMany({
      where: { studentId: studentId },
      orderBy: { date: "desc" },
      take: 30, // Last 30 school days
      select: {
        date: true,
        status: true,
        // remarks: true,
      }
    });

    const stats = {
      present: attendance.filter(a => a.status === "PRESENT").length,
      absent: attendance.filter(a => a.status === "ABSENT").length,
      late: 0,//attendance.filter(a => a.status === "LATE").length,
    };

    try { await cacheSet(cacheKey, { stats, history: attendance }, 60); } catch (e) {}
    return formatResponse(true, { stats, history: attendance });
  } catch (error) {
    return formatResponse(false, null, "Internal Server Error", 500);
  }
};

export const GET = withApiHandler(getHandler);