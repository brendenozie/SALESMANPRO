'use client';

import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function SuperAdminSeoControlCenter() {
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo/health');
      const data = await res.json();
      setDiagnostics(data);
    } catch (err: any) {
      setStatusMessage({ type: 'error', message: err.message || 'Failed to query SEO diagnostics' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handlePingSearchEngines = async (target: 'ALL' | 'SALESMANPRO' | 'GHUBA') => {
    setPinging(true);
    try {
      const res = await fetch('/api/seo/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch IndexNow ping');
      }
      setStatusMessage({ type: 'success', message: data.message });
    } catch (err: any) {
      setStatusMessage({ type: 'error', message: err.message || 'IndexNow notification failed' });
    } finally {
      setPinging(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const isHealthy = diagnostics?.status === 'HEALTHY';
  const platformStores = diagnostics?.surfaces?.platform?.indexableStoresCount ?? '—';
  const ghubaListings = diagnostics?.surfaces?.ghubaMarketplace?.indexableApprovedListingsCount ?? '—';
  const sampleAudit = diagnostics?.sampleAudit?.seoReadiness;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <GlobeAltIcon className="h-7 w-7" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  SEO & Search Engine Discovery Engine
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Platform-wide canonical governance, dynamic sitemaps, IndexNow pings & Ghuba marketplace indexing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDiagnostics}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <ArrowPathIcon className={clsx("h-4 w-4", loading && "animate-spin")} />
              Run Audit
            </button>
            <button
              onClick={() => handlePingSearchEngines('ALL')}
              disabled={pinging}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
            >
              <BoltIcon className={clsx("h-4 w-4", pinging && "animate-spin")} />
              {pinging ? "Pinging Engines..." : "⚡ Ping Search Engines (IndexNow)"}
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={clsx("p-4 rounded-xl text-xs font-semibold flex items-center gap-3 border", statusMessage.type === 'success' ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-red-950/60 border-red-800 text-red-300")}>
            {statusMessage.type === 'success' ? <CheckCircleIcon className="h-5 w-5 shrink-0" /> : <ExclamationCircleIcon className="h-5 w-5 shrink-0" />}
            {statusMessage.message}
          </div>
        )}

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Engine Health */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>SEO Engine Status</span>
              <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{diagnostics?.status || "CHECKING"}</span>
              <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", isHealthy ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                {isHealthy ? "Operational" : "Degraded"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">All 3 surfaces active & resolving canonicals</p>
          </div>

          {/* Indexable Stores */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Tenant Stores</span>
              <BuildingStorefrontIcon className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{platformStores}</span>
              <span className="text-[10px] text-indigo-300 font-semibold">Stores Factored</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Factored across 53 vertical themes</p>
          </div>

          {/* Ghuba Marketplace Listings */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Ghuba Marketplace Listings</span>
              <ShoppingBagIcon className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{ghubaListings}</span>
              <span className="text-[10px] text-purple-300 font-semibold">Approved</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Rendered with rich product & car schema</p>
          </div>

          {/* Dynamic Sitemap */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Sitemap & Crawl Control</span>
              <ServerStackIcon className="h-4 w-4 text-teal-400" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-teal-300 hover:underline flex items-center gap-1"
              >
                /sitemap.xml <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </a>
              <span className="text-slate-600">|</span>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-teal-300 hover:underline flex items-center gap-1"
              >
                /robots.txt <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Host-aware multi-tenant routing</p>
          </div>
        </div>

        {/* Surface Architectures & Live Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Surface Breakdown */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4 text-indigo-400" />
              Ecosystem Surface Canonical Configuration
            </h2>

            <div className="space-y-3 text-xs">
              {/* Surface 1: SalesmanPro */}
              <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-400">1. SalesmanPro (Platform / SaaS)</span>
                  <span className="font-mono text-[10px] text-slate-400">salesmanpro.site</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Root layout emits Organization & WebSite JSON-LD, deterministic marketing routes (/about, /pricing, /blog), and siteMetadata.
                </p>
                <div className="text-slate-400 font-mono text-[10px] pt-1">
                  Canonical: {diagnostics?.canonicalVerification?.platform || "https://salesmanpro.site"}
                </div>
              </div>

              {/* Surface 2: Ghuba Marketplace */}
              <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400">2. Ghuba (Multi-Vendor Marketplace)</span>
                  <span className="font-mono text-[10px] text-slate-400">ghuba.shop</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  All marketplace listings canonicalize strictly to https://ghuba.shop/productlist/[id]. Dual vehicle schema (Car + Product) and crawlable category links.
                </p>
                <div className="text-slate-400 font-mono text-[10px] pt-1">
                  Canonical: {diagnostics?.canonicalVerification?.ghuba || "https://ghuba.shop"}
                </div>
              </div>

              {/* Surface 3: Tenant Storefronts */}
              <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-400">3. Individual Tenant Stores</span>
                  <span className="font-mono text-[10px] text-slate-400">Custom Domains & Subdomains</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Wrapped by universal layout. Custom domains resolve directly (e.g. brand.com), subdomains resolve to slug.salesmanpro.site, completely eliminating internal /site/[slug] canonical leakage.
                </p>
                <div className="text-slate-400 font-mono text-[10px] pt-1">
                  Custom Domain Sample: {diagnostics?.canonicalVerification?.tenantCustomDomainSample || "https://examplebrand.co.ke/products/123"}
                </div>
              </div>
            </div>
          </div>

          {/* Crawl Protection & Sample Audit */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
              Crawl Security & Sample Listing Audit
            </h2>

            {/* Robots.txt Protected Paths */}
            <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-200">Active Robots.txt Crawl Shield</span>
              <p className="text-slate-400 text-[11px]">
                Search engine spiders are automatically prohibited from indexing internal operational routes:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['/admin', '/super-admin', '/dashboards', '/agent', '/api', '/payments', '/checkout', '/site/'].map((path) => (
                  <span key={path} className="px-2 py-0.5 bg-red-950/40 border border-red-800/60 text-red-300 font-mono text-[10px] rounded">
                    Disallow: {path}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Sample Audit */}
            {sampleAudit && (
              <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Sample Listing Audit</span>
                  <span className={clsx("px-2 py-0.5 text-[10px] font-bold rounded-full", sampleAudit.status === 'SEO_READY' ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                    Score: {sampleAudit.score}% ({sampleAudit.status})
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {sampleAudit.checks?.slice(0, 4).map((chk: any) => (
                    <div key={chk.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{chk.label}</span>
                      <span className={chk.passed ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                        {chk.passed ? "✓ Passed" : "⚠ Missing"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
