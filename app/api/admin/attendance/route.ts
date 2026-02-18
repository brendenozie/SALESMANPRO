import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID is required", 400);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // OPTIMIZATION: Run queries in parallel to reduce waterfall latency
  
    const cacheKey = `admin:attendance:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [logs, totalUsers] = await Promise.all([
    prisma.staffAttendanceRecord.findMany({
      where: { date: today },//companyId, 
      select: {
        id: true,
        checkInTime: true,
        checkOutTime: true,
        status: true,
        user: { select: { name: true, image: true } },
      },
      orderBy: { checkInTime: "desc" },
    }),
    prisma.user.count({ where: { companyId, role: "STAFF" } }), // Ensure we only count relevant users
  ]);

  try {
    if (logs) {
      await cacheSet(cacheKey, logs, 60);
    }
  } catch (e) {}

  // OPTIMIZATION: Calculate stats in a single pass instead of multiple .filter() calls
  let presentCount = 0;
  let lateCount = 0;

  for (const log of logs) {
    if (log.checkInTime) presentCount++;
    if (log.status === "LATE") lateCount++;
  }

  const stats = {
    total: totalUsers,
    present: presentCount,
    late: lateCount,
    absent: Math.max(0, totalUsers - presentCount),
  };

  // Add HTTP Caching for dashboard data (30 seconds)
  const response = NextResponse.json({ logs, stats });
  response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

  return response;
}
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { startOfDay, endOfDay } from "date-fns";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const companyId = searchParams.get("companyId");
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const logs = await prisma.staffAttendanceRecord.findMany({
//     where: {
//       companyId: companyId as string,
//       date: today,
//     },
//     include: {
//       user: { select: { name: true, image: true } },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   // Calculate Stats for KPIs
//   const stats = {
//     total: await prisma.user.count({ where: { companyId: companyId as string } }),
//     present: logs.filter(l => l.checkInTime).length,
//     late: logs.filter(l => l.status === "LATE").length,
//     absent: 0, // Logic: total - present
//   };
//   stats.absent = stats.total - stats.present;

//   return NextResponse.json({ logs, stats });
// }