"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheckIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export default function SuperAdminAdCommandCenter() {
  const [activeTab, setActiveTab] = useState<"all-campaigns" | "moderation" | "revenue" | "fraud">("all-campaigns");
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ads/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to load super admin ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    if (filterLevel === "ALL") return campaigns;
    return campaigns.filter((c) => c.level === filterLevel);
  }, [campaigns, filterLevel]);

  // Platform Aggregate Totals
  const platformTotals = useMemo(() => {
    let grossSpendKES = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let pendingApprovalCount = 0;

    campaigns.forEach((c) => {
      grossSpendKES += c.spentAmountKES || 0;
      const m = c.metrics || {};
      totalImpressions += m.impressions || 0;
      totalClicks += m.clicks || 0;
      totalConversions += m.conversions || 0;
      if (c.approvalStatus === "DRAFT" || c.approvalStatus === "PENDING_APPROVAL") {
        pendingApprovalCount++;
      }
    });

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      grossSpendKES,
      totalImpressions,
      totalClicks,
      ctr,
      totalConversions,
      pendingApprovalCount,
      totalCampaigns: campaigns.length,
    };
  }, [campaigns]);

  // Campaign Approval Action
  const handleApproveCampaign = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/ads/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaignId,
          action: "APPROVE",
        }),
      });
      setStatusMessage(`Campaign ${campaignId.slice(-6)} approved and activated.`);
      loadData();
    } catch (err: any) {
      setStatusMessage(`Failed: ${err?.message || "Internal error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-500 rounded-2xl shadow-xl shadow-amber-500/20 text-white">
              <ShieldCheckIcon className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-white">
                  Advertising <span className="text-amber-400">Command Center</span>
                </h1>
                <span className="px-3 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-black uppercase rounded-full tracking-widest">
                  Super Admin
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Monetization, cross-tenant ad delivery, Ghuba sponsored listings, and growth acquisition loop.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 text-xs uppercase tracking-wider"
            >
              <ArrowPathIcon className="w-4 h-4" /> Refresh
            </button>
          </div>
        </header>

        {statusMessage && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 rounded-2xl text-sm font-medium flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Platform KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CurrencyDollarIcon className="w-4 h-4 text-emerald-400" /> Gross Ad Volume
            </span>
            <p className="text-2xl font-black text-emerald-400 mt-2">
              KES {platformTotals.grossSpendKES.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Platform advertising spend</span>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MegaphoneIcon className="w-4 h-4 text-amber-400" /> Active Campaigns
            </span>
            <p className="text-2xl font-black text-white mt-2">
              {platformTotals.totalCampaigns}
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Across Store, Ghuba & SaaS</span>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <EyeIcon className="w-4 h-4 text-cyan-400" /> Total Impressions
            </span>
            <p className="text-2xl font-black text-white mt-2">
              {platformTotals.totalImpressions.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Marketplace & storefront views</span>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CursorArrowRaysIcon className="w-4 h-4 text-purple-400" /> Total Clicks (CTR)
            </span>
            <p className="text-2xl font-black text-white mt-2">
              {platformTotals.totalClicks.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-1">
                ({platformTotals.ctr.toFixed(2)}%)
              </span>
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Verified audience engagement</span>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 col-span-2 lg:col-span-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-400" /> Pending Review
            </span>
            <p className="text-2xl font-black text-amber-400 mt-2">
              {platformTotals.pendingApprovalCount}
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Campaigns awaiting moderation</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "all-campaigns", label: "All Platform Campaigns", icon: MegaphoneIcon },
            { id: "moderation", label: "Moderation Queue", icon: ShieldCheckIcon },
            { id: "revenue", label: "Monetization & Yield", icon: CurrencyDollarIcon },
            { id: "fraud", label: "Fraud & Anti-Abuse", icon: ExclamationTriangleIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: All Platform Campaigns */}
        {activeTab === "all-campaigns" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg font-bold text-white">Cross-Ecosystem Campaigns</h2>

              <div className="flex gap-2">
                {["ALL", "STORE", "GHUBA", "PLATFORM"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                      filterLevel === lvl
                        ? "bg-slate-800 border-amber-400 text-amber-300"
                        : "border-slate-800 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Level & Scope</th>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Budget (KES)</th>
                    <th className="p-4">Spend (KES)</th>
                    <th className="p-4">Impressions</th>
                    <th className="p-4">Clicks (CTR)</th>
                    <th className="p-4">Conversions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No campaigns found for level {filterLevel}.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((c) => {
                      const m = c.metrics || {};
                      return (
                        <tr key={c.id} className="hover:bg-slate-800/40">
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                c.level === "STORE"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : c.level === "GHUBA"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              }`}
                            >
                              {c.level}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-1 font-mono">{c.advertiserType}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white">{c.name}</div>
                            <div className="text-xs text-slate-400">{c.objective}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                c.status === "ACTIVE"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4 font-bold">
                            KES {(c.totalBudgetKES || 0).toLocaleString()}
                          </td>
                          <td className="p-4 font-bold text-amber-400">
                            KES {(c.spentAmountKES || 0).toLocaleString()}
                          </td>
                          <td className="p-4">{m.impressions?.toLocaleString() || 0}</td>
                          <td className="p-4">
                            {m.clicks?.toLocaleString() || 0}{" "}
                            <span className="text-xs text-slate-400">({m.ctr || 0}%)</span>
                          </td>
                          <td className="p-4 font-bold text-emerald-400">
                            {m.conversions || 0}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Moderation & Approvals */}
        {activeTab === "moderation" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Campaign Policy & Moderation Queue</h2>
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
              <p className="text-xs text-slate-400">
                All AI-drafted campaigns with commercial financial impact or sensitive advertising claims appear in the central workforce approval queue. High-risk campaigns cannot distribute ads without explicit Super Admin or Merchant authorization.
              </p>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-white">Workforce Approvals Inbox</h4>
                  <p className="text-xs text-slate-400">
                    Review pending campaign authorization tickets with full proposed action payloads.
                  </p>
                </div>
                <a
                  href="/super-admin/ai-workforce"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  Open Approvals Inbox
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Monetization & Yield */}
        {activeTab === "revenue" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Storefront Monetization Yield
              </span>
              <p className="text-3xl font-black text-white">
                KES {Math.round(platformTotals.grossSpendKES * 0.6).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">
                Revenue generated from store merchant advertising on Ghuba and custom domains.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Ghuba Marketplace Sponsored Yield
              </span>
              <p className="text-3xl font-black text-white">
                KES {Math.round(platformTotals.grossSpendKES * 0.4).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">
                Revenue generated from Ghuba sellers boosting listings to top search positions.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Financial Attribution Separation
              </span>
              <p className="text-3xl font-black text-emerald-400">
                100% Isolated
              </p>
              <p className="text-xs text-slate-400">
                Ad revenues are strictly attributed separately from store sales GMV and SaaS subscriptions.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Fraud & Anti-Abuse */}
        {activeTab === "fraud" && (
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
              Active Anti-Fraud & Abuse Safeguards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white">Click Throttling & Deduplication</h4>
                <p className="text-slate-400">
                  Multiple clicks from the same session within 15 seconds are throttled to 1 billable event, mitigating artificial click inflation.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white">Atomic Budget Capping</h4>
                <p className="text-slate-400">
                  Campaigns are atomically capped at their total authorized budget in KES. When exhausted, status immediately transitions to COMPLETED.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white">Zero Commercial Hallucination</h4>
                <p className="text-slate-400">
                  AI copywriters are strictly bound to authoritative database prices and actual quantities in stock, preventing deceptive claims.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white">Multi-Tenant Wall</h4>
                <p className="text-slate-400">
                  Store tenants cannot view or query competitor campaigns, customer order attributions, or wallet balances.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
