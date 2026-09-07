// app/admin/[slug]/academic-levels/page.tsx

import React from "react";
import SiteCategoriesClient from "./SiteCategoriesClient";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data ---
const generateSampleAcademicLevelsData = (companyId: string): any[] => {
  return [
    {
      id: 'AL001',
      name: 'Playgroup',
      description: 'For the youngest learners, focusing on foundational skills.',
      sortOrder: 1,
      companyId: companyId,
      createdAt: new Date('2022-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'AL002',
      name: 'Kindergarten',
      description: 'Building blocks for early elementary education.',
      sortOrder: 2,
      companyId: companyId,
      createdAt: new Date('2022-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'AL003',
      name: 'Grade 1',
      description: 'First year of formal elementary education.',
      sortOrder: 3,
      companyId: companyId,
      createdAt: new Date('2022-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'AL004',
      name: 'Grade 7',
      description: 'Transition year to middle school curriculum.',
      sortOrder: 7,
      companyId: companyId,
      createdAt: new Date('2022-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'AL005',
      name: 'High School - Freshman',
      description: 'First year of high school, challenging academic programs.',
      sortOrder: 10,
      companyId: companyId,
      createdAt: new Date('2022-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'AL006',
      name: 'University - Year 1',
      description: 'Undergraduate first-year studies.',
      sortOrder: 13,
      companyId: companyId,
      createdAt: new Date('2022-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function AcademicLevelsManagementPage({ params }: PageProps) {
  const { slug }  = await params;
  const cookieHeaders = (await cookies()).toString();

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

  let initialData: any[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch all academic levels for this company
    const academicLevelsRes = await fetch(
      `${apiBaseUrl}/admin/site-categories`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeaders } } // equivalent to SSR on every request
    );
    if (academicLevelsRes.ok) {
      initialData = (await academicLevelsRes.json()).data as any[];
    } else {
      // console.error(
      //   `[AcademicLevelsManagementPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      // );
      fetchError = true;
    }

  } catch (err: any) {
    // console.error("[AcademicLevelsManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError || initialData.length === 0) {
    // console.log("[AcademicLevelsManagementPage] Using sample data for academic levels.");
    initialData = generateSampleAcademicLevelsData(companyId);
  }

  return (
    <SiteCategoriesClient
      initialData={initialData}
      // companyId={companyId}
      // apiBaseUrl={apiBaseUrl}
    />
  );
}
