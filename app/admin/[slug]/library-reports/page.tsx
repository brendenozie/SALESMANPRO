import { cookies } from "next/headers";
import LibraryReportingClient from "./LibraryReportingClient";

export default async function LibraryReportsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let stats = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/library/reports?companyId=${schoolId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) {
      const result = await res.json();
      stats = result.data;
    }
  } catch (err) {
    console.error("Failed to load library analytics", err);
  }

  return <LibraryReportingClient initialStats={stats} schoolId={schoolId} />;
}