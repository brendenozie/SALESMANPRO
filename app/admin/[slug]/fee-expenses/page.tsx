import React from "react";
import ExpenseTrackingClient from "./ExpenseTrackingClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminFeeExpensesPage({ params }: Props) {
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
  let initialExpenses: any[] = [];

  try {
    const expensesRes = await fetch(
      `${apiBaseUrl}/admin/expenses?companyId=${encodeURIComponent(companyId)}`,
      {
        next: { revalidate: 60 },
        headers: { cookie: cookieHeaders },
      }
    );
    if (expensesRes.ok) {
      initialExpenses = (await expensesRes.json()) || [];
    }
  } catch (err: any) {
    // Proceed with empty expenses on failure
  }

  return (
    <ExpenseTrackingClient companyId={companyId} initialExpenses={initialExpenses} />
  );
}
