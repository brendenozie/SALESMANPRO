import { cookies } from "next/headers";
import TransportDashboard from "./TransportDashboard";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TransportDashboardPage({ params }: PageProps) {
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

  let initialData = null;
  
  try {
    // Fetch aggregated dashboard data including metrics, alerts, and efficiency
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/dashboard?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (res.ok) {
      initialData = (await res.json()).data;
    }
  } catch (err) {
    console.error("[TransportDashboardPage] Failed to load dashboard data", err);
  }

  return (
    <TransportDashboard
      initialData={initialData}
      schoolId={companyId}
    />
  );
}