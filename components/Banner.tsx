"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  SparklesIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowRightIcon,
  PlayIcon,
  BoltIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  HomeModernIcon,
  TicketIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

// --- Rotating industries for the headline ---
const INDUSTRIES = [
  { label: "Retail", color: "text-orange-600 dark:text-orange-400" },
  { label: "Schools", color: "text-violet-600 dark:text-violet-400" },
  { label: "Real Estate", color: "text-sky-600 dark:text-sky-400" },
  { label: "Events", color: "text-rose-600 dark:text-rose-400" },
  { label: "Gyms", color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Hotels", color: "text-amber-600 dark:text-amber-400" },
  { label: "Logistics", color: "text-blue-600 dark:text-blue-400" },
];

// --- Cycling dashboard mockups per industry ---
const DASHBOARDS = [
  {
    industry: "Retail POS",
    icon: ShoppingBagIcon,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-950/80",
    border: "border-orange-200 dark:border-orange-800/50",
    metric1Label: "Today's Revenue",
    metric1Value: "KES 248,500",
    metric1Change: "↑ +18.4% vs yesterday",
    metric1ChangeColor: "text-emerald-600 dark:text-emerald-400",
    metric2Label: "Active POS Counters",
    metric2Value: "126",
    metric2Sub: "7 low-stock alerts",
    metric2SubColor: "text-orange-600 dark:text-orange-400",
    liveLabel: "Nike Air Max (Size 42)",
    liveSub: "Order #8921 · M-PESA KES 8,500",
  },
  {
    industry: "School Fees",
    icon: AcademicCapIcon,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-950/80",
    border: "border-violet-200 dark:border-violet-800/50",
    metric1Label: "Fees Collected Today",
    metric1Value: "KES 182,000",
    metric1Change: "↑ 94 students cleared",
    metric1ChangeColor: "text-emerald-600 dark:text-emerald-400",
    metric2Label: "Outstanding Balance",
    metric2Value: "38",
    metric2Sub: "Parents notified via WhatsApp",
    metric2SubColor: "text-violet-600 dark:text-violet-400",
    liveLabel: "Term 3 Fee · James Mwangi",
    liveSub: "Admission #2041 · M-PESA KES 14,500",
  },
  {
    industry: "Real Estate",
    icon: HomeModernIcon,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-950/80",
    border: "border-sky-200 dark:border-sky-800/50",
    metric1Label: "Active Listings",
    metric1Value: "312",
    metric1Change: "↑ 14 new this week",
    metric1ChangeColor: "text-emerald-600 dark:text-emerald-400",
    metric2Label: "Viewing Requests",
    metric2Value: "47",
    metric2Sub: "19 from WhatsApp AI",
    metric2SubColor: "text-sky-600 dark:text-sky-400",
    liveLabel: "3BR Kilimani Apartment",
    liveSub: "Inquiry via WhatsApp · KES 85,000/mo",
  },
  {
    industry: "Events & Tickets",
    icon: TicketIcon,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-950/80",
    border: "border-rose-200 dark:border-rose-800/50",
    metric1Label: "Tickets Sold",
    metric1Value: "1,840",
    metric1Change: "↑ 340 in last 2 hours",
    metric1ChangeColor: "text-emerald-600 dark:text-emerald-400",
    metric2Label: "Gate Capacity",
    metric2Value: "78%",
    metric2Sub: "Scanning active at 3 gates",
    metric2SubColor: "text-rose-600 dark:text-rose-400",
    liveLabel: "VIP Table · Nairobi Jazz Night",
    liveSub: "Ticket #TK-0482 · M-PESA KES 4,200",
  },
  {
    industry: "Delivery & Fleet",
    icon: TruckIcon,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-950/80",
    border: "border-blue-200 dark:border-blue-800/50",
    metric1Label: "Deliveries Today",
    metric1Value: "284",
    metric1Change: "↑ 96.4% on-time rate",
    metric1ChangeColor: "text-emerald-600 dark:text-emerald-400",
    metric2Label: "Active Drivers",
    metric2Value: "31",
    metric2Sub: "4 pending assignment",
    metric2SubColor: "text-blue-600 dark:text-blue-400",
    liveLabel: "Package · Westlands → CBD",
    liveSub: "Driver: John K. · ETA 14 mins",
  },
];

// --- Live activity notifications ---
const ACTIVITIES = [
  { icon: "💳", msg: "M-PESA confirmed · KES 3,200", sub: "2s ago · Nairobi" },
  { icon: "🎓", msg: "School fee received · KES 14,500", sub: "11s ago · Kisumu" },
  { icon: "🏠", msg: "Property viewed · 2BR Westlands", sub: "23s ago · WhatsApp" },
  { icon: "🎟️", msg: "Event ticket sold · Jazz Night VIP", sub: "38s ago · M-PESA" },
  { icon: "📦", msg: "Delivery completed · Westlands", sub: "52s ago · Fleet" },
];

export default function HeroSection() {
  const { data: session } = useSession();

  // Rotating industry word
  const [industryIdx, setIndustryIdx] = useState(0);
  // Cycling dashboard
  const [dashIdx, setDashIdx] = useState(0);
  const [orderState, setOrderState] = useState<"processing" | "confirmed">("processing");
  // Live activity notifications
  const [activityIdx, setActivityIdx] = useState(0);

  useEffect(() => {
    // Industry word rotates every 2.4s
    const ind = setInterval(() => {
      setIndustryIdx((p) => (p + 1) % INDUSTRIES.length);
    }, 2400);
    return () => clearInterval(ind);
  }, []);

  useEffect(() => {
    // Dashboard cycles every 4s
    const dash = setInterval(() => {
      setDashIdx((p) => (p + 1) % DASHBOARDS.length);
      setOrderState("processing");
      setTimeout(() => setOrderState("confirmed"), 2000);
    }, 4000);
    return () => clearInterval(dash);
  }, []);

  useEffect(() => {
    // Activity notification rotates every 3s
    const act = setInterval(() => {
      setActivityIdx((p) => (p + 1) % ACTIVITIES.length);
    }, 3000);
    return () => clearInterval(act);
  }, []);

  const handleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  const currentDash = DASHBOARDS[dashIdx];
  const DashIcon = currentDash.icon;
  const currentActivity = ACTIVITIES[activityIdx];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[560px] bg-gradient-to-tr from-orange-500/10 via-amber-400/8 to-violet-500/5 dark:from-orange-600/10 dark:via-amber-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute -bottom-10 left-0 w-full h-32 bg-gradient-to-t from-slate-100 dark:from-slate-950 to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

        {/* ─── Left Column ─── */}
        <div className="lg:col-span-7 space-y-7 text-center lg:text-left">

          {/* 1. Announcement Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wider shadow-sm mx-auto lg:mx-0"
          >
            <SparklesIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>AI-powered · 8 Industries · M-PESA Native</span>
          </motion.div>

          {/* 2. Rotating Industry Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-black tracking-tight leading-[1.05]">
              Run your{" "}
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={industryIdx}
                    initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className={`${INDUSTRIES[industryIdx].color} inline-block`}
                  >
                    {INDUSTRIES[industryIdx].label}
                  </motion.span>
                </AnimatePresence>
              </span>
              {" "}business.
              <br />
              Sell everywhere.{" "}
              <span className="text-orange-600 dark:text-orange-400">
                Automate with AI.
              </span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0"
          >
            One platform for POS, inventory, WhatsApp AI agents, M-PESA payments, staff management, and custom storefronts — built for every industry in Africa.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            {!session ? (
              <button
                onClick={handleSignIn}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Start Free Trial — 14 Days</span>
                <ArrowRightIcon className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <Link
                href="/dashboards"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>View Dashboard</span>
              </Link>
            )}

            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlayIcon className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>See How It Works</span>
            </a>
          </motion.div>

          {/* 3. Social Proof Stat Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="pt-1 grid grid-cols-3 gap-4 max-w-sm mx-auto lg:mx-0"
          >
            {[
              { value: "12,400+", label: "Businesses" },
              { value: "KES 4.2B", label: "Processed" },
              { value: "99.1%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <p className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap justify-center lg:justify-start gap-5 text-xs font-bold text-slate-500 dark:text-slate-400"
          >
            <span className="flex items-center gap-1.5">
              <BoltIcon className="w-4 h-4 text-orange-500 flex-shrink-0" /> Instant M-PESA STK Push
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-orange-500 flex-shrink-0" /> 8+ Industry Modules
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-orange-500 flex-shrink-0" /> Real-time POS &amp; Inventory
            </span>
          </motion.div>

        </div>

        {/* ─── Right Column: Cycling Dashboard Mockup ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          {/* Main Dashboard Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative z-10 space-y-5">

            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono font-medium text-slate-400 dark:text-slate-500">SalesmanPro OS · </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={dashIdx}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400"
                  >
                    {currentDash.industry}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>

            {/* 4. Cycling metrics */}
            <AnimatePresence mode="wait">
              <motion.div
                key={dashIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                {/* Metric grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{currentDash.metric1Label}</span>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{currentDash.metric1Value}</p>
                    <span className={`text-[10px] font-extrabold flex items-center gap-1 mt-0.5 ${currentDash.metric1ChangeColor}`}>
                      {currentDash.metric1Change}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{currentDash.metric2Label}</span>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{currentDash.metric2Value}</p>
                    <span className={`text-[10px] font-extrabold mt-0.5 block ${currentDash.metric2SubColor}`}>
                      {currentDash.metric2Sub}
                    </span>
                  </div>
                </div>

                {/* Live transaction row */}
                <div className="bg-slate-50 dark:bg-slate-950/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${currentDash.bg} ${currentDash.color} flex items-center justify-center flex-shrink-0 border ${currentDash.border}`}>
                      <DashIcon className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentDash.liveLabel}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">{currentDash.liveSub}</p>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={orderState}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex-shrink-0 ${
                        orderState === "confirmed"
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse"
                      }`}
                    >
                      {orderState === "confirmed" ? "Confirmed ✓" : "Verifying..."}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dashboard tab dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {DASHBOARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDashIdx(i); setOrderState("processing"); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === dashIdx
                      ? "w-5 h-1.5 bg-orange-500"
                      : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-orange-400"
                  }`}
                  aria-label={`Switch to ${DASHBOARDS[i].industry}`}
                />
              ))}
            </div>
          </div>

          {/* 5. Floating Live Activity Notification */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 z-20 w-72 bg-white/95 dark:bg-slate-900/95 border border-orange-200 dark:border-orange-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md hidden sm:block"
          >
            <div className="flex items-center gap-2 mb-2.5 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-orange-500" />
              <span>Live Activity</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activityIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3"
              >
                <span className="text-lg flex-shrink-0">{currentActivity.icon}</span>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    {currentActivity.msg}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    {currentActivity.sub}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}