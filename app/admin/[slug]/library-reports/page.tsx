import { cookies } from "next/headers";
import LibraryReportingClient from "./LibraryReportingClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LibraryMembersPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialMembers = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/library/members?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialMembers = (await res.json()).data;
    }
  } catch (err) {
    console.error("[LibraryMembersPage] Failed to load members", err);
  }

  return (
    <LibraryReportingClient
      // initialMembers={initialMembers}
      // schoolId={schoolId}
    />
  );
}