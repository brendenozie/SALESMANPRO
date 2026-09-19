import { cookies } from "next/headers";
import HostelRoomsClient from "./HostelRoomsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelRoomsPage({ params }: PageProps) {
  
  const { slug }  = await params;

  const cookieHeader = (await cookies()).toString();
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || (session?.user as any)?.id || '';
  
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
    const [blocksRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/hostel/blocks?companyId=${companyId}`, { headers: { cookie: cookieHeader } })
    ]);

    blocks = (await blocksRes.json()).data || [];

  } catch (err) {
    // console.error("[HostelRoomsPage] Failed to load rooms", err);
  }

  return (
    <HostelRoomsClient
      initialBlocks={blocks}
      schoolId={companyId}
    />
  );
}