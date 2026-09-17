import React from "react";
import SearchAnalyticsView from "@/components/admin/analytics/SearchAnalyticsView";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AdminSearchAnalyticsPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SearchAnalyticsView slug={slug} isGhubaPlatform={false} />
    </div>
  );
}
