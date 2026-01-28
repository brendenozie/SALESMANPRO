import { cookies } from "next/headers";
import HostelBlocksPage from "./HostelBlocksPage";

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
    const [roomsRes, blocksRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/hostel/rooms?companyId=${schoolId}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/hostel/blocks?companyId=${schoolId}`, { headers: { cookie: cookieHeader } })
    ]);

    rooms = (await roomsRes.json()).data || [];
    blocks = (await blocksRes.json()).data || [];

  } catch (err) {
    console.error("[HostelRoomsPage] Failed to load rooms", err);
  }

  return (
    <HostelBlocksPage
      // initialRooms={rooms}
      initialBlocks={blocks}
      schoolId={schoolId}
    />
  );
}