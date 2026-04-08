// app/admin/[slug]/residents/page.tsx
import { cookies } from "next/headers";
import ResidentsPageClient from './ResidentsPageClient'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: { slug: string };
}

export default async function ResidentsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialResidents = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/hostel/residents?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (res.ok) {
      initialResidents = (await res.json()).data;
      // console.log("[ResidentsPage] Fetched residents:", initialResidents);
    }
  } catch (err) {
    // console.error("[ResidentsPage] Error:", err);
  }

  return (
    <ResidentsPageClient
      initialResidents={initialResidents}
      schoolId={schoolId}
    />
  );
}