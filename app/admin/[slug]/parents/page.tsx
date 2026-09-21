import React from "react";
import ParentsClient, { ParentType } from "./ParentsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ParentsManagementPage({ params }: PageProps) {
  const { slug } = await params;

  let initialParents: ParentType[] = [];

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  try {
    const res = await serverFetchJson<ParentType[]>(
      `/api/admin/parents?companyId=${encodeURIComponent(companyId)}`
    );
    if (res.success && Array.isArray(res.data)) {
      initialParents = res.data;
    }
  } catch (err: any) {
    console.error("[ParentsManagementPage] Error fetching parents:", err);
  }

  return (
    <ParentsClient
      initialParents={initialParents}
      companyId={companyId}
      apiBaseUrl="/api"
    />
  );
}
