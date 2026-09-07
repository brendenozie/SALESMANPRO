import { cookies } from "next/headers";
import MaintenancePageClient from "./MaintenancePageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// app/admin/hostel/maintenance/page.tsx
export default async function MaintenancePage({ params }: PageProps) {
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

  let initialTickets = [];
  let rooms = [];

  try {
    // Parallel fetch for better performance
    const [tktRes, roomRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/hostel/maintenance?companyId=${companyId}`, { 
        headers: { cookie: cookieHeader }, cache: 'no-store' 
      }),
      fetch(`${apiBaseUrl}/admin/hostel/rooms?companyId=${companyId}`, { 
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
      schoolId={companyId} 
    />
  );
}