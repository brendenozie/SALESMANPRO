import { cookies } from "next/headers";
import RoomAssignmentsClient from "./RoomAssignmentsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}


export default async function RoomAssignmentsPage({ params }: PageProps) {
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

  let data = { unassigned: [], rooms: [] };
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/property/room-assignments?companyId=${companyId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) data = (await res.json()).data;
    console.log(data);
  } catch (err) { console.error(err); }

  return (
    <RoomAssignmentsClient 
      initialUnassigned={data.unassigned} 
      initialRooms={data.rooms} 
      schoolId={companyId} 
    />
  );
}