import { cookies } from "next/headers";
import HostelRoomsClient from "./HostelRoomsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelRoomsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialRooms = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/hostel/rooms?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialRooms = (await res.json()).data;
    }
  } catch (err) {
    console.error("[HostelRoomsPage] Failed to load rooms", err);
  }

  return (
    <HostelRoomsClient
      initialRooms={initialRooms}
      schoolId={schoolId}
    />
  );
}