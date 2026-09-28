"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  SparklesIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  PlayIcon,
  BoltIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  HomeModernIcon,
  TicketIcon,
  TruckIcon,
  DevicePhoneMobileIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// --- Rotating industries for the headline ---
const INDUSTRIES = [
  { label: "Retail", accent: "text-orange-500" },
  { label: "Schools", accent: "text-violet-500" },
  { label: "Real Estate", accent: "text-sky-500" },
  { label: "Events", accent: "text-rose-500" },
  { label: "Gyms", accent: "text-emerald-500" },
  { label: "Hotels", accent: "text-amber-500" },
  { label: "Logistics", accent: "text-blue-500" },
];

// --- Rich dashboard mockups per industry ---
const DASHBOARDS = [
  {
    industry: "Retail POS",
    icon: ShoppingBagIcon,
    accentColor: "from-orange-500 to-amber-500",
    pillBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    metric1Label: "Today's Revenue",
    metric1Value: "KES 248,500",
    metric1Change: "+18.4% vs yesterday",
    metric2Label: "Active Counters",
    metric2Value: "12 / 12",
    metric2Sub: "All terminals online",
    liveLabel: "Nike Air Max (Size 42)",
    liveSub: "Order #8921 · M-PESA STK Push",
    liveAmount: "KES 8,500",
  },
  {
    industry: "School Fees",
    icon: AcademicCapIcon,
    accentColor: "from-violet-500 to-purple-600",
    pillBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    metric1Label: "Fees Collected Today",
    metric1Value: "KES 182,000",
    metric1Change: "94 students cleared",
    metric2Label: "Outstanding Balances",
    metric2Value: "38 Parents",
    metric2Sub: "Automated SMS reminders sent",
    liveLabel: "Term 3 Tuition · James Mwangi",
    liveSub: "Admission #2041 · Paybill 400200",
    liveAmount: "KES 14,500",
  },
  {
    industry: "Real Estate",
    icon: HomeModernIcon,
    accentColor: "from-sky-500 to-blue-600",
    pillBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    metric1Label: "Occupancy Rate",
    metric1Value: "96.2%",
    metric1Change: "+4 units filled this month",
    metric2Label: "Active Listings",
    metric2Value: "312 Units",
    metric2Sub: "19 WhatsApp viewing requests",
    liveLabel: "3BR Apartment · Kilimani",
    liveSub: "Lease Renewal · Rent Deposit",
    liveAmount: "KES 85,000",
  },
  {
    industry: "Events & Tickets",
    icon: TicketIcon,
    accentColor: "from-rose-500 to-pink-600",
    pillBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    metric1Label: "Tickets Issued",
    metric1Value: "1,840 Pass",
    metric1Change: "340 sold last 2 hrs",
    metric2Label: "Gate Capacity",
    metric2Value: "78%",
    metric2Sub: "QR scanning active at Gates A, B, C",
    liveLabel: "VIP Table · Nairobi Jazz Night",
    liveSub: "Instant E-Ticket #TK-0482",
    liveAmount: "KES 4,200",
  },
  {
    industry: "Delivery & Fleet",
    icon: TruckIcon,
    accentColor: "from-blue-500 to-indigo-600",
    pillBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    metric1Label: "Deliveries Completed",
    metric1Value: "284 Orders",
    metric1Change: "96.4% on-time dispatch",
    metric2Label: "Active Riders",
    metric2Value: "31 Drivers",
    metric2Sub: "4 unassigned trips pending",
    liveLabel: "Parcel · Westlands to CBD",
    liveSub: "Rider: John K. · ETA 12 mins",
    liveAmount: "KES 650",
  },
];

// --- Real-time Activity Feed ---
const ACTIVITIES = [
  { title: "M-PESA Payment Received", desc: "KES 3,200 confirmed via Till #8849", time: "Just now" },
  { title: "WhatsApp AI Lead Converted", desc: "Customer booked viewing for Kilimani 2BR", time: "14s ago" },
  { title: "Stock Alert Resolved", desc: "SKU-992 automatically reordered", time: "1m ago" },
];

export default function HeroSection() {
  const { data: session } = useSession();

  const [industryIdx, setIndustryIdx] = useState(0);
  const [dashIdx, setDashIdx] = useState(0);
  const [orderState, setOrderState] = useState<"processing" | "confirmed">("processing");
  const [activityIdx, setActivityIdx] = useState(0);

  // Auto-cycle Rotating Headline
  useEffect(() => {
    const ind = setInterval(() => {
      setIndustryIdx((p) => (p + 1) % INDUSTRIES.length);
    }, 2800);
    return () => clearInterval(ind);
  }, []);

  // Auto-cycle Interactive Dashboard
  useEffect(() => {
    const dash = setInterval(() => {
      setDashIdx((p) => (p + 1) % DASHBOARDS.length);
      setOrderState("processing");
      setTimeout(() => setOrderState("confirmed"), 1800);
    }, 5000);
    return () => clearInterval(dash);
  }, []);

  // Auto-cycle Toast Notifications
  useEffect(() => {
    const act = setInterval(() => {
      setActivityIdx((p) => (p + 1) % ACTIVITIES.length);
    }, 3600);
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
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 px-6 lg:px-12 bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">

      {/* Background Lighting and Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-transparent dark:from-orange-500/15 dark:via-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center relative z-10">

        {/* ─── Left Column: Headline & Messaging ─── */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">

          {/* Overline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md"
          >
            <span>AI Powered Multi-Tenant Operating System</span>
          </motion.div>

          {/* Headline with Strict Grid Stacking to eliminate layout shift */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-6xl lg:text-[4rem] font-black tracking-tight leading-[1.08]">
              Manage your{" "}
              <span className="inline-grid relative text-orange-600 dark:text-orange-500">
                {/* Phantom element forces the grid cell width to accommodate the maximum word width */}
                {INDUSTRIES.map((ind) => (
                  <span
                    key={ind.label}
                    className="col-start-1 row-start-1 invisible pointer-events-none select-none pr-1"
                    aria-hidden="true"
                  >
                    {ind.label}
                  </span>
                ))}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={industryIdx}
                    initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="col-start-1 row-start-1 pr-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent"
                  >
                    {INDUSTRIES[industryIdx].label}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br />
              business operations.
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            Streamline retail POS, school fee collection, inventory, real estate inquiries, and M-PESA reconciliation into one automated intelligent dashboard.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            {!session ? (
              <button
                onClick={handleSignIn}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Start Free Trial</span>
                <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <Link
                href="/dashboards"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Go to Workspace</span>
                <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
              </Link>
            )}

            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-900 dark:text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm"
            >
              <PlayIcon className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>Explore Live Platform</span>
            </a>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            <div className="flex items-center gap-2">
              <BoltIcon className="w-4 h-4 text-orange-500" />
              <span>Instant STK Push</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-orange-500" />
              <span>Bank-Grade Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-orange-500" />
              <span>99.9% Uptime Guarantee</span>
            </div>
          </motion.div>

        </div>

        {/* ─── Right Column: Interactive Modern Glass Dashboard ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-6 relative w-full max-w-2xl mx-auto lg:mr-0"
        >
          {/* Dashboard Container with Glassmorphism */}
          <div className="relative bg-white/90 dark:bg-[#0E131F]/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-7 overflow-hidden space-y-6">

            {/* Top Workspace Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">SalesmanPro Operating System</div>
                  <div className="text-[10px] text-slate-500 font-medium">Enterprise Suite v4.2</div>
                </div>
              </div>

              {/* Active Module Indicator */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={dashIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${currentDash.pillBg}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {currentDash.industry}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Interactive Industry Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {DASHBOARDS.map((dash, i) => (
                <button
                  key={dash.industry}
                  onClick={() => {
                    setDashIdx(i);
                    setOrderState("processing");
                    setTimeout(() => setOrderState("confirmed"), 1200);
                  }}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${i === dashIdx
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                >
                  {dash.industry}
                </button>
              ))}
            </div>

            {/* Cycling Metrics Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={dashIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{currentDash.metric1Label}</span>
                      <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                      {currentDash.metric1Value}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      {currentDash.metric1Change}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{currentDash.metric2Label}</span>
                      <ClockIcon className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                      {currentDash.metric2Value}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">
                      {currentDash.metric2Sub}
                    </div>
                  </div>
                </div>

                {/* Live Activity Row */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131927] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentDash.accentColor} text-white flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <DashIcon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentDash.liveLabel}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {currentDash.liveSub}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {currentDash.liveAmount}
                    </div>
                    <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded mt-1 ${orderState === "confirmed"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 animate-pulse"
                      }`}>
                      {orderState === "confirmed" ? "Verified ✓" : "Processing..."}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Floating Toast Notification */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 -left-6 z-20 w-72 bg-white dark:bg-[#131927] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 shadow-xl hidden sm:block"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <DevicePhoneMobileIcon className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live Automation Feed</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activityIdx}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentActivity.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {currentActivity.desc}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}