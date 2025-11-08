// app/admin/[slug]/parents/page.tsx

import React from "react";
import ParentsClient, { ParentType } from "./ParentsClient"; // Import ParentType from client component

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data ---
const generateSampleParentsData = (companyId: string): ParentType[] => {
  const sampleParents: ParentType[] = [
    {
      id: 'PAR001',
      userId: 'USERA01',
      loginCode: '900001',
      name: 'Mercy Wanjiru',
      email: 'mercy.w@example.com',
      profilePicture: 'https://placehold.co/100x100/FFD1DC/FF69B4?text=MW',
      phone: '+254711223344',
      bio: 'Dedicated parent, actively involved in school activities.',
      address: '101 Rose Ave, Nairobi',
      companyId: companyId,
      totalChildren: 2,
      createdAt: new Date('2019-01-15').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'PAR002',
      userId: 'USERA02',
      loginCode: '900002',
      name: 'David Otieno',
      email: 'david.o@example.com',
      profilePicture: 'https://placehold.co/100x100/C8E6C9/4CAF50?text=DO',
      phone: '+254722334455',
      bio: 'Supports his children\'s academic and extracurricular pursuits.',
      address: '202 Green St, Nairobi',
      companyId: companyId,
      totalChildren: 1,
      createdAt: new Date('2020-03-20').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'PAR003',
      userId: 'USERA03',
      loginCode: '900003',
      name: 'Elizabeth Kimani',
      email: 'elizabeth.k@example.com',
      profilePicture: 'https://placehold.co/100x100/B3E5FC/2196F3?text=EK',
      phone: '+254733445566',
      bio: 'Engaged in the school\'s parent-teacher association.',
      address: '303 Blue Rd, Nairobi',
      companyId: companyId,
      totalChildren: 1,
      createdAt: new Date('2018-07-10').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'PAR004',
      userId: 'USERA04',
      loginCode: '900004',
      name: 'Ruth Njoroge',
      email: 'ruth.n@example.com',
      profilePicture: 'https://placehold.co/100x100/CFD8DC/607D8B?text=RN',
      phone: '+254744556677',
      bio: 'Always encourages her child to explore new subjects.',
      address: '404 Red Lane, Nairobi',
      companyId: companyId,
      totalChildren: 1,
      createdAt: new Date('2021-05-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  return sampleParents;
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function ParentsManagementPage({ params }: PageProps) {
  const { slug : companyId } = await params;

  let initialParents: ParentType[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch all parents for this company
    const parentsRes = await fetch(
      `${apiBaserUrl}/admin/parents?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 } } // equivalent to SSR on every request
    );
    if (parentsRes.ok) {
      initialParents = (await parentsRes.json()) as ParentType[];
    } else {
      console.error(
        `[ParentsManagementPage] Failed to fetch parents: ${parentsRes.status} ${parentsRes.statusText}`
      );
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[ParentsManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError || initialParents.length === 0) {
    console.log("[ParentsManagementPage] Using sample data for parents.");
    initialParents = generateSampleParentsData(companyId);
  }

  return (
    <ParentsClient
      initialParents={initialParents}
      companyId={companyId}
      apiBaserUrl={apiBaserUrl}
    />
  );
}
