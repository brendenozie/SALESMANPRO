// app/admin/library/issuance/page.tsx
import { cookies } from "next/headers";
import IssuanceRecordsClient from "./IssuanceRecordsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LibraryIssuancePage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  // Fetch Issuance, Books, and Members simultaneously
  const fetcher = async (path: string) => {
    const res = await fetch(`${apiBaseUrl}${path}?companyId=${schoolId}`, {
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

  return (
    <IssuanceRecordsClient 
      initialRecords={initialRecords} 
      books={books} 
      members={members} 
      schoolId={schoolId} 
    />
  );
}