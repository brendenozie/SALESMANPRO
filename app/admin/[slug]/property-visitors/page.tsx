import { cookies } from "next/headers";
import VisitorsPageClient from "./VisitorsPageClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VisitorsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialLogs = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/property/visitors?companyId=${schoolId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) initialLogs = (await res.json()).data;
  } catch (err) { 
    // console.error(err); 
    }

  return (
    <VisitorsPageClient 
      initialLogs={initialLogs} 
      schoolId={schoolId} 
    />
  );
}