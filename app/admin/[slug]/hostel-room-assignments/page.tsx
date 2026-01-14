import { cookies } from "next/headers";
import RoomAssignmentsClient from "./RoomAssignmentsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomAssignmentsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialMembers = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/hostel/room-assignments?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialMembers = (await res.json()).data;
    }
  } catch (err) {
    console.error("[RoomAssignmentsPage] Failed to load members", err);
  }

  return (
    <RoomAssignmentsClient
      // initialMembers={initialMembers}
      // schoolId={schoolId}
    />
  );
}