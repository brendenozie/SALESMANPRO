import React from "react";
import Link from "next/link";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  CubeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentInventoryPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "inventory");

  const companyId = context.company.id;
  const currency = context.company.currency;

  const inventory = await prisma.inventoryItem.findMany({
    where: { companyId },
    take: 50,
    orderBy: { quantity: "asc" },
    select: {
      id: true,
      productId: true,
      quantity: true,
      sku: true,
      updatedAt: true,
    },
  }).catch(() => []);

  // Fetch product titles for these items if available
  const productIds = inventory.map((i) => i.productId).filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, price: true },
  }).catch(() => []);

  const productMap = new Map(products.map((p) => [p.id, p]));

  const lowStockItems = inventory.filter((i) => (i.quantity ?? 0) <= 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Stock & Inventory</h1>
          <p className="text-sm text-slate-500">
            Monitor real-time inventory levels for <strong>{context.company.name}</strong>.
          </p>
        </div>
        <Link
          href={`/agents/${slug}/product-requests`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Request Restock</span>
        </Link>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">{lowStockItems.length} products have low stock</span> (5 units or fewer). Requisition additional stock to avoid outages.
            </div>
          </div>
          <Link
            href={`/agents/${slug}/product-requests`}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap shadow-sm"
          >
            Requisition Now
          </Link>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {inventory.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CubeIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">No stock items found in this inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Item / Product</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Quantity on Hand</th>
                  <th className="py-3 px-4">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inventory.map((item) => {
                  const prod = productMap.get(item.productId);
                  const isLow = (item.quantity ?? 0) <= 5;
                  const isOut = (item.quantity ?? 0) <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {prod?.title || `Product #${item.productId?.slice(-6) || item.id.slice(-6)}`}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {item.sku || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {prod ? `${currency} ${prod.price.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 font-black text-sm">
                        <span className={isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-slate-900 dark:text-slate-100"}>
                          {item.quantity ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            Healthy Stock
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
