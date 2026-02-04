import { cookies } from "next/headers";
import StaffAttendanceClient from "./StaffAttendanceClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaffAttendancePage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialData = [];  
  let initialStaff = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/attendance?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialData = (await res.json());
      console.log("Fetched initial attendance data:", initialData);
    }

    const resStaff = await fetch(
      `${apiBaseUrl}/admin/staff?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (resStaff.ok) {
      const json = await resStaff.json();
      initialStaff = json.data;
    }

  } catch (err) {
    console.error("[StaffAttendancePage] Failed to load attendance data", err);
  }

  return (
    <StaffAttendanceClient
      initialData={initialData}
      initialStaff={initialStaff}
      schoolId={schoolId}
    />
  );
}