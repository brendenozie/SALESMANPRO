import React from "react";
import Link from "next/link";
import prisma from "@/server/db/prismadb";
import {
  BanknotesIcon,
  CommandLineIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  MegaphoneIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function SuperAdminOverviewPage() {
  const [
    totalCompanies,
    totalUsers,
    totalOrders,
    gmvAgg,
    recentCompanies,
  ] = await Promise.all([
    prisma.company.count().catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.customerOrder.count().catch(() => 0),
    prisma.customerOrder.aggregate({
      where: { status: { notIn: ["CANCELLED", "FAILED"] } },
      _sum: { totalFinalPrice: true },
    }).catch(() => ({ _sum: { totalFinalPrice: 0 } })),
    prisma.company.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        createdAt: true,
      },
    }).catch(() => []),
  ]);

  const platformGMV = gmvAgg._sum.totalFinalPrice || 0;

  const quickPortals = [
    {
      title: "Payments Intelligence",
      description: "Gateway volume, M-Pesa/Stripe splits, Ghuba marketplace fees, and platform settlements.",
      href: "/super-admin/payments",
      icon: BanknotesIcon,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "System Observability",
      description: "Real-time service health, Prisma DB latencies, Redis queue states, and error streams.",
      href: "/super-admin/observability",
      icon: CommandLineIcon,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "AI Workforce Orchestrator",
      description: "Autonomous worker agents, background task queues, job concurrency, and dispatchers.",
      href: "/super-admin/ai-workforce",
      icon: CpuChipIcon,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "AI Studio & Models",
      description: "Gemini / OpenAI API routing, multimodal content pipelines, prompt templates, and quotas.",
      href: "/super-admin/ai",
      icon: SparklesIcon,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "eTIMS Tax Engine",
      description: "KRA eTIMS VSCU middleware, invoice signing, QR code generation, and audit compliance.",
      href: "/super-admin/etims",
      icon: DocumentCheckIcon,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Ads & Promotion Network",
      description: "Global sponsored listings, impression tracking, tenant campaign budgets, and conversions.",
      href: "/super-admin/ads",
      icon: MegaphoneIcon,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "SEO Operations",
      description: "Sitemap regeneration, search indexing robots, canonical URLs, and metadata coverage.",
      href: "/super-admin/seo",
      icon: GlobeAltIcon,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
    {
      title: "Email Infrastructure",
      description: "SMTP relays, transactional delivery health, bounces, spam scores, and template cache.",
      href: "/super-admin/email",
      icon: EnvelopeIcon,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Platform Operations Center</h1>
          <p className="text-slate-400 mt-1 font-medium">Cross-tenant management, multi-gateway telemetry, and root administration.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Global Cluster Active
          </span>
        </div>
      </header>

      {/* Global Vital Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Gross Platform GMV</p>
              <p className="text-3xl font-black text-white mt-1">${Math.round(platformGMV).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BanknotesIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tenant Companies</p>
              <p className="text-3xl font-black text-white mt-1">{totalCompanies.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BuildingStorefrontIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Registered Users</p>
              <p className="text-3xl font-black text-white mt-1">{totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Platform Orders</p>
              <p className="text-3xl font-black text-white mt-1">{totalOrders.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShoppingBagIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem Portals */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-white tracking-tight">Operational Subsystems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickPortals.map((portal) => (
            <Link
              key={portal.title}
              href={portal.href}
              className="group p-6 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 ${portal.color}`}>
                  <portal.icon className="h-6 w-6" />
                </div>
                <h3 className="font-black text-white text-base group-hover:text-amber-400 transition-colors">
                  {portal.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {portal.description}
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-slate-500 group-hover:text-white transition-colors">
                <span>Access Console</span>
                <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Companies Feed */}
      <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-white">Recently Provisioned Companies</h3>
          <span className="text-xs font-bold text-slate-500">Live Registration Audit</span>
        </div>
        <div className="divide-y divide-slate-800/80">
          {recentCompanies.length === 0 ? (
            <p className="py-4 text-xs text-slate-500">No companies found.</p>
          ) : (
            recentCompanies.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-black text-white text-sm">{c.name}</p>
                  <p className="text-xs text-slate-500 font-mono">slug: {c.slug || c.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                    {c.category || "General"}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
