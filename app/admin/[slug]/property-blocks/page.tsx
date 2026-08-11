import { cookies } from "next/headers";
import PropertyBlocksPage from "./PropertyBlocksPage";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelRoomsPage({ params }: PageProps) {

  const { slug } = await params;

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
  let marketPlace = [];

  try {
    
    // Fetching both blocks and rooms to feed the client
    const [roomsRes, blocksRes, marketPlaceRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/property/rooms?companyId=${companyId}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/property/blocks?companyId=${companyId}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/my-market-place?companyId=${companyId}`, { headers: { cookie: cookieHeader } }),
    ]);

    rooms = (await roomsRes.json()).data || [];
    blocks = (await blocksRes.json()).data || [];
    marketPlace = (await marketPlaceRes.json()).data.results || [];

  } catch (err) {
    // console.error("[HostelRoomsPage] Failed to load rooms", err);
  }

  return (
    <PropertyBlocksPage
      initialBlocks={blocks}
      companyId={companyId}
      initialMarketPlace={marketPlace}
    />
  );
}