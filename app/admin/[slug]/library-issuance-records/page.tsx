// app/admin/library/issuance/page.tsx
import { cookies } from "next/headers";
import IssuanceRecordsClient from "./IssuanceRecordsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LibraryIssuancePage({ params }: PageProps) {
 
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

  // Fetch Issuance, Books, and Members simultaneously
  const fetcher = async (path: string) => {
    const res = await fetch(`${apiBaseUrl}${path}?companyId=${companyId}`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 0 }, // Transactions need fresh data
    });
    return res.ok ? (await res.json()).data : [];
  };

  const [initialRecords, books, members] = await Promise.all([
    fetcher("/admin/library/issuance"),
    fetcher("/admin/library/books"),
    fetcher("/admin/library/members"),
  ]);

  // console.log(initialRecords);

  return (
    <IssuanceRecordsClient 
      initialRecords={initialRecords} 
      books={books} 
      members={members} 
      schoolId={companyId} 
    />
  );
}