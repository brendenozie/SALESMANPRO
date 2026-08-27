// app/admin/[slug]/residents/page.tsx
import { cookies } from "next/headers";
import ResidentsPageClient from './ResidentsPageClient'
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: { slug: string };
}

export default async function ResidentsPage({ params }: PageProps) {
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

  let initialResidents = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/property/residents?companyId=${companyId}`,
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
      schoolId={companyId}
    />
  );
}