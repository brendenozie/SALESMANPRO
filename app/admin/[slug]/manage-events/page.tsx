// app/admin/[slug]/inventory/page.tsx

import React from "react";
import AdminEventsClient from "./AdminEventsClient";
import { IStoreCategory, IEvent } from "@/types/typings";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";


type Tag = {
  id: string;
  name: string;
  image: string;
  status: string;
};

type Agent = {
  id: string;
  name: string;
   email: string
};

interface Props {
  params:Promise<{ slug: string }>
}

export type OrganizerOption = { id: string; name: string; email: string };

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function AdminInventoryPage({ params }: Props) {
  const { slug }  = await params;
  const cookiesHeader = (await cookies()).toString  ();

  let categoriesData: IStoreCategory[] = [];
  let allEvents: IEvent[] = [];
  let allOrganizers: Agent[] = [];

  
    const { slug } = await params;
  
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
    // Fetch all products for this company
   
    // Fetch all categories for this company
    const categoriesRes = await fetch(`${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId )}`,
      { next: { revalidate: 60 }, headers: { cookie: cookiesHeader } }
    );

    if (categoriesRes.ok) {
      let categoriesJson = await categoriesRes.json();
      // console.log("Fetched categories:", categoriesJson);
      categoriesData = categoriesJson.data.results as IStoreCategory[];
    }

    // Fetch all agents for this company
    const allOrganizersRes = await fetch(
      `${apiBaseUrl}/admin/agents?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookiesHeader } }
    );
    if (allOrganizersRes.ok) {
      let organizersJson = await allOrganizersRes.json();
      allOrganizers = organizersJson.data as Agent[];
    }


    const eventsRes = await fetch(`${apiBaseUrl}/admin/events?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/users endpoint
      next: { revalidate: 60 },
      headers: { cookie: cookiesHeader }
    });

    if (eventsRes.ok) {
      let eventsJson = await eventsRes.json();
      console.log("Fetched events:", eventsJson);
      allEvents = eventsJson.data as IEvent[];
    
    }else {
      const errorData = await eventsRes.json();
      throw new Error(errorData.message || `HTTP error! status: ${eventsRes.status}`);
    }

    // Sanity check: ensure arrays
   
    // if (!Array.isArray(categoriesData)) {
    //   throw new Error("Categories API response is not an array.");
    // }
    // if (!Array.isArray(allOrganizers)) {
    //   throw new Error("Agents API response is not an array.");
    // }
    // if (!Array.isArray(allEvents)) {
    //   throw new Error("Events API response is not an array.");
    // }

  } catch (err: any) {
    // console.error("AdminInventoryPage-fetch error:", err.message);
    // We simply proceed with empty arrays if something fails.
  }

  return (
    <AdminEventsClient
      slug={companyId}
      allOrganizers={allOrganizers}
      allEvents={allEvents}
    />
  );
}
