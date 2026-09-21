import React from "react";
import AdminActivitiesClient, { ActivityTypeItem, ActivityItem } from "./AdminActivitiesClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function AdminActivitiesPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { type: initialType } = await searchParams;

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        School organization not found.
      </div>
    );
  }

  const companyId = company.id;
  let initialActivities: ActivityItem[] = [];
  let initialTypes: ActivityTypeItem[] = [];

  try {
    const typeParam = initialType ? `&type=${encodeURIComponent(initialType)}` : '';
    const [typesRes, activitiesRes] = await Promise.all([
      serverFetchJson<ActivityTypeItem[]>(`/api/admin/activity-types?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<{ activities: ActivityItem[] } | ActivityItem[]>(
        `/api/admin/activities?companyId=${encodeURIComponent(companyId)}${typeParam}`
      )
    ]);

    if (typesRes.success && Array.isArray(typesRes.data)) {
      initialTypes = typesRes.data;
    }

    if (activitiesRes.success && activitiesRes.data) {
      if (Array.isArray(activitiesRes.data)) {
        initialActivities = activitiesRes.data;
      } else if (Array.isArray((activitiesRes.data as any).activities)) {
        initialActivities = (activitiesRes.data as any).activities;
      }
    }
  } catch (err: any) {
    console.error("[AdminActivitiesPage] Error fetching activities:", err);
  }

  return (
    <AdminActivitiesClient
      initialActivities={initialActivities}
      activityTypes={initialTypes}
      companyId={companyId}
      schoolSlug={slug}
      initialTypeFilter={initialType || "ALL"}
    />
  );
}
