import { cookies } from "next/headers";
import HostelRoomsClient from "./HostelRoomsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelRoomsPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  let properties = [];  
  let blocks = [];

  try {
    
    // Fetching both blocks and rooms to feed the client
    const [blocksRes, propertyRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/property/blocks?companyId=${companyId}`, { headers: { cookie: cookieHeader } }),      
      fetch(`${apiBaseUrl}/admin/my-market-place?companyId=${companyId}`, { headers: { cookie: cookieHeader } }),
    ]);

    blocks = (await blocksRes.json()).data || [];
    properties = (await propertyRes.json()).data.results || [];
  } catch (err) {
    // console.error("[HostelRoomsPage] Failed to load rooms", err);
  }

  return (
    <HostelRoomsClient
      initiablocks={blocks}
      initialProperties={properties}
      companyId={companyId}
    />
  );
}