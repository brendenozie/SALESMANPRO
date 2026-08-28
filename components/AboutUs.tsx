"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  {
    id: "ai-studio",
    label: "AI Studio & Agents",
    icon: <CpuChipIcon className="w-4 h-4" />,
    title: "Meet the AI that actually knows your catalog.",
    description:
      "Unlike generic chatbots, SalesmanPro AI reads live inventory, pricing, and business policies to generate product descriptions, marketing campaigns, and close sales automatically.",
    metrics: [
      { label: "Content Generation", value: "Text, Image & Reel Studio" },
      { label: "Catalog Sync", value: "Real-Time Stock Querying" },
      { label: "Execution", value: "Autonomous Sales Agents" },
    ],
  },
  {
    id: "whatsapp",
    label: "WhatsApp Commerce",
    icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />,
    title: "Turn WhatsApp conversations into completed orders.",
    description:
      "Automate buyer inquiries over WhatsApp. The AI shares product catalogs, captures customer orders, triggers M-PESA STK Push requests, and verifies payments instantly.",
    metrics: [
      { label: "Checkout Engine", value: "Direct Link Generation" },
      { label: "Payment Verification", value: "Instant M-PESA Push" },
      { label: "Fulfillment Route", value: "Auto-Courier Booking" },
    ],
  },
  {
    id: "pos-inventory",
    label: "POS & Operations",
    icon: <BuildingStorefrontIcon className="w-4 h-4" />,
    title: "Run physical and digital channels from one ledger.",
    description:
      "Whether selling in-store or online, keep inventory synchronized. Manage barcode scanning, low-stock warnings, and multi-location management without manual count discrepancies.",
    metrics: [
      { label: "Counter POS", value: "Barcode & Quick Pay" },
      { label: "Stock Alerts", value: "Automated Low Thresholds" },
      { label: "Multi-Store", value: "Unified Ledger Sync" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Profitability",
    icon: <ChartBarIcon className="w-4 h-4" />,
    title: "Real-time visibility into actual margins.",
    description:
      "Calculate true profit margins automatically based on item acquisition cost, active discounts, delivery fees, and tax structures.",
    metrics: [
      { label: "Margin Tracking", value: "Auto Profit-Calculated" },
      { label: "Sales Breakdown", value: "By Channel & Agent" },
      { label: "Customer Insights", value: "Lifetime Value Scoring" },
    ],
  },
];

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState("ai-studio");

  const activeContent = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <section id="platform" className="py-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-3.5 py-1 rounded-full border border-orange-200 dark:border-orange-800/40 inline-block mb-3">
            Interactive Product Preview
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            One Operating System. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 dark:from-orange-400 dark:to-amber-300">
              Zero Manual Back & Forth.
            </span>
          </h2>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20 scale-105"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Content Visual Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 shadow-2xl backdrop-blur-xl"
          >
            {/* Left Narrative Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {activeContent.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                {activeContent.description}
              </p>

              <div className="space-y-3 pt-2">
                {activeContent.metrics.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{m.label}</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Mock UI Stage */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">
                    Active Module: {activeTab}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Live Workspace Sync</span>
              </div>

              {/* Dynamic UI Render simulation based on tab */}
              {activeTab === "ai-studio" && (
                <div className="space-y-4 text-xs text-left">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                    <span className="text-slate-400 font-mono text-[10px]">AI MARKETING STUDIO</span>
                    <div className="text-slate-900 dark:text-white font-bold">Generate Promo Campaign: Summer Collection</div>
                    <div className="flex gap-2 pt-2">
                      <span className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-mono text-[10px] border border-orange-200 dark:border-orange-800/40">Instagram Ad Copy ✓</span>
                      <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[10px] border border-amber-200 dark:border-amber-800/40">SEO Meta Tags ✓</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-sm">
                    &quot;Elevate your look with our premium collection. Instant checkout available via M-PESA!&quot;
                  </div>
                </div>
              )}

              {activeTab === "whatsapp" && (
                <div className="space-y-3 text-xs text-left">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                    ✓ Customer opted-in for SMS & WhatsApp receipt notifications.
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
                    <div className="text-slate-400 dark:text-slate-500 text-[10px]">AUTOMATED REPLY</div>
                    &quot;Your order #8402 has been confirmed! Courier dispatch queued for Nairobi delivery.&quot;
                  </div>
                </div>
              )}

              {activeTab === "pos-inventory" && (
                <div className="space-y-3 text-xs text-left">
                  <div className="flex justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-slate-800 dark:text-slate-200">Main Store POS Counter</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Terminal Active</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-slate-900 dark:text-white font-bold">Leather Boots (Size 43)</div>
                      <div className="text-slate-400 dark:text-slate-500 text-[10px]">SKU: LTH-BTS-43</div>
                    </div>
                    <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">In Stock: 4</span>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="space-y-4 text-xs text-left">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-slate-500 dark:text-slate-400">Gross Margin</div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">42.8%</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-slate-500 dark:text-slate-400">Net Profit</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">KES 104,200</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}