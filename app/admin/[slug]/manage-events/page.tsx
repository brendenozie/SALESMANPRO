// app/admin/[slug]/inventory/page.tsx

import React from "react";
import AdminEventsClient from "./AdminEventsClient";
import { IStoreCategory, IEvent } from "@/types/typings";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";


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
  params: {
    slug: string; // companyId
  };
}

export type OrganizerOption = { id: string; name: string; email: string };

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function AdminInventoryPage({ params }: Props) {
  const companyId = params.slug;

  let categoriesData: IStoreCategory[] = [];
  let allEvents: IEvent[] = [];
  let allOrganizers: Agent[] = [];

  try {
    // Fetch all products for this company
   
    // Fetch all categories for this company
    const categoriesRes = await fetch(`${apiUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId )}`,
      { cache: "no-store" }
    );

    if (categoriesRes.ok) {
          const { results } = await categoriesRes.json() as { results: IStoreCategory[] };
          categoriesData = Array.isArray(results) ? results : [];
    }

    // Fetch all agents for this company
    const allOrganizersRes = await fetch(
      `${apiUrl}/admin/agents?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" }
    );
    if (allOrganizersRes.ok) {
      allOrganizers = (await allOrganizersRes.json()) as Agent[];
    }

     // Fetch all users who can be organizers (e.g., Admins, Educators, Staff)
    const organizersRes = await fetch(`${apiUrl}/admin/agents?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/users endpoint
      cache: "no-store",
    });
    if (organizersRes.ok) {
      const fetchedOrganizers = (await organizersRes.json()) as any[];
      allOrganizers = fetchedOrganizers.map(u => ({ id: u.id, name: u.name || 'N/A', email: u.email || 'N/A' }));
    } else {
      console.error(`[EventsManagerPage] Failed to fetch organizers: ${organizersRes.status} ${organizersRes.statusText}`);
      // fetchError = true;
    }

    const eventsRes = await fetch(`${apiUrl}/admin/events?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/users endpoint
      cache: "no-store",
    });

    if (eventsRes.ok) {
      allEvents = (await eventsRes.json()) as IEvent[];
    
    }else {
      const errorData = await eventsRes.json();
      throw new Error(errorData.message || `HTTP error! status: ${eventsRes.status}`);
    }

    // Sanity check: ensure arrays
   
    if (!Array.isArray(categoriesData)) {
      throw new Error("Categories API response is not an array.");
    }
    if (!Array.isArray(allOrganizers)) {
      throw new Error("Agents API response is not an array.");
    }
    if (!Array.isArray(allEvents)) {
      throw new Error("Events API response is not an array.");
    }

  } catch (err: any) {
    console.error("AdminInventoryPage-fetch error:", err.message);
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
