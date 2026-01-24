import { cookies } from "next/headers";
import MaintenanceRecordsClient from "./MaintenanceRecordsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function MaintenancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialData = { records: [], vehicles: [] };
  
  try {
    const [maintRes, vehRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/transport/maintenance?companyId=${schoolId}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/transport/vehicles?companyId=${schoolId}`, { headers: { cookie: cookieHeader } })
    ]);

    if (maintRes.ok && vehRes.ok) {
      initialData.records = (await maintRes.json()).data;
      initialData.vehicles = (await vehRes.json()).data;
    }
  } catch (err) {
    console.error("Failed to load maintenance data", err);
  }

  return <MaintenanceRecordsClient initialData={initialData} schoolId={schoolId} />;
}