// app/admin/roles/[slug]/page.tsx
import { cookies } from "next/headers";
import RolesManagementClient from "./RolesManagementClient";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function RolesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialData = { roleCounts: [], profiles: [] };
  
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

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/roles?companyId=${companyId}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (res.ok) {
      initialData = (await res.json()).data;
      // console.log("Fetched roles data:", initialData);
    }
  } catch (err) {
    console.error("Failed to load roles", err);
  }

  return (
    <RolesManagementClient
      initialData={initialData}
      companyId={companyId}
    />
  );
}