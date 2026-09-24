import React from "react";
import { cookies } from "next/headers";
import AdminCheckinClient from "./AdminCheckinClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

type Event = {
  id: string;
  title: string;
  startDateTime: string;
};

interface Props {
  params: Promise<{ slug: string }>;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function AdminCheckinPage({ params }: Props) {
  const { slug } = await params;

  const cookiesHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
    
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

  let initialEvents: Event[] = [];
  let error: string | null = null;

  try {
    const fetchUrl = `${apiBaseUrl}/admin/events?companyId=${encodeURIComponent(companyId)}`;//status=SCHEDULED&
    const response = await fetch(fetchUrl, {
      next: { revalidate: 15 },
      headers: { cookie: cookiesHeader },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const rawList = Array.isArray(data.data) ? data.data : (data.data?.events || data.events || []);
    initialEvents = rawList as Event[];
  } catch (err: any) {
    error = "Failed to synchronize upcoming scheduled records with the entrance workspace.";
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-rose-400 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md p-6 bg-white/[0.02] backdrop-blur-xl border border-rose-500/20 rounded-2xl shadow-2xl">
          <h1 className="text-2xl font-black mb-2 text-white">Synchronization Error 🚨</h1>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <div className="text-xs text-slate-500 bg-black/40 py-2 px-3 rounded-lg font-mono">
            {/* Org Identifier: {adminSlug} */}
          </div>
        </div>
      </div>
    );
  }

  return <AdminCheckinClient adminSlug={companyId} initialEvents={initialEvents} />;
}