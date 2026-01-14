import { cookies } from "next/headers";
import AssetTrackingClient from "./AssetTrackingClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryDashboardPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialAssets = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/inventory-dashboard/data?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialAssets = (await res.json()).data;
    }
  } catch (err) {
    console.error("[LibraryMembersPage] Failed to load members", err);
  }

  return (
    <AssetTrackingClient
      // initialMembers={initialMembers}
      // schoolId={schoolId}
    />
  );
}