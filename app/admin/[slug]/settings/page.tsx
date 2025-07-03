// app/admin/[slug]/results/page.tsx
import React from "react";
import UserSettingsPage from "./UserSettingsPage";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
  };
}

export default async function AdminResultsOverviewPageWrapper({ params }: PageProps) {
  const companyId = params.slug;



  return (
    <UserSettingsPage />
  );
}
