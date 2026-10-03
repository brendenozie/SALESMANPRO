"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TruckIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ClockIcon,
  CheckBadgeIcon,
  MapPinIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function RiderJoinPage() {
  const [dailyDeliveries, setDailyDeliveries] = useState(8);
  const avgFeePerTrip = 250;
  const estimatedDaily = dailyDeliveries * avgFeePerTrip;
  const estimatedMonthly = estimatedDaily * 26;

  const vehicleCategories = [
    {
      type: "Motorbike (Boda Boda)",
      desc: "Fast urban deliveries, agile navigation, highest volume of retail & food parcels.",
      badge: "Most Popular",
      icon: "🛵",
      lightColors: "bg-amber-50 border-amber-200",
      darkColors: "dark:bg-amber-500/10 dark:border-amber-500/30",
      badgeColor: "bg-amber-500 text-white",
    },
    {
      type: "Bicycle Courier",
      desc: "Zero fuel costs, ideal for central business districts, campuses and short-distance drops.",
      badge: "Eco-Friendly",
      icon: "🚲",
      lightColors: "bg-emerald-50 border-emerald-200",
      darkColors: "dark:bg-emerald-500/10 dark:border-emerald-500/30",
      badgeColor: "bg-emerald-500 text-white",
    },
    {
      type: "Car Driver",
      desc: "Weatherproof transport, multiple orders per trip, high-value electronics and fragile items.",
      badge: "High Value",
      icon: "🚗",
      lightColors: "bg-blue-50 border-blue-200",
      darkColors: "dark:bg-blue-500/10 dark:border-blue-500/30",
      badgeColor: "bg-blue-500 text-white",
    },
    {
      type: "Van / Pickup",
      desc: "Bulk wholesale orders, store restocks, furniture, and heavy appliance dispatches.",
      badge: "Bulk Cargo",
      icon: "🚐",
      lightColors: "bg-purple-50 border-purple-200",
      darkColors: "dark:bg-purple-500/10 dark:border-purple-500/30",
      badgeColor: "bg-purple-500 text-white",
    },
  ];

  const onboardingSteps = [
    {
      step: "01",
      title: "Quick Registration",
      desc: "Provide your basic details, phone number, and operating county.",
    },
    {
      step: "02",
      title: "ID & License Verification",
      desc: "Upload photo of your National ID/Passport and valid Driving License.",
    },
    {
      step: "03",
      title: "Vehicle Details",
      desc: "Add your vehicle registration plate and optional insurance details.",
    },
    {
      step: "04",
      title: "Activate & Earn",
      desc: "Once verified by super admins, toggle online to receive live delivery requests.",
    },
  ];

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white font-sans selection:bg-amber-500 selection:text-zinc-950 transition-colors duration-300">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-400/20 dark:from-amber-500/15 via-orange-400/10 dark:via-orange-500/5 to-transparent blur-3xl rounded-full transition-colors duration-300" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-amber-400/10 dark:bg-amber-600/10 blur-3xl rounded-full transition-colors duration-300" />
        <div className="absolute top-2/3 -right-40 w-96 h-96 bg-orange-400/10 dark:bg-orange-600/10 blur-3xl rounded-full transition-colors duration-300" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Breadcrumb & Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-zinc-800/80"
        >
          <Link
            href="/"
            className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            ← Back to Marketplace
          </Link>
          <Link
            href="/ghuba/rider/dashboard"
            className="text-xs font-bold px-4 py-2 rounded-full bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-zinc-700 shadow-sm transition-all flex items-center gap-1"
          >
            Rider Portal <ChevronRightIcon className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* HERO SECTION */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
        >
          <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
            <SparklesIcon className="w-4 h-4" />
            Ghuba Rider Network
          </motion.div>
          
          <motion.h1 variants={fadeUpVariant} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] mb-6">
            Turn Your Wheels into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-500">
              Daily Guaranteed Earnings
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUpVariant} className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed mb-8 max-w-2xl mx-auto">
            Connect with thousands of verified stores in your county.
            Deliver retail orders, groceries, electronics, and parcels with instant M-Pesa payouts.
          </motion.p>

          <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ghuba/rider/onboarding"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Become a Rider <ArrowRightIcon className="w-4 h-4 stroke-[3]" />
            </Link>
            <Link
              href="/ghuba/rider/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-zinc-900/90 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-white font-bold text-sm border border-slate-200 dark:border-zinc-700/80 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Access Dashboard
            </Link>
          </motion.div>

          <motion.div variants={fadeUpVariant} className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5 bg-white/50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800">
              <CheckBadgeIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Fast 24hr Verification</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800">
              <BanknotesIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Direct M-Pesa Payouts</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800">
              <ShieldCheckIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>Verified Merchants</span>
            </div>
          </motion.div>
        </motion.div>

        {/* EARNINGS CALCULATOR */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 mb-20 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Decorative background element for calculator */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                Interactive Calculator
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Calculate your earning potential
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                You keep your agreed delivery fee. Stores publish deliveries with fixed rates or open bidding where you quote your price.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-700 dark:text-zinc-300">Deliveries Per Day:</span>
                  <span className="text-amber-600 dark:text-amber-400 text-2xl font-black bg-amber-50 dark:bg-amber-500/10 px-4 py-1 rounded-lg border border-amber-100 dark:border-amber-500/20">
                    {dailyDeliveries}
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={dailyDeliveries}
                  onChange={(e) => setDailyDeliveries(Number(e.target.value))}
                  className="w-full accent-amber-500 hover:accent-amber-400 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">
                  <span>Part-time</span>
                  <span>Full-time</span>
                  <span>Fleet Pro</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-inner">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400">
                Estimated Monthly Earnings
              </div>
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 py-2">
                KSH {estimatedMonthly.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-zinc-400 font-medium">
                ≈ KSH {estimatedDaily.toLocaleString()} / day
                <span className="block text-xs mt-1 text-slate-400 dark:text-zinc-500 font-normal">Based on 26 working days</span>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-200 dark:border-zinc-800">
                <Link
                  href="/ghuba/rider/onboarding"
                  className="block w-full py-3.5 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Start Earning Today
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* VEHICLE CATEGORIES */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.div variants={fadeUpVariant} className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
              We Welcome All Vehicle Types
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Choose the category that matches your ride. You can add multiple vehicles to your profile at any time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicleCategories.map((v, i) => (
              <motion.div
                key={v.type}
                variants={fadeUpVariant}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-2xl border backdrop-blur-sm relative flex flex-col justify-between transition-all duration-300 ${v.lightColors} ${v.darkColors} shadow-sm hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-4xl filter drop-shadow-sm">{v.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${v.badgeColor}`}>
                      {v.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{v.type}</h3>
                  <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ONBOARDING STEPS */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.div variants={fadeUpVariant} className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
              Simple 4-Step Verification
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Get onboarded fast from your smartphone. No complex paperwork or office visits required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden lg:block absolute top-12 left-10 right-10 h-0.5 bg-slate-200 dark:bg-zinc-800 z-0" />

            {onboardingSteps.map((s, idx) => (
              <motion.div
                key={s.step}
                variants={fadeUpVariant}
                className="relative z-10 p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 flex flex-col items-start shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-lg font-black text-amber-600 dark:text-amber-500 mb-5 group-hover:scale-110 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-all duration-300 shadow-sm">
                  {s.step}
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ & REQUIREMENTS */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 mb-20 shadow-sm"
        >
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-8 text-center text-slate-900 dark:text-white">
            Rider Requirements & Policies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-zinc-300">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/60 space-y-3 hover:border-amber-200 dark:hover:border-amber-500/30 transition-colors">
              <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <DocumentCheckIcon className="w-5 h-5" /> Identity Verification
              </div>
              <p className="leading-relaxed">
                Valid Kenyan National ID, Alien ID or Passport. Front and back images uploaded through our secure encrypted portal.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/60 space-y-3 hover:border-amber-200 dark:hover:border-amber-500/30 transition-colors">
              <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <CheckBadgeIcon className="w-5 h-5" /> Driving License
              </div>
              <p className="leading-relaxed">
                Required for Motorbike, Car, and Van riders. Bicycle couriers do not require a driving license to operate.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/60 space-y-3 hover:border-amber-200 dark:hover:border-amber-500/30 transition-colors">
              <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5" /> Payouts & Settlement
              </div>
              <p className="leading-relaxed">
                Earnings are credited to your in-app wallet immediately upon proof-of-delivery confirmation. Withdraw anytime to M-Pesa.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FINAL CTA BANNER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-500/20 border border-amber-200 dark:border-amber-500/40 relative overflow-hidden shadow-lg"
        >
          {/* CTA Background accents */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40 dark:opacity-20 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-400 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-400 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Ready to Hit the Road?
            </h2>
            <p className="text-base text-slate-700 dark:text-zinc-300 leading-relaxed max-w-lg mx-auto">
              Join thousands of riders already earning with Ghuba and SalesmanPro. Complete your application in less than 5 minutes.
            </p>
            <div className="pt-6">
              <Link
                href="/ghuba/rider/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-400 text-white dark:text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all active:scale-95"
              >
                Apply as a Delivery Rider <ArrowRightIcon className="w-5 h-5 stroke-[3]" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}