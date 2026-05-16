import React from "react";
import { cookies } from "next/headers";
import AdminAttendeesClient from "./AdminAttendeesClient";
import prisma from "@/server/db/prismadb";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminAttendeesPage({ params }: Props) {
  const { slug: companyId } = await params;

  const cookiesHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let initialAttendees = [];
  let uniqueEvents : { id: string; title: string }[] = [];

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