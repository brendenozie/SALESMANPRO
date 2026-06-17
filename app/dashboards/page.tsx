"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  BuildingStorefrontIcon,
  ArrowRightIcon,
  ArrowLeftOnRectangleIcon,
  PlusIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CircleStackIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import fit1 from "@/assets/fit1.png";

// --- Custom Variants for Orchestrated Stagger Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// ------------------------------------------------------------------
// --- 1. PREMIUM SKELETON SCREEN LOADER ---
// ------------------------------------------------------------------
function WelcomeLoader() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden relative flex flex-col justify-between">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-orange-400/10 to-amber-400/10 dark:from-orange-500/5 dark:to-transparent rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/10 to-purple-400/10 dark:from-indigo-500/5 dark:to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      <div className="max-w-7xl w-full mx-auto p-6 md:p-12 relative z-10 flex-1 flex flex-col justify-center">
        {/* Top Navbar Skeleton */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-4">
            <div className="relative w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-900 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero Segment Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="h-14 w-3/4 bg-slate-300 dark:bg-slate-800 rounded-2xl animate-pulse" />
              <div className="h-14 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-2 max-w-sm pt-2">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="h-14 w-full sm:w-48 rounded-xl bg-slate-300 dark:bg-slate-800 animate-pulse" />
              <div className="h-14 w-full sm:w-36 rounded-xl bg-slate-200 dark:bg-slate-800/60 border border-transparent animate-pulse" />
            </div>
          </div>

          {/* Right Action Bento Skeleton Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-[1.75rem] p-6 min-h-[160px] flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="space-y-2 mt-4">
                  <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                  <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-900 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Fixed Blur Loading Track */}
      <div className="pb-8 flex justify-center w-full z-20">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-950/5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"
          />
          <span className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
            Assembling Workspace...
          </span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// --- 2. MAIN HUB INTERFACE PAGE ---
// ------------------------------------------------------------------
export default function WelcomePage() {
  const { data: session, status } = useSession();
  const [greeting, setGreeting] = useState("Welcome");

  const userName = session?.user?.name?.split(" ")[0] || "Operator";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const launchActions = [
    {
      title: "My Stores",
      desc: "Access active digital marketplace environments.",
      icon: <BuildingStorefrontIcon />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "hover:border-blue-500/30",
      href: "/stores",
    },
    {
      title: "Custom Gateways",
      desc: "Manage endpoints, webhooks and domains.",
      icon: <CircleStackIcon />,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "hover:border-purple-500/30",
      href: "#",
    },
    {
      title: "System Config",
      desc: "Calibrate localized core sales parameters.",
      icon: <WrenchScrewdriverIcon />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "hover:border-amber-500/30",
      href: "#",
    },
  ];

  // Force Loader view during session acquisition or invalid context boundaries
  if (status === "loading" || !session?.user?.name) {
    return <WelcomeLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans selection:bg-orange-500/20 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Structural Grid Overlay Background Elements */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full blur-3xl opacity-40 dark:opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl opacity-40 dark:opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12 flex flex-col justify-between min-h-screen relative z-10">
        {/* --- NAVBAR SECTOR --- */}
        <nav className="flex justify-between items-center mb-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <img
                src={fit1.src}
                alt="SalesmanPro System Logo"
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Salesman<span className="text-orange-600">Pro</span>
            </span>
          </div>

          <button
            onClick={() => { const returnTo = window.location.origin;
            signOut({
                redirect: true,
                callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
              })
            }}
            className="group flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all duration-200"
            title="Disconnect Terminal Session"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <ArrowLeftOnRectangleIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </nav>

        {/* --- MAIN HERO CORE GRID --- */}
        <main className="grid lg:grid-cols-12 gap-12 items-center my-auto">
          {/* Left Hero Segment */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Terminal Online
              </div>

              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[0.95] text-slate-950 dark:text-white">
                {greeting},
                <br />
                <span className="bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 dark:from-slate-400 dark:to-slate-600 bg-clip-text text-transparent">
                  {userName}.
                </span>
              </h1>

              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Your commerce ecosystem operational node is completely loaded. Select a system module framework or create a storefront deployment block to initiate execution loops.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/stores/create"
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-6 py-4 rounded-xl font-bold shadow-md shadow-orange-600/10 hover:shadow-orange-500/20 hover:shadow-lg active:scale-[0.99] transition-all group w-full sm:w-auto text-sm"
                >
                  <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                  <span>Launch New Store</span>
                  <ArrowRightIcon className="w-4 h-4 stroke-[2.5] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>

              {/* Cross-Platform Compiled Distribution Blocks */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-900">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-3">
                  Download Standalone Nodes
                </span>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://salesmanpro.site/download-desktop/SalesmanProDesktop.application"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-all shadow-sm"
                  >
                    <ComputerDesktopIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span>Desktop App</span>
                  </a>
                  <a
                    href="https://salesmanpro.site/download-mobile/app-release.apk"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-all shadow-sm"
                  >
                    <DevicePhoneMobileIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span>Mobile Android APK</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Architecture Bento Grid Segment */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* System Action Matrix Blocks */}
            {launchActions.map((action, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)",
                }}
                className={`group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between min-h-[170px] transition-all border-b-2 ${action.border}`}
              >
                <Link href={action.href} className="flex flex-col h-full justify-between">
                  <div
                    className={`w-12 h-12 ${action.bg} ${action.color} rounded-xl flex items-center justify-center mb-4 border border-transparent dark:border-slate-800`}
                  >
                    {React.cloneElement(action.icon, { className: "w-6 h-6 stroke-[1.8]" })}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                      {action.title}
                      <ArrowRightIcon className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-500" />
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 leading-normal">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Comprehensive Integrated Infrastructure Status Module */}
            <motion.div
              variants={itemVariants}
              className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-6 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wide uppercase">
                  <ShieldCheckIcon className="w-5 h-5 stroke-[2]" />
                  <span>All Clusters Optimal</span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight pt-1">
                  System Gateways Operational
                </h4>
                <p className="text-slate-400 text-xs max-w-sm leading-normal">
                  Distributed edge parameters, persistent proxy networks, and secure payment modules are executing cleanly.
                </p>
              </div>

              {/* Connected Active Nodes Badge Indicators */}
              <div className="flex items-center gap-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 self-stretch sm:self-auto justify-center">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-lg border border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black"
                    >
                      U{i}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] font-bold text-slate-300 px-1.5">
                  +12 Edge Nodes Active
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* --- DYNAMIC FOOTER FOOTPRINT --- */}
        <footer className="mt-12 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 font-medium gap-4">
          <p>© SalesmanPro Core Distribution Architecture Framework.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> API: v2.4.16
            </span>
            <span>Security Isolation: Active</span>
          </div>
        </footer>
      </div>
    </div>
  );
}