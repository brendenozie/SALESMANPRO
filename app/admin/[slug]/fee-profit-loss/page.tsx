import React from "react";
import ProfitLossReportClient from "./ProfitLossReportClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

import prisma from "@/server/db/prismadb";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminFeeProfitLossPage({ params }: Props) {
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

  let initialData: any = {
    netSurplus: 0,
    totalIncome: 0,
    totalExpenses: 0,
    incomeBreakdown: [],
    expenseBreakdown: [],
  };

  try {
    const [expensesByCategory, feeRecords] = await Promise.all([
      prisma.expense.groupBy({
        by: ["category"],
        where: {
          companyId,
          status: "Paid",
        },
        _sum: { amount: true },
      }),
      prisma.studentFeeRecord.findMany({
        where: {
          student: { companyId },
        },
      }),
    ]);

    let totalIncome = 0;
    feeRecords.forEach((record) => {
      const payments = (record.payments as any[]) || [];
      payments.forEach((p) => {
        totalIncome += Number(p.amount) || 0;
      });
    });

    const totalExpenses = expensesByCategory.reduce(
      (acc, curr) => acc + (curr._sum.amount || 0),
      0
    );

    initialData = {
      netSurplus: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      incomeBreakdown: [
        {
          label: "Student Fees",
          value: totalIncome,
          percent: 100,
        },
      ],
      expenseBreakdown: expensesByCategory.map((exp) => ({
        label: exp.category,
        value: exp._sum.amount || 0,
        percent: totalExpenses > 0 ? ((exp._sum.amount || 0) / totalExpenses) * 100 : 0,
      })),
    };
  } catch (err: any) {
    console.error("Server aggregation error for profit-loss:", err);
  }

  return (
    <ProfitLossReportClient
      companyId={companyId}
      initialData={JSON.parse(JSON.stringify(initialData))}
    />
  );
}
