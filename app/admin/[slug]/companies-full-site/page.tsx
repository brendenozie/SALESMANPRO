import React from "react";
import CompaniesClient from "./CompaniesClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function CompanyManagementPage() {
  let companies = [];
  const cookieHeader = (await cookies()).toString();

  try {
    const res = await fetch(`${apiBaseUrl}/admin/companies-full-list`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store'
    });

    if (res.ok) {
      const json = await res.json();
      companies = json.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch companies:", err);
  }

  return <CompaniesClient initialCompanies={companies} />;
}