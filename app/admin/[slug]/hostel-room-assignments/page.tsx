import { cookies } from "next/headers";
import RoomAssignmentsClient from "./RoomAssignmentsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}


export default async function RoomAssignmentsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let data = { unassigned: [], rooms: [] };
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/hostel/room-assignments?companyId=${schoolId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) data = (await res.json()).data;
    console.log(data);
  } catch (err) { console.error(err); }

  return (
    <RoomAssignmentsClient 
      initialUnassigned={data.unassigned} 
      initialRooms={data.rooms} 
      schoolId={schoolId} 
    />
  );
}