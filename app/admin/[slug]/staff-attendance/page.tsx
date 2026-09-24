import StaffAttendanceClient from "./StaffAttendanceClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaffAttendanceSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let logs: any[] = [];
  let stats = { present: 0, late: 0, absent: 0, total: 0 };
  let staffList: any[] = [];

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [rawLogs, totalStaff, rawStaff] = await Promise.all([
      prisma.staffAttendanceRecord.findMany({
        where: { date: today, companyId },
        include: {
          user: { select: { name: true, image: true, email: true } },
        },
        orderBy: { checkInTime: "desc" },
      }),
      prisma.user.count({ where: { companyId, role: "STAFF" } }),
      prisma.staffProfile.findMany({
        where: { companyId },
        include: { user: { select: { id: true, name: true } } },
      })
    ]);

    let presentCount = 0;
    let lateCount = 0;
    logs = rawLogs.map(l => {
      if (l.checkInTime) presentCount++;
      if (l.status === "LATE") lateCount++;
      return {
        id: l.id,
        user: l.user,
        method: l.method,
        checkInTime: l.checkInTime ? l.checkInTime.toISOString() : undefined,
        checkOutTime: l.checkOutTime ? l.checkOutTime.toISOString() : undefined,
        status: l.status,
      };
    });

    stats = {
      total: totalStaff,
      present: presentCount,
      late: lateCount,
      absent: Math.max(0, totalStaff - presentCount),
    };

    staffList = rawStaff.map(s => ({
      id: s.userId || s.id,
      name: s.user?.name || "Staff Member"
    }));
  } catch (err) {
    console.error("[StaffAttendanceSSRPage] Failed to query staff attendance", err);
  }

  return (
    <StaffAttendanceClient
      initialData={{ logs, stats }}
      initialStaff={staffList}
      schoolId={companyId}
    />
  );
}