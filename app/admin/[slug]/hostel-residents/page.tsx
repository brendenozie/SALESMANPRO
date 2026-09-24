import ResidentsPageClient from './ResidentsPageClient';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelResidentsSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let residents: any[] = [];
  try {
    const rawAllocations = await prisma.hostelAllocation.findMany({
      where: {
        status: "ACTIVE",
        room: { block: { companyId } }
      },
      include: {
        hostelMember: {
          include: {
            student: {
              include: { user: { select: { name: true } } }
            },
            educator: {
              include: { user: { select: { name: true } } }
            },
          }
        },
        room: true,
      },
      orderBy: { createdAt: "desc" }
    });

    residents = rawAllocations.map((res) => {
      const member = res.hostelMember;
      if (!member) return null;

      return {
        id: member.id,
        allocationId: res.id,
        displayId: member.memberId || member.id.slice(-7).toUpperCase(),
        studentId: member.student?.admissionNumber || member.memberId || member.id.slice(-7).toUpperCase(),
        name: member.student
          ? `${member.student.firstName} ${member.student.lastName}`
          : member.educator?.user?.name || "Resident",
        room: res.room?.roomNumber || "Unassigned",
        phone: member.student?.phone || member.educator?.phone || "No Contact",
        status: "In-House"
      };
    }).filter(Boolean);
  } catch (err) {
    console.error("[HostelResidentsSSRPage] Failed to query residents", err);
  }

  return (
    <ResidentsPageClient 
      initialResidents={residents}
      schoolId={companyId} 
    />
  );
}