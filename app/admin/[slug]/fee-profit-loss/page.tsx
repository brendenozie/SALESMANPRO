import React from "react";
import ProfitLossReportClient from "./ProfitLossReportClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminFeeProfitLossPage({ params }: Props) {
  const { slug } = await params;
  const cookieHeaders = (await cookies()).toString();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold">
        School organization not found.
      </div>
    );
  }

  const companyId = company.id;
  let initialData: any = {};

  try {
    const reportRes = await fetch(
      `${apiBaseUrl}/admin/reports/profit-loss?companyId=${encodeURIComponent(companyId)}`,
      {
        next: { revalidate: 60 },
        headers: { cookie: cookieHeaders },
      }
    );
    if (reportRes.ok) {
      initialData = await reportRes.json();
    }
  } catch (err: any) {
    // Proceed with fallback on failure
  }

  return (
    <ProfitLossReportClient companyId={companyId} initialData={initialData} />
  );
}
