// app/admin/[slug]/inventory/page.tsx

import React from "react";
import AdminEventsClient from "./AdminEventsClient";
import { IStoreCategory, IEvent } from "@/types/typings";
import { cookies } from "next/headers";

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";


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
  const { slug : companyId } = await params;
  const cookiesHeader = (await cookies()).toString  ();

  let categoriesData: IStoreCategory[] = [];
  let allEvents: IEvent[] = [];
  let allOrganizers: Agent[] = [];

  try {
    // Fetch all products for this company
   
    // Fetch all categories for this company
    const categoriesRes = await fetch(`${apiUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId )}`,
      { next: { revalidate: 60 }, headers: { cookie: cookiesHeader } }
    );

    if (categoriesRes.ok) {
      let categoriesJson = await categoriesRes.json();
      console.log("Fetched categories:", categoriesJson);
      categoriesData = categoriesJson.data.results as IStoreCategory[];
    }

    // Fetch all agents for this company
    const allOrganizersRes = await fetch(
      `${apiUrl}/admin/agents?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookiesHeader } }
    );
    if (allOrganizersRes.ok) {
      let organizersJson = await allOrganizersRes.json();
      console.log("Fetched organizers:", organizersJson);
      allOrganizers = organizersJson.data as Agent[];
    }

     // Fetch all users who can be organizers (e.g., Admins, Educators, Staff)
    const organizersRes = await fetch(`${apiUrl}/admin/agents?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/users endpoint
      next: { revalidate: 60 },
      headers: { cookie: cookiesHeader }
    });
    if (organizersRes.ok) {
      let organizersJson = await organizersRes.json();
      console.log("Fetched organizers:", organizersJson);
      allOrganizers = organizersJson.data as Agent[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch organizers: ${organizersRes.status} ${organizersRes.statusText}`);
      // fetchError = true;
    }

    const eventsRes = await fetch(`${apiUrl}/admin/events?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/users endpoint
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
