import { cookies } from "next/headers";
import PropertyBlocksPage from "./PropertyBlocksPage";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelRoomsPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  const cookieHeader = (await cookies()).toString();

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