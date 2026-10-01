import React from "react";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentProductRequestsPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "product-requests");

  const companyId = context.company.id;

  const requests = await prisma.request.findMany({
    where: { companyId },
    take: 30,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      productId: true,
      quantity: true,
      status: true,
      createdAt: true,
    },
  }).catch(() => []);

  // Fetch product names for requests
  const productIds = requests.map((r) => r.productId).filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true },
  }).catch(() => []);

  const productMap = new Map(products.map((p) => [p.id, p.title]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Stock Requisitions</h1>
          <p className="text-sm text-slate-500">
            Requisition additional inventory units from company warehouse for <strong>{context.company.name}</strong>.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">No stock requisitions submitted.</p>
            <p className="text-xs text-slate-500">When inventory runs low, submit restock requests here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Requested Quantity</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((r) => {
                  const title = productMap.get(r.productId) || `Product #${r.productId?.slice(-6) || r.id.slice(-6)}`;
                  const isApproved = r.status === "APPROVED";
                  const isPending = r.status === "PENDING";

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        #{r.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {title}
                      </td>
                      <td className="py-3.5 px-4 font-black text-sm">
                        {r.quantity} Units
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            APPROVED
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            <ClockIcon className="w-3.5 h-3.5" />
                            PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                            <XCircleIcon className="w-3.5 h-3.5" />
                            DECLINED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
