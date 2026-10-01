import React from "react";
import Link from "next/link";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  TableCellsIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentTablesPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "tables");

  const companyId = context.company.id;
  const currency = context.company.currency;

  const tables = await prisma.restaurantTable.findMany({
    where: { companyId },
    take: 30,
    orderBy: { tableNumber: "asc" },
    select: {
      id: true,
      name: true,
      tableNumber: true,
      capacity: true,
      status: true,
      currentSessionId: true,
    },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Restaurant Floor & Tables</h1>
          <p className="text-sm text-slate-500">
            Real-time table status and dining floor overview for <strong>{context.company.name}</strong>.
          </p>
        </div>
        <Link
          href={`/agents/${slug}/pos`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>Launch Restaurant POS</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <TableCellsIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">No dining tables configured.</p>
            <p className="text-xs text-slate-500">Manage floor plans in Restaurant POS.</p>
          </div>
        ) : (
          tables.map((t) => {
            const isOccupied = t.status === "OCCUPIED" || Boolean(t.currentSessionId);
            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between aspect-square transition-all ${
                  isOccupied
                    ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/60"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400">T#{t.tableNumber}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOccupied ? "bg-orange-500 animate-pulse" : "bg-emerald-500"
                    }`}
                  />
                </div>
                <div className="text-center">
                  <div className="text-base font-black text-slate-900 dark:text-slate-100">
                    {t.name || `Table ${t.tableNumber}`}
                  </div>
                  <span className="text-[10px] text-slate-400">{t.capacity || 4} Seats</span>
                </div>
                <div className="text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isOccupied
                        ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isOccupied ? "OCCUPIED" : "AVAILABLE"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
