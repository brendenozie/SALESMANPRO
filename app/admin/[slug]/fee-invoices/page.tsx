import React from "react";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import StudentInvoicingClient from "./StudentInvoicingClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminFeeInvoicesPage({ params }: Props) {
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

  // Helper fetch function
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

  const [invoicesData, studentsData, classroomsData, feeStructuresData] = await Promise.all([
    fetchData(`/admin/fee-invoices?companyId=${encodeURIComponent(companyId)}`),
    fetchData(`/admin/students?companyId=${encodeURIComponent(companyId)}`),
    fetchData(`/admin/classrooms?companyId=${encodeURIComponent(companyId)}`),
    fetchData(`/admin/fee-structure?companyId=${encodeURIComponent(companyId)}`),
  ]);

  return (
    <StudentInvoicingClient
      companyId={companyId}
      schoolSlug={slug}
      initialInvoices={invoicesData?.invoices || []}
      initialSummary={invoicesData?.summary || {}}
      students={studentsData || []}
      classrooms={classroomsData || []}
      feeStructures={feeStructuresData || []}
    />
  );
}
