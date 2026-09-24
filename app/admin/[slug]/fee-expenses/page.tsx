import React from "react";
import ExpenseTrackingClient from "./ExpenseTrackingClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

import prisma from "@/server/db/prismadb";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminFeeExpensesPage({ params }: Props) {
  const { slug } = await params;
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

  const initialExpenses = await prisma.expense.findMany({
    where: { companyId },
    orderBy: { date: "desc" },
  }).catch(() => []);

  return (
    <ExpenseTrackingClient
      companyId={companyId}
      initialExpenses={JSON.parse(JSON.stringify(initialExpenses))}
    />
  );
}
