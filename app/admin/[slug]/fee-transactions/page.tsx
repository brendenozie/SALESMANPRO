import React from "react";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import OnlinePaymentsClient from "./OnlinePaymentsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminFeeTransactionsPage({ params }: Props) {
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

  const fetchData = async (endpoint: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}${endpoint}`, {
        next: { revalidate: 60 },
        headers: { cookie: cookieHeaders },
      });
      return res.ok ? (await res.json()).data : null;
    } catch {
      return null;
    }
  };

  const [transactionsData, invoicesData, studentsData] = await Promise.all([
    fetchData(`/admin/fee-transactions?companyId=${encodeURIComponent(companyId)}`),
    fetchData(`/admin/fee-invoices?companyId=${encodeURIComponent(companyId)}`),
    fetchData(`/admin/students?companyId=${encodeURIComponent(companyId)}`),
  ]);

  return (
    <OnlinePaymentsClient
      companyId={companyId}
      schoolSlug={slug}
      initialTransactions={transactionsData?.transactions || []}
      initialSummary={transactionsData?.summary || {}}
      invoices={invoicesData?.invoices || []}
      students={studentsData || []}
    />
  );
}
