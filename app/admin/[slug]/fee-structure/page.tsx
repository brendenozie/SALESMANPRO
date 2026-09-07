import { cookies } from "next/headers";
import FeeStructureClient from "./FeeStructureClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeeStructurePage({ params }: PageProps) {
  const { slug } = await params;
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

  let initialStructures = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/fee-structure?companyId=${companyId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialStructures = (await res.json()).data;
    }
  } catch (err) {
    // console.error("[FeeStructurePage] Failed to load fee structures", err);
  }

  return (
    <FeeStructureClient
      initialStructures={initialStructures}
      schoolId={companyId}
    />
  );
}
