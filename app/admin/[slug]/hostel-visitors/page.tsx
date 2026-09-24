import VisitorsPageClient from "./VisitorsPageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VisitorsSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialLogs: any[] = [];  
  try {
    const rawVisitors = await prisma.hostelVisitor.findMany({
      where: { companyId },
      include: { 
        student: { select: { firstName: true, lastName: true } },  
        educator: { include: { user: { select: { name: true } } } } 
      },
      orderBy: { checkIn: 'desc' }
    });

    initialLogs = rawVisitors.map(v => ({
      ...v,
      checkIn: v.checkIn.toISOString(),
      checkOut: v.checkOut ? v.checkOut.toISOString() : null,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));
  } catch (err) { 
    console.error("[VisitorsSSRPage] Failed to query visitors", err);
  }

  return (
    <VisitorsPageClient 
      initialLogs={initialLogs} 
      schoolId={companyId} 
    />
  );
}