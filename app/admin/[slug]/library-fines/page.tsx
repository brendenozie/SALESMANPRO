import { cookies } from "next/headers";
import LibraryFinesClient from "./LibraryFinesClient";
import { differenceInDays } from "date-fns";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function LibraryFinesPage({ params }: { params: Promise<{ slug: string }> }) {
  
  const { slug }  = await params;
  
  const cookieHeader = (await cookies()).toString();
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  let initialFines = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/library/fines?companyId=${companyId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );

    if (res.ok) {
      const rawData = (await res.json()).data;
      
      // Normalize Prisma data for the Client Component
      initialFines = rawData.map((fine: any) => {
        const issuance = fine.issuance;
        const member = issuance.libraryMember;
        
        // Logic to get the display name
        const memberName = member.student 
          ? `${member.student.firstName} ${member.student.lastName}`
          : member.educator?.user?.name || "Library Member";

        // Logic to calculate overdue days
        const end = issuance.returnDate ? new Date(issuance.returnDate) : new Date();
        const days = Math.max(0, differenceInDays(end, new Date(issuance.dueDate)));

        return {
          id: fine.id,
          member: memberName,
          book: issuance.book.title,
          daysOverdue: days,
          amount: fine.amount,
          status: fine.status === 'PAID' ? 'Paid' : 'Unpaid'
        };
      });
    }
  } catch (err) {
    console.error("[LibraryFinesPage] Load Error:", err);
  }

  return (
    <LibraryFinesClient
      initialFines={initialFines}
      schoolId={companyId}
    />
  );
}