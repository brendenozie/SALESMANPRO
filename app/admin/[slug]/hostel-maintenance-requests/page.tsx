import { cookies } from "next/headers";
import MaintenancePageClient from "./MaintenancePageClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MaintenancePage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialTickets = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/hostel/maintenance?companyId=${schoolId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) initialTickets = (await res.json()).data;
  } catch (err) { console.error(err); }

  return (
    <MaintenancePageClient 
      initialTickets={initialTickets} 
      schoolId={schoolId} 
    />
  );
}