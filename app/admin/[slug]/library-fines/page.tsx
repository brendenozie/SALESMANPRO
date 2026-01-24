import { cookies } from "next/headers";
import LibraryFinesClient from "./LibraryFinesClient";
import { differenceInDays } from "date-fns";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function LibraryFinesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialFines = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/library/fines?companyId=${schoolId}`,
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
      schoolId={schoolId}
    />
  );
}