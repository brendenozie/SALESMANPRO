import { cookies } from "next/headers";
import MaintenanceClient from "./MaintenanceClient";

export default async function LibraryMaintenancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  let initialBooks = [];
  try {
    const res = await fetch(`${apiBaseUrl}/admin/library/maintenance?companyId=${schoolId}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store'
    });
    if (res.ok) initialBooks = (await res.json()).data;
  } catch (err) {
    // console.error("Maintenance fetch error", err);
  }

  return <MaintenanceClient schoolId={schoolId} initialBooks={initialBooks} />;
}