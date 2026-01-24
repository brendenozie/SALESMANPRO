import { cookies } from "next/headers";
import FuelLogsClient from "./FuelLogsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function FuelLogsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialData = { logs: [], vehicles: [] };
  
  try {
    const [logRes, vehRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/transport/fuel?companyId=${schoolId}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/transport/vehicles?companyId=${schoolId}`, { headers: { cookie: cookieHeader } })
    ]);

    if (logRes.ok && vehRes.ok) {
      initialData.logs = (await logRes.json()).data;
      initialData.vehicles = (await vehRes.json()).data;
    }
  } catch (err) {
    console.error("Failed to load fuel data", err);
  }

  return <FuelLogsClient initialData={initialData} schoolId={schoolId} />;
}