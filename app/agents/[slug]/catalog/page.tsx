import React from "react";
import Link from "next/link";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  BuildingStorefrontIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentCatalogPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "catalog");

  const companyId = context.company.id;
  const currency = context.company.currency;

  const products = await prisma.product.findMany({
    where: { companyId },
    take: 40,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      discount: true,
      images: true,
      category: true,
    },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Product Catalog</h1>
          <p className="text-sm text-slate-500">
            Browse store items, check current retail pricing, and launch sales in <strong>{context.company.name}</strong>.
          </p>
        </div>
        <Link
          href={`/agents/${slug}/pos`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>New Sale (POS)</span>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <BuildingStorefrontIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold">No products registered in this catalog yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const firstImage = Array.isArray(p.images) && p.images.length > 0
              ? typeof p.images[0] === "string"
                ? p.images[0]
                : (p.images[0] as any)?.url
              : null;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-orange-500/50 transition-all"
              >
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <TagIcon className="w-10 h-10 text-slate-400" />
                  )}
                  {p.discount && p.discount > 0 ? (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-red-500 text-white font-black text-[10px]">
                      {p.discount}% OFF
                    </span>
                  ) : null}
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    {p.category && (
                      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block">
                        {p.category}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {p.title}
                    </h3>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <span className="text-base font-black text-slate-900 dark:text-slate-100">
                      {currency} {p.price.toLocaleString()}
                    </span>
                    <Link
                      href={`/agents/${slug}/pos`}
                      className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-colors"
                      title="Sell in POS"
                    >
                      <CreditCardIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
