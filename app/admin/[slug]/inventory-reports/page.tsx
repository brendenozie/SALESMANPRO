import { cookies } from "next/headers";
import InventoryReportsClient from "./InventoryReportsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryDashboardPage({ params }: PageProps) {

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

  let initialMembers = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/inventory-dashboard/data?companyId=${companyId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialMembers = (await res.json()).data;
    }
  } catch (err) {
    // console.error("[LibraryMembersPage] Failed to load members", err);
  }

  return (
    <InventoryReportsClient
      // initialMembers={initialMembers}
      // schoolId={companyId}
    />
  );
}