import StaffMembersClient from "./StaffMembersClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaffMembersSSRPage({ params }: PageProps) {
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
    const rawStaff = await prisma.staffProfile.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, profilePicture: true, image: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    initialStaff = rawStaff.map((staff) => ({
      id: staff.id,
      userId: staff.userId,
      name: staff.user?.name || "Staff Member",
      email: staff.user?.email || "N/A",
      image: staff.user?.image || staff.user?.profilePicture || null,
      isActive: staff.employmentStatus !== "TERMINATED",
      staffProfile: {
        jobTitle: staff.jobTitle || "Staff",
        department: staff.department || "General",
      }
    }));
  } catch (err) {
    console.error("[StaffMembersSSRPage] Failed to query staff members", err);
  }

  return (
    <StaffMembersClient
      initialStaff={initialStaff}
      companyId={companyId}
    />
  );
}