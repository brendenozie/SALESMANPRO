import LibraryFinesClient from "./LibraryFinesClient";
import { differenceInDays } from "date-fns";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryFinesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const rawData = await prisma.libraryFine.findMany({
    where: { issuance: { companyId } },
    include: {
      issuance: {
        include: {
          book: true,
          libraryMember: {
            include: {
              student: true,
              educator: { include: { user: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Normalize Prisma data for the Client Component
  const initialFines = rawData.map((fine: any) => {
    const issuance = fine.issuance;
    const member = issuance?.libraryMember;
    
    // Logic to get the display name
    const memberName = member?.student 
      ? `${member.student.firstName} ${member.student.lastName}`
      : member?.educator?.user?.name || "Library Member";

    // Logic to calculate overdue days
    const end = issuance?.returnDate ? new Date(issuance.returnDate) : new Date();
    const days = issuance?.dueDate ? Math.max(0, differenceInDays(end, new Date(issuance.dueDate))) : 0;

    return {
      id: fine.id,
      member: memberName,
      memberId: member?.id,
      book: issuance?.book?.title || "Unknown Book",
      daysOverdue: days,
      amount: fine.amount,
      status: fine.status === 'PAID' ? 'Paid' : 'Unpaid'
    };
  });

  return (
    <LibraryFinesClient 
      initialFines={JSON.parse(JSON.stringify(initialFines))} 
      schoolId={companyId} 
    />
  );
}