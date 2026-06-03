import { cookies } from "next/headers";
import HostelReportsClient from "./HostelReportsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelReportsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialData = null;  
  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/property/analytics?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 }, // ISR: Cache this page for 60 seconds
      }
    );

    if (res.ok) {
      const json = await res.json();
      initialData = json.data;
    }
  } catch (err) {
    console.error("[HostelReportsPage] Failed to load analytics", err);
  }

  return (
    <HostelReportsClient 
      schoolId={schoolId}      
      initialData={initialData}
    />
  );
}