"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MegaphoneIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ShoppingBagIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseIcon,
  PlayIcon,
  BoltIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  TagIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

interface StoreAdCenterProps {
  companyId: string;
  companyName: string;
  slug: string;
}

export default function StoreAdCenter({ companyId, companyName, slug }: StoreAdCenterProps) {
  const [activeTab, setActiveTab] = useState<"campaigns" | "ai-generator" | "creatives" | "wallet">("campaigns");
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [wallet, setWallet] = useState<{ balanceKES: number; transactions: any[] }>({
    balanceKES: 0,
    transactions: [],
  });

  // AI Generator Form State
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [customGoal, setCustomGoal] = useState<string>("Drive rapid customer sales and inquiries");
  const [budgetKES, setBudgetKES] = useState<number>(2500);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);

  // Top Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [topUpPhone, setTopUpPhone] = useState<string>("");
  const [isTopUpProcessing, setIsTopUpProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load Campaigns & Wallet Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [campRes, walletRes, prodRes] = await Promise.all([
        fetch(`/api/ads/campaigns?companyId=${companyId}`),
        fetch(`/api/ads/wallet?companyId=${companyId}`),
        fetch(`/api/admin/products?companyId=${companyId}`).catch(() => null),
      ]);

      if (campRes.ok) {
        const cData = await campRes.json();
        setCampaigns(cData.campaigns || []);
      }
      if (walletRes.ok) {
        const wData = await walletRes.json();
        setWallet(wData.wallet || { balanceKES: 0, transactions: [] });
      }
      if (prodRes && prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData.products || pData || []);
      }
    } catch (err) {
      console.error("Failed to load ad center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Aggregate Performance Metrics
  const aggregateMetrics = useMemo(() => {
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalAttributedRevenue = 0;

    campaigns.forEach((c) => {
      totalSpend += c.spentAmountKES || 0;
      const m = c.metrics || {};
      totalImpressions += m.impressions || 0;
      totalClicks += m.clicks || 0;
      totalConversions += m.conversions || 0;
      totalAttributedRevenue += m.attributedRevenueKES || 0;
    });

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const roas = totalSpend > 0 ? totalAttributedRevenue / totalSpend : 0;

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      ctr,
      totalConversions,
      totalAttributedRevenue,
      roas,
    };
  }, [campaigns]);

  // Handle AI Ad Generation
  const handleGenerateAd = async () => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0]?.id);
    }
    const prodId = selectedProductId || products[0]?.id;

    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/ai/workforce/tools/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "createAdCampaignDraft",
          args: {
            productId: prodId,
            campaignName: `${companyName} - AI Campaign`,
            totalBudgetKES: budgetKES,
            durationDays: durationDays,
            primaryHeadline: customGoal,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedDraft(data);
        setStatusMessage({
          text: "AI successfully generated ad creative variants and targeting strategy! Review below.",
          type: "success",
        });
        loadData();
      } else {
        setStatusMessage({ text: data.error || "Failed to generate ad draft", type: "error" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Network error generating ad", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle M-Pesa Top Up
  const handleTopUp = async () => {
    if (topUpAmount <= 0) return;
    setIsTopUpProcessing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/ads/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          amountKES: topUpAmount,
          paymentGateway: "MPESA",
          description: `M-Pesa Ad Wallet Top-up (${topUpPhone || "Merchant Phone"})`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          text: `Success! KES ${topUpAmount.toLocaleString()} credited to your Ad Wallet.`,
          type: "success",
        });
        setShowTopUpModal(false);
        loadData();
      } else {
        setStatusMessage({ text: data.error || "Top-up failed", type: "error" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Top-up request failed", type: "error" });
    } finally {
      setIsTopUpProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
              <MegaphoneIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  Advertising <span className="text-amber-400">Center</span>
                </h1>
                <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase rounded-full tracking-widest">
                  Ghuba & Storefront
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                Acquire shoppers and boost marketplace rankings for <strong className="text-slate-200">{companyName}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("ai-generator")}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>AI Create Ad</span>
            </button>
            <button
              onClick={() => setShowTopUpModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold rounded-2xl border border-slate-600 transition-all text-xs uppercase tracking-wider"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Budget</span>
            </button>
          </div>
        </header>

        {/* Status Alert Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 ${
              statusMessage.type === "success"
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                : "bg-rose-950/60 border-rose-500/50 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircleIcon className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{statusMessage.text}</p>
          </div>
        )}

        {/* Financial Separation Banner */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-800 p-5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <CurrencyDollarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                Ad Wallet Balance (Distribution Budget)
              </p>
              <p className="text-2xl font-black text-white">
                KES {wallet.balanceKES?.toLocaleString() || "0"}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 max-w-lg bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-amber-400 font-bold">Financial Rule:</span> Ad budget (KES) pays for real delivery across Ghuba and Storefront surfaces. AI credits pay strictly for creative compute (copy & images).
          </div>
        </div>

        {/* Executive KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CurrencyDollarIcon className="w-4 h-4 text-rose-400" /> Total Spend
            </span>
            <p className="text-2xl font-black text-white mt-2">
              KES {aggregateMetrics.totalSpend.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Authorized ad delivery</span>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <EyeIcon className="w-4 h-4 text-amber-400" /> Impressions
            </span>
            <p className="text-2xl font-black text-white mt-2">
              {aggregateMetrics.totalImpressions.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Audience views</span>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CursorArrowRaysIcon className="w-4 h-4 text-cyan-400" /> Clicks (CTR)
            </span>
            <p className="text-2xl font-black text-white mt-2">
              {aggregateMetrics.totalClicks.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                ({aggregateMetrics.ctr.toFixed(2)}%)
              </span>
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Store & listing traffic</span>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShoppingBagIcon className="w-4 h-4 text-emerald-400" /> Conversions
            </span>
            <p className="text-2xl font-black text-emerald-400 mt-2">
              {aggregateMetrics.totalConversions}
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Orders & leads</span>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-between col-span-2 lg:col-span-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ArrowTrendingUpIcon className="w-4 h-4 text-purple-400" /> ROAS
            </span>
            <p className="text-2xl font-black text-purple-400 mt-2">
              {aggregateMetrics.roas > 0 ? `${aggregateMetrics.roas.toFixed(2)}x` : "—"}
            </p>
            <span className="text-[11px] text-slate-500 mt-1">Return on ad spend</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "campaigns", label: "Active Campaigns", icon: MegaphoneIcon },
            { id: "ai-generator", label: "AI Ad Generator", icon: SparklesIcon },
            { id: "creatives", label: "Creatives & Placements", icon: EyeIcon },
            { id: "wallet", label: "Budget & Ledger", icon: CreditCardIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Campaigns Table */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-100">Store Ad Campaigns</h2>
              <button
                onClick={loadData}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="bg-slate-800/40 p-12 text-center rounded-3xl border border-dashed border-slate-700 space-y-4">
                <MegaphoneIcon className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-slate-300">No Advertising Campaigns Yet</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Start reaching more buyers on Ghuba and your storefront. Let our AI analyze your best-selling products and draft a high-converting ad in seconds.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("ai-generator")}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4" /> Launch First AI Ad
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/60 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Campaign</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Budget</th>
                      <th className="p-4">Spend Progress</th>
                      <th className="p-4">Impressions</th>
                      <th className="p-4">Clicks (CTR)</th>
                      <th className="p-4">Conversions</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-slate-200">
                    {campaigns.map((c) => {
                      const m = c.metrics || {};
                      const spent = c.spentAmountKES || 0;
                      const total = c.totalBudgetKES || 0;
                      const progress = total > 0 ? Math.min(100, (spent / total) * 100) : 0;

                      return (
                        <tr key={c.id} className="hover:bg-slate-800/60 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{c.name}</div>
                            <div className="text-xs text-slate-400">{c.objective} • {c.biddingStrategy}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                c.status === "ACTIVE"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : c.status === "DRAFT"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : c.status === "COMPLETED"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : "bg-slate-700 text-slate-300"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4 font-bold">
                            KES {total.toLocaleString()}
                          </td>
                          <td className="p-4 w-48">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span>KES {spent.toLocaleString()}</span>
                              <span className="text-slate-400">{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </td>
                          <td className="p-4">{m.impressions?.toLocaleString() || 0}</td>
                          <td className="p-4">
                            {m.clicks?.toLocaleString() || 0}{" "}
                            <span className="text-xs text-slate-400">
                              ({m.ctr?.toFixed(2) || 0}%)
                            </span>
                          </td>
                          <td className="p-4 font-bold text-emerald-400">
                            {m.conversions || 0}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => alert(`Campaign ID: ${c.id}\nTargeting: ${JSON.stringify(c.targetingRules || {})}`)}
                              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs rounded-lg font-medium"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Ad Generator */}
        {activeTab === "ai-generator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 space-y-5">
              <div className="flex items-center gap-2 text-amber-400">
                <SparklesIcon className="w-5 h-5" />
                <h3 className="font-black uppercase tracking-wider text-sm">
                  AI Product-to-Ad Generator
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select a product from your catalog. Our AI inspects verified prices, inventory, and categories to generate 3 high-converting ad creative angles with zero commercial hallucination.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Product to Promote
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {products.length === 0 ? (
                    <option value="">No products loaded (Manual Entry)</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — KES {(p.sellingPrice || 0).toLocaleString()} (Stock: {p.quantity ?? "Available"})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Campaign Objective / Theme
                </label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Clearance sale, Weekend Special, New Arrivals"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Total Budget (KES)
                  </label>
                  <input
                    type="number"
                    value={budgetKES}
                    onChange={(e) => setBudgetKES(Number(e.target.value))}
                    min={500}
                    step={500}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateAd}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Analyzing Catalog & Writing Ad...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span>Generate Ad Campaign</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview of Generated Creatives */}
            <div className="lg:col-span-7 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 space-y-4">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <EyeIcon className="w-4 h-4 text-amber-400" />
                Creative Variations Preview
              </h3>

              {!generatedDraft ? (
                <div className="p-16 text-center text-slate-500">
                  Select a product on the left and click "Generate Ad Campaign" to preview AI creative variants.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      Target Audience Strategy
                    </span>
                    <p className="text-xs text-slate-300 mt-1">
                      {generatedDraft.data?.targetAudience || "Shoppers looking for verified products in Kenya."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {["A", "B", "C"].map((variant) => (
                      <div
                        key={variant}
                        className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase rounded-md">
                            Variant {variant}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-2">
                            {variant === "A" ? "Direct Value" : variant === "B" ? "Urgency" : "Story/Quality"}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Verified pricing callouts, doorstep delivery benefits, and direct WhatsApp CTA.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                          <span>Placements: Ghuba + Store</span>
                          <span className="text-emerald-400 font-bold">Ready</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-emerald-300">
                        Campaign Draft Created & Submitted for Approval
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Total Budget: KES {budgetKES.toLocaleString()} • Estimated Reach: ~{Math.round(budgetKES / 0.05).toLocaleString()} impressions
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("campaigns")}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      View Campaigns
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Creatives & Placements */}
        {activeTab === "creatives" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 space-y-3">
              <div className="h-44 bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-700">
                <span className="text-xs text-slate-500 uppercase font-black tracking-wider">
                  GHUBA_HOMEPAGE_HERO
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full uppercase">
                  Featured
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Ghuba Homepage Hero Slider</h4>
              <p className="text-xs text-slate-400">
                High-visibility carousel at the top of Ghuba marketplace. Delivers maximum brand awareness and reach.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 space-y-3">
              <div className="h-44 bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-700">
                <span className="text-xs text-slate-500 uppercase font-black tracking-wider">
                  GHUBA_SEARCH_SPONSORED
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500 text-white font-black text-[9px] rounded-full uppercase">
                  Sponsored
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Ghuba Search Sponsored Row</h4>
              <p className="text-xs text-slate-400">
                Top positions in category searches when buyers search for your product category in Kenya.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 space-y-3">
              <div className="h-44 bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-700">
                <span className="text-xs text-slate-500 uppercase font-black tracking-wider">
                  STOREFRONT_HERO
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full uppercase">
                  Storefront
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Storefront Offers Banner</h4>
              <p className="text-xs text-slate-400">
                Promotional banner on your custom store domain highlighting current sales, bundles, and discounts.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Wallet & Ledger */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Ad Distribution Budget
                </p>
                <p className="text-3xl font-black text-white mt-1">
                  KES {wallet.balanceKES?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Dedicated ledger for ad impressions and clicks. Never mixed with AI compute credits.
                </p>
              </div>

              <button
                onClick={() => setShowTopUpModal(true)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Top Up with M-Pesa</span>
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/60 overflow-hidden">
              <div className="p-4 bg-slate-900/80 font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-slate-700">
                Ad Transaction History
              </div>
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-slate-300">
                  {wallet.transactions?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    wallet.transactions?.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="p-4 text-xs text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-xs font-bold">{tx.type}</td>
                        <td className="p-4 text-xs">{tx.description}</td>
                        <td
                          className={`p-4 font-bold ${
                            tx.amount > 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {tx.amount > 0 ? `+KES ${tx.amount.toLocaleString()}` : `-KES ${Math.abs(tx.amount).toLocaleString()}`}
                        </td>
                        <td className="p-4 text-xs font-bold text-emerald-400">
                          {tx.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Up Modal */}
        {showTopUpModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white">Top Up Ad Wallet</h3>
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Deposit advertising funds in KES. This balance is used exclusively to pay for impressions and clicks across Ghuba and Storefront placements.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Amount (KES)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        topUpAmount === amt
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-900 border-slate-700 text-slate-300"
                      }`}
                    >
                      KES {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  min={100}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="text"
                  value={topUpPhone}
                  onChange={(e) => setTopUpPhone(e.target.value)}
                  placeholder="e.g. 254712345678"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTopUp}
                  disabled={isTopUpProcessing}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isTopUpProcessing ? "Processing..." : `Pay KES ${topUpAmount.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
