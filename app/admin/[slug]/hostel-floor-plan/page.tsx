import { cookies } from "next/headers";
import HostelRoomsClient from "./HostelRoomsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelRoomsPage({ params }: PageProps) {

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

  let rooms = [];  
  let blocks = [];

  try {
    
    // Fetching both blocks and rooms to feed the client
    const [roomsRes, blocksRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/hostel/rooms?companyId=${companyId}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/hostel/blocks?companyId=${companyId}`, { headers: { cookie: cookieHeader } })
    ]);

    rooms = (await roomsRes.json()).data || [];
    blocks = (await blocksRes.json()).data || [];

  } catch (err) {
    // console.error("[HostelRoomsPage] Failed to load rooms", err);
  }

  return (
    <HostelRoomsClient
      initialRooms={rooms}
      blocks={blocks}
      schoolId={companyId}
    />
  );
}