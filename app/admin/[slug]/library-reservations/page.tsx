import { cookies } from "next/headers";
import LibraryReservationsClient from "./LibraryReservationsClient";
import { format } from "date-fns";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function LibraryReservationsPage({ params }: { params: Promise<{ slug: string }> }) {
  
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

  let initialReservations = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/library/reservations?companyId=${companyId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );

    if (res.ok) {
      const rawData = (await res.json()).data;
      
      // Group by bookId to calculate queue position
      const bookQueues: Record<string, string[]> = {};
      
      initialReservations = rawData.map((res: any) => {
        if (!bookQueues[res.bookId]) bookQueues[res.bookId] = [];
        bookQueues[res.bookId].push(res.id);

        const member = res.libraryMember;
        const memberName = member?.student 
          ? `${member.student.firstName} ${member.student.lastName}`
          : member?.educator?.user?.name || "Unknown Member";

        // Logic: If the book status is AVAILABLE or RESERVED (but not checked out), it's "Ready"
        const isReady = res.book.status === "AVAILABLE" || res.book.status === "RESERVED";

        return {
          id: res.id,
          book: res.book.title,
          member: memberName,
          memberEmail: member?.student?.email || member?.educator?.user?.email || "",
          requestDate: format(new Date(res.createdAt), "MMM dd, yyyy"),
          status: isReady ? 'Ready' : 'Pending',
          position: bookQueues[res.bookId].indexOf(res.id) + 1,
          expectedArrival: res.book.status === "ISSUED" ? "Within 14 days" : "Check Shelves"
        };
      });
    }
  } catch (err) {
    // console.error("[LibraryReservationsPage] Fetch error:", err);
  }

  return (
    <LibraryReservationsClient
      initialReservations={initialReservations}
      schoolId={companyId}
    />
  );
}