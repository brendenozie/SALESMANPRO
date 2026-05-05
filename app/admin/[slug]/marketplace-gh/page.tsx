import React from "react";
import { cookies } from "next/headers";
import MarketplaceManagementClient from "./CompaniesClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function CompanyManagementPage() {
  let listings = [];
  let meta = {};
  const cookieHeader = (await cookies()).toString();

  try {
    const res = await fetch(`${apiBaseUrl}/admin/marketplace-gh`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store'
    });

    if (res.ok) {
      const json = await res.json();
      console.log("Fetched listings:", json);
      listings = json.data.results || [];
      meta = json.data.meta || {};
    }
  } catch (err) {
    console.error("Failed to fetch listings:", err);
  }

  return <MarketplaceManagementClient initialListings={listings} initialMeta={meta} />;
}