import React from 'react';
import { cookies } from 'next/headers';
import AdminCheckinClient from './AdminCheckinClient';

// Define Data Types (must match Client Component)
type Event = {
  id: string;
  title: string;
  startDateTime: string;
};

interface Props {
  params:Promise<{ slug: string }>
}

// Define the API URL based on the environment
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Server Component for the Admin Check-in page.
 * Fetches the initial list of events on the server for performance
 * and passes them to the client component for interactive check-in logic.
 */
export default async function AdminCheckinPage({ params }: Props) {
  const { slug : adminSlug} = await params;

  // 1. Get cookies for authentication in the server environment
  const cookiesHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let initialEvents: Event[] = [];
  let error: string | null = null;

  try {
    // 2. Server-side fetch for the initial list of events
    const fetchUrl = `${apiUrl}/admin/${adminSlug}/events?status=SCHEDULED&fields=id,title,startDateTime`;

    const response = await fetch(fetchUrl, {
      next: { revalidate: 60 }, // Ensure we get fresh data
      headers: { cookie: cookiesHeader }, // Pass auth cookies
    });

    if (!response.ok) {
      // Attempt to parse error message if available
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Assuming the API returns the event list nested under 'data.events'
    initialEvents = (data.data?.events || []) as Event[];

  } catch (err: any) {
    console.error("AdminCheckinPage initial event fetch error:", err.message);
    error = "Failed to load events. Check API connectivity or user authorization.";
  }
  
  // 3. Render a server-side error message if the fetch failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-red-400 p-8 sm:p-12 font-sans">
        <h1 className="text-4xl font-bold mb-4">Check-in Error 😟</h1>
        <p>An error occurred while trying to load the initial event list.</p>
        <p className="mt-2 text-red-300">**Details:** {error}</p>
        <p className="mt-4 text-gray-500 text-sm">Organization Slug: {adminSlug}</p>
      </div>
    );
  }

  // 4. Pass the fetched events to the Client Component
  return (
    <AdminCheckinClient
      adminSlug={adminSlug}
      initialEvents={initialEvents}
    />
  );
}
