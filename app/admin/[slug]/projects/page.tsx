// app/admin/projects/page.tsx
import React from "react";
import ProjectsClient from "./ProjectsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  const { slug : companyId } = await params; // Assuming projects are filtered by companyId
  
  const cookieHeader = (await cookies()).toString();
  let projectsData: Project[] = [];

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
