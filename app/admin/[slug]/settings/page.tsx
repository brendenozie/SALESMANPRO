// app/admin/[slug]/results/page.tsx
import React from "react";
import UserSettingsPage from "./UserSettingsPage";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

export default async function AdminResultsOverviewPageWrapper({ params }: PageProps) {
  const { slug : companyId } = await params;



  return (
    <UserSettingsPage companyId={companyId} />
  );
}
