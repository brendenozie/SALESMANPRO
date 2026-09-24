import HostelStaffClient from "./HostelStaffClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelStaffSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialStaff: any[] = [];  
  try {
    const rawStaff = await prisma.hostelStaff.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            image: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    initialStaff = rawStaff.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[HostelStaffSSRPage] Failed to query hostel staff", err);
  }

  return (
    <HostelStaffClient
      initialStaff={initialStaff}
      schoolId={companyId}
    />
  );
}