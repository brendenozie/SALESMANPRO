import { cookies } from "next/headers";
import StaffMembersClient from "./StaffMembersClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaffDirectoryPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialStaff = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/staff?companyId=${companyId}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (res.ok) {
      const json = await res.json();
      initialStaff = json.data;
    }
  } catch (err) {
    console.error("Failed to load staff", err);
  }

  return (
    <StaffMembersClient 
      initialStaff={initialStaff} 
      companyId={companyId} 
    />
  );
}