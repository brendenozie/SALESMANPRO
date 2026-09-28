"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BoltIcon,
  QrCodeIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  {
    id: "ai-studio",
    label: "AI Studio & Agents",
    icon: CpuChipIcon,
    badge: "Autonomous AI",
    title: "Meet the AI agent that actually knows your inventory catalog.",
    description:
      "Unlike generic chatbots, SalesmanPro AI reads your live stock levels, custom tier pricing, and return policies to draft high-converting ad copy, generate product images, and close sales autonomously.",
    metrics: [
      { label: "Content Generation", value: "Text, Image & Reel Studio" },
      { label: "Catalog Sync", value: "Real-Time Stock Querying" },
      { label: "Execution", value: "Autonomous Sales Agents" },
    ],
  },
  {
    id: "whatsapp",
    label: "WhatsApp Commerce",
    icon: ChatBubbleLeftRightIcon,
    badge: "Native M-PESA",
    title: "Turn WhatsApp conversations into instant completed orders.",
    description:
      "Automate customer inquiries over WhatsApp. The AI shares visual product catalogs, captures order details, triggers M-PESA STK Push requests directly to the buyer's phone, and verifies payment in seconds.",
    metrics: [
      { label: "Checkout Engine", value: "Direct Link & STK Generation" },
      { label: "Payment Verification", value: "Instant M-PESA Settlement" },
      { label: "Fulfillment Route", value: "Automated Courier Dispatch" },
    ],
  },
  {
    id: "pos-inventory",
    label: "POS & Operations",
    icon: BuildingStorefrontIcon,
    badge: "Omnichannel Sync",
    title: "Run physical counters and digital channels from one ledger.",
    description:
      "Whether selling in-store via thermal receipt printers or online through custom storefronts, keep inventory synchronized instantly. Prevent stockouts with automated low-threshold warnings across multiple locations.",
    metrics: [
      { label: "Counter POS", value: "Barcode & ESC/POS Print" },
      { label: "Stock Alerts", value: "Automated Low-Stock Thresholds" },
      { label: "Multi-Store Sync", value: "Unified Single Ledger" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Profitability",
    icon: ChartBarIcon,
    badge: "Real-Time Margins",
    title: "Complete real-time visibility into your true profit margins.",
    description:
      "Calculate actual net profit automatically by factoring item acquisition cost, promotional discounts, M-PESA transaction charges, delivery fees, and tax structures per sales channel.",
    metrics: [
      { label: "Margin Tracking", value: "Auto Net Profit Breakdown" },
      { label: "Sales Breakdown", value: "By Store, Channel & AI Agent" },
      { label: "Customer Insights", value: "Lifetime Value Scoring" },
    ],
  },
];

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState("ai-studio");

  const activeContent = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const ActiveIcon = activeContent.icon;

  return (
    <section id="platform" className="py-24 lg:py-32 bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      
      {/* Background Technical Grid and Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-4"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-orange-500" />
            <span>Interactive Product Tour</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]"
          >
            One Operating System. <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Zero Manual Back & Forth.
            </span>
          </motion.h2>
        </div>

        {/* Tab Selection Bar with Sliding Active Background */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-10 max-w-4xl mx-auto">
          <div className="flex p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : "text-slate-400"}`} />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Content Visual Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch bg-white/90 dark:bg-[#0E131F]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl"
          >
            {/* Left Narrative Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <ActiveIcon className="w-3.5 h-3.5" />
                  <span>{activeContent.badge}</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {activeContent.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base font-normal">
                  {activeContent.description}
                </p>
              </div>

              {/* Metric Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {activeContent.metrics.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-100 dark:border-slate-800/80 text-xs"
                  >
                    <span className="text-slate-500 font-semibold">{m.label}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-orange-500" />
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Mock UI Stage */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-[#080B12] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-7 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
              
              {/* Mock Window Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 ml-2">
                    module://{activeTab}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Live Simulation</span>
                </div>
              </div>

              {/* Dynamic UI Render simulation based on active tab */}
              <div className="flex-1 flex flex-col justify-center">
                {activeTab === "ai-studio" && (
                  <div className="space-y-4 text-xs">
                    {/* Prompt Box */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#131927] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>AI CONTENT & CAMPAIGN AGENT</span>
                        <span className="text-orange-500 font-bold">Catalog Connected ✓</span>
                      </div>
                      <div className="text-slate-900 dark:text-white font-bold">
                        &quot;Create a social campaign for our Wireless Earphones in stock with a 10% flash discount.&quot;
                      </div>
                    </div>

                    {/* AI Streamed Response */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 text-slate-800 dark:text-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                          <BoltIcon className="w-3 h-3" /> AGENT OUTPUT GENERATED
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">0.4s speed</span>
                      </div>
                      <p className="font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        &quot;🎧 Upgrade your audio! Get the SoundX Wireless Earphones today for KES 3,600 (Was KES 4,000). Limited inventory remaining. Tap link to buy via M-PESA!&quot;
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                          + Multi-channel Links
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          + Stock Level (24 left)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "whatsapp" && (
                  <div className="space-y-3 text-xs max-w-lg mx-auto w-full">
                    {/* Incoming Chat Message */}
                    <div className="flex gap-2.5 items-end">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                        CU
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-bl-none bg-white dark:bg-[#131927] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm max-w-[85%]">
                        <p className="font-medium">Hi! Do you have the Kilimani 2BR apartment available for viewing tomorrow?</p>
                        <span className="text-[9px] text-slate-400 font-mono mt-1 block">10:42 AM</span>
                      </div>
                    </div>

                    {/* AI Agent Automated Reply */}
                    <div className="flex gap-2.5 items-end justify-end">
                      <div className="p-3.5 rounded-2xl rounded-br-none bg-emerald-600 text-white shadow-md max-w-[85%] space-y-2">
                        <p className="font-medium">
                          Hello! Yes, unit B4 is open for viewing. I can schedule a slot with our agent right now. Shall I send an M-PESA STK Push for the KES 1,000 viewing deposit?
                        </p>
                        <div className="p-2.5 rounded-xl bg-emerald-700/60 border border-emerald-500/40 text-[11px] flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1">
                            <BanknotesIcon className="w-3.5 h-3.5" /> M-PESA Push Triggered
                          </span>
                          <span className="font-mono bg-emerald-800/80 px-1.5 py-0.5 rounded text-[9px] font-bold">STK SENT</span>
                        </div>
                        <span className="text-[9px] text-emerald-200 font-mono block text-right">10:42 AM · Automated by AI Agent</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "pos-inventory" && (
                  <div className="space-y-3 text-xs">
                    {/* Active POS Counter Header */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#131927] border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center gap-2">
                        <ShoppingCartIcon className="w-4 h-4 text-orange-500" />
                        <span className="font-bold text-slate-900 dark:text-white">Counter POS Terminal #01</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                        Online & Syncing
                      </span>
                    </div>

                    {/* Scanned Items Table Simulation */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#131927] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400">
                        <span>SCANNED ITEM</span>
                        <span>QTY / STOCK</span>
                        <span>PRICE</span>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <div className="flex items-center gap-2">
                          <QrCodeIcon className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-slate-900 dark:text-white font-bold">Nike Air Max (Size 42)</div>
                            <div className="text-[10px] text-slate-400 font-mono">SKU-NK-AM42</div>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          1x (3 Left)
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">KES 8,500</span>
                      </div>
                    </div>

                    {/* Quick Pay Action Row */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                        <BoltIcon className="w-4 h-4" />
                        <span>M-PESA Express</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-2">
                        <span>Print Receipt (ESC/POS)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="space-y-4 text-xs">
                    {/* Top Key Performance Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#131927] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Gross Sales</span>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">KES 248.5K</div>
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-0.5">
                          <ArrowTrendingUpIcon className="w-3 h-3" /> +18.4%
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#131927] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Net Profit</span>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">KES 104.2K</div>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">42.0% Margin</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#131927] border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Top Channel</span>
                        <div className="text-xl font-black text-orange-500 mt-1">WhatsApp AI</div>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">64% Total Volume</span>
                      </div>
                    </div>

                    {/* Profit Deduction Ledger Simulation */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#131927] border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                        <span>AUTOMATED PROFIT DEDUCTION BREAKDOWN</span>
                        <span>CALCULATED REAL-TIME</span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Gross Revenue Collected</span>
                          <span className="font-bold text-slate-900 dark:text-white">KES 248,500</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>- Cost of Goods Sold (COGS)</span>
                          <span className="font-mono text-rose-500">- KES 124,000</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>- M-PESA & Courier Gateway Fees</span>
                          <span className="font-mono text-rose-500">- KES 20,300</span>
                        </div>
                        <div className="flex justify-between text-slate-900 dark:text-white font-extrabold pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span>Calculated Net Margin</span>
                          <span className="text-emerald-500 font-mono">KES 104,200</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Action */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs mt-4">
                <span className="text-slate-500 font-medium">Ready to test this module?</span>
                <a 
                  href="#interactive-demo"
                  className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center gap-1 group"
                >
                  <span>Launch Live Workspace</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}