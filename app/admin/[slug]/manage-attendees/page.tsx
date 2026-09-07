import React from "react";
import { cookies } from "next/headers";
import AdminAttendeesClient from "./AdminAttendeesClient";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminAttendeesPage({ params }: Props) {

  const { slug } = await params;

  const cookiesHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let initialAttendees = [];
  let uniqueEvents : { id: string; title: string }[] = [];
  
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
    // 1. Fetch related active events for filter indexing options
    uniqueEvents = await prisma.event.findMany({
      where: { companyId },
      select: { id: true, title: true },
    });

    // 2. Hydrate raw dashboard layout contexts securely
    const res = await fetch(`${apiBaseUrl}/admin/event-attendees?companyId=${encodeURIComponent(companyId)}`, {
      headers: { cookie: cookiesHeader },
      next: { revalidate: 10 },
    });
    
    if (res.ok) {
      const json = await res.json();
      initialAttendees = json.data || [];
    }
  } catch (error) {
    console.error("Hydration processing failure", error);
  }

  return (
    <AdminAttendeesClient
      companyId={companyId}
      initialAttendees={initialAttendees}
      eventsList={uniqueEvents as any[]}
    />
  );
}