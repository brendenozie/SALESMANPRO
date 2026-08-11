import { cookies } from "next/headers";
import FuelLogsClient from "./FuelLogsClient";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function FuelLogsPage({ params }: { params: Promise<{ slug: string }> }) {
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

  let initialData = { logs: [], vehicles: [] };
  
  try {
    const [logRes, vehRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/transport/fuel?companyId=${encodeURIComponent(companyId)}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/transport/vehicles?companyId=${encodeURIComponent(companyId)}`, { headers: { cookie: cookieHeader } })
    ]);

    if (logRes.ok && vehRes.ok) {
      initialData.logs = (await logRes.json()).data;
      initialData.vehicles = (await vehRes.json()).data;
    }
  } catch (err) {
    console.error("Failed to load fuel data", err);
  }

  return <FuelLogsClient initialData={initialData} schoolId={companyId} />;
}