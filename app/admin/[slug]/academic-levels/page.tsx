// app/admin/[slug]/academic-levels/page.tsx

import React from "react";
import AcademicLevelsClient, { AcademicLevelType } from "./AcademicLevelsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
  };
}

// --- Helper function to generate sample data ---
const generateSampleAcademicLevelsData = (companyId: string): AcademicLevelType[] => {
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
  const companyId = params.slug;

  let initialAcademicLevels: AcademicLevelType[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch all academic levels for this company
    const academicLevelsRes = await fetch(
      `${apiUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" } // equivalent to SSR on every request
    );
    if (academicLevelsRes.ok) {
      initialAcademicLevels = (await academicLevelsRes.json()) as AcademicLevelType[];
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
  if (fetchError || initialAcademicLevels.length === 0) {
    console.log("[AcademicLevelsManagementPage] Using sample data for academic levels.");
    initialAcademicLevels = generateSampleAcademicLevelsData(companyId);
  }

  return (
    <AcademicLevelsClient
      initialAcademicLevels={initialAcademicLevels}
      companyId={companyId}
      apiUrl={apiUrl}
    />
  );
}
