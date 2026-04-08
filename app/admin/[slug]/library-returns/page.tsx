// app/admin/library/returns/page.tsx
import { cookies } from "next/headers";
import LibraryReturnsPageClient from "./LibraryReturnsPageClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function LibraryReturnsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialHistory = [];
  try {
    // Fetch returns from the last 24 hours
    const res = await fetch(
      `${apiBaseUrl}/admin/library/issuance/return-scan?companyId=${schoolId}&history=true`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) initialHistory = (await res.json()).data;
  } catch (err) {
    // console.error("Failed to load return history", err);
  }

  return <LibraryReturnsPageClient schoolId={schoolId} initialHistory={initialHistory} />;
}