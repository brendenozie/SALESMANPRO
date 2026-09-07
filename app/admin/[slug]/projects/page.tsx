// app/admin/projects/page.tsx
import React from "react";
import ProjectsClient from "./ProjectsClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Define the Project type based on your Prisma schema
export type Project = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null; // ISO string
  endDate: string | null; // ISO string
  status: 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';
  budget: number | null;
  companyId: string | null;
  // Include relations if you want to display them directly, e.g.,
  // tasks: any[];
  // events: any[];
  // donations: any[];
  // members: any[];
  createdAt: string;
  updatedAt: string;
};

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: fetches the projects on every request (next: { revalidate: 60 }),
 * then renders the client component with the fetched data.
 */
export default async function ProjectsPage({ params }: PageProps) {
  const { slug }  = await params; // Assuming projects are filtered by companyId
  
  const cookieHeader = (await cookies()).toString();
  let projectsData: Project[] = [];

    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  try {
    // Adjust the API endpoint if your projects API supports companyId filtering
    const res = await fetch(`${apiBaseUrl}/admin/projects?companyId=${companyId}`, { next: { revalidate: 60 }, headers: { cookie: cookieHeader } });
    if (res.ok) {
      let projectRes = await res.json();
      // console.log("[ProjectsPage] Fetched projects successfully:", projectRes);
      projectsData = projectRes.data || [];
    } else {
      // console.error(
      //   "[ProjectsPage] Failed to fetch projects →",
      //   res.status,
      //   res.statusText
      // );
    }
  } catch (err: any) {
    // console.error("[ProjectsPage] Error fetching projects →", err.message);
  }

  return <ProjectsClient projectsData={projectsData} companyId={companyId}/>;
}
