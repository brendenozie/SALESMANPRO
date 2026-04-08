import { cookies } from "next/headers";
import HostelRoomsClient from "./HostelRoomsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelRoomsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let rooms = [];  
  let blocks = [];

  try {
    
    // Fetching both blocks and rooms to feed the client
    const [blocksRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/hostel/blocks?companyId=${schoolId}`, { headers: { cookie: cookieHeader } })
    ]);

    blocks = (await blocksRes.json()).data || [];

  } catch (err) {
    // console.error("[HostelRoomsPage] Failed to load rooms", err);
  }

  return (
    <HostelRoomsClient
      initiablocks={blocks}
      schoolId={schoolId}
    />
  );
}