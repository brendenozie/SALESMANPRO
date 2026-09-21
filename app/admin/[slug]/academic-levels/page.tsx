import React from "react";
import AcademicLevelsClient, { AcademicLevelType } from "./AcademicLevelsClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { serverFetch } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AcademicLevelsManagementPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const res = await serverFetch<AcademicLevelType[]>(
    `/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`
  );

  const initialAcademicLevels: AcademicLevelType[] = Array.isArray(res.data)
    ? res.data
    : [];

  return (
    <AcademicLevelsClient
      initialAcademicLevels={initialAcademicLevels}
      companyId={companyId}
      apiBaseUrl="/api"
    />
  );
}
