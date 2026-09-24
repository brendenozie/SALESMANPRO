import LeaveManagementClient from "./LeaveManagementClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeaveManagementSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialRequests: any[] = [];  
  let initialStaff: any[] = [];

  try {
    const [rawRequests, rawStaff] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: { companyId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          backupStaff: { select: { user: { select: { id: true, name: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.staffProfile.findMany({
        where: { companyId },
        include: { user: { select: { id: true, name: true } } }
      })
    ]);

    initialRequests = rawRequests.map(r => ({
      ...r,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    initialStaff = rawStaff.map(s => ({
      id: s.id,
      userId: s.userId,
      name: s.user?.name || "Staff Member"
    }));
  } catch (err) {
    console.error("[LeaveManagementSSRPage] Failed to query leave requests", err);
  }

  return (
    <LeaveManagementClient
      initialRequests={initialRequests}
      initialStaff={initialStaff}
      companyId={companyId}
    />
  );
}