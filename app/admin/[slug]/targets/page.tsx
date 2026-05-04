// app/admin/targets/page.tsx

import React from "react";
import TargetsClient from "./TargetsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component that simply renders the client‐side logic.
 * All data fetching and rendering happen in TargetsClient.
 */
export default function TargetsPage({ params }: PageProps) {
  const { slug } = params as any; // Extract slug from params if needed for future use
  return <TargetsClient companyId={slug} />;
}
