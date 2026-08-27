import { cookies } from "next/headers";
import MaintenanceRecordsClient from "./MaintenanceRecordsClient";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function MaintenancePage({ params }: { params: Promise<{ slug: string }> }) {
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

  let initialData = { records: [], vehicles: [] };
  
  try {
    const [maintRes, vehRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/transport/maintenance?companyId=${encodeURIComponent(companyId)}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/transport/vehicles?companyId=${encodeURIComponent(companyId)}`, { headers: { cookie: cookieHeader } })
    ]);

    if (maintRes.ok && vehRes.ok) {
      initialData.records = (await maintRes.json()).data;
      initialData.vehicles = (await vehRes.json()).data;
    }
  } catch (err) {
    console.error("Failed to load maintenance data", err);
  }

  return <MaintenanceRecordsClient initialData={initialData} schoolId={companyId} />;
}