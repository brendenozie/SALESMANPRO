import { cookies } from "next/headers";
import MaintenancePageClient from "./MaintenancePageClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// app/admin/hostel/maintenance/page.tsx
export default async function MaintenancePage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialTickets = [];
  let rooms = [];

  try {
    // Parallel fetch for better performance
    const [tktRes, roomRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/hostel/maintenance?companyId=${schoolId}`, { 
        headers: { cookie: cookieHeader }, cache: 'no-store' 
      }),
      fetch(`${apiBaseUrl}/admin/hostel/rooms?companyId=${schoolId}`, { 
        headers: { cookie: cookieHeader }, cache: 'no-store' 
      })
    ]);

    if (tktRes.ok) initialTickets = (await tktRes.json()).data;
    if (roomRes.ok) rooms = (await roomRes.json()).data;
  } catch (err) { console.error(err); }

  return (
    <MaintenancePageClient 
      initialTickets={initialTickets} 
      rooms={rooms} // Passing rooms to the client
      schoolId={schoolId} 
    />
  );
}