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
  const avgFeePerTrip = 250; // KSH average net
  const estimatedDaily = dailyDeliveries * avgFeePerTrip;
  const estimatedMonthly = estimatedDaily * 26; // 26 working days

  const vehicleCategories = [
    {
      type: "Motorbike (Boda Boda)",
      desc: "Fast urban deliveries, agile navigation, highest volume of retail & food parcels.",
      badge: "Most Popular",
      icon: "🛵",
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/40",
    },
    {
      type: "Bicycle Courier",
      desc: "Zero fuel costs, ideal for central business districts, campuses and short-distance drops.",
      badge: "Eco-Friendly",
      icon: "🚲",
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40",
    },
    {
      type: "Car Driver",
      desc: "Weatherproof transport, multiple orders per trip, high-value electronics and fragile items.",
      badge: "High Value",
      icon: "🚗",
      color: "from-blue-500/20 to-cyan-500/20 border-blue-500/40",
    },
    {
      type: "Van / Pickup",
      desc: "Bulk wholesale orders, store restocks, furniture, and heavy appliance dispatches.",
      badge: "Bulk Cargo",
      icon: "🚐",
      color: "from-purple-500/20 to-indigo-500/20 border-purple-500/40",
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-amber-600/10 blur-3xl rounded-full" />
        <div className="absolute top-2/3 -right-40 w-96 h-96 bg-orange-600/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/80">
          <Link
            href="/"
            className="text-xs uppercase font-bold tracking-wider text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            ← Back to Ghuba Marketplace
          </Link>
          <Link
            href="/ghuba/rider/dashboard"
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 transition-all flex items-center gap-1"
          >
            Rider Portal Login <ChevronRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-6">
            <SparklesIcon className="w-4 h-4" />
            Ghuba Rider Network & SalesmanPro Logistics
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
            Turn Your Wheels into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
              Daily Guaranteed Earnings
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-8">
            Connect with thousands of verified SalesmanPro stores in your county.
            Deliver retail orders, groceries, electronics, and parcel packages with instant M-Pesa payouts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ghuba/rider/onboarding"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Become a Delivery Rider <ArrowRightIcon className="w-4 h-4 stroke-[3]" />
            </Link>
            <Link
              href="/ghuba/rider/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-sm border border-zinc-700/80 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Access Rider Dashboard
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
              <span>Fast 24hr Verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BanknotesIcon className="w-4 h-4 text-amber-400" />
              <span>Direct M-Pesa Payouts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
              <span>Verified Store Merchants</span>
            </div>
          </div>
        </div>

        {/* EARNINGS CALCULATOR */}
        <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-10 mb-16 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                Interactive Income Calculator
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                How much can you earn in your area?
              </h2>
              <p className="text-sm text-zinc-400">
                You keep your agreed delivery fee. Stores publish deliveries with fixed rates or open bidding where you quote your price.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-zinc-300">Deliveries Completed Per Day:</span>
                  <span className="text-amber-400 text-xl font-black">{dailyDeliveries} trips</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={dailyDeliveries}
                  onChange={(e) => setDailyDeliveries(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Part-time (2-5 trips)</span>
                  <span>Full-time (8-15 trips)</span>
                  <span>Fleet Pro (20+ trips)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 text-center space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                Estimated Monthly Earnings
              </div>
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                KSH {estimatedMonthly.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-400">
                ≈ KSH {estimatedDaily.toLocaleString()} / day (based on 26 days/mo)
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <Link
                  href="/ghuba/rider/onboarding"
                  className="block w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all"
                >
                  Start Earning Today
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* VEHICLE CATEGORIES */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              We Welcome All Delivery Categories
            </h2>
            <p className="text-sm text-zinc-400">
              Choose the category that matches your ride. You can add multiple vehicles to your profile anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicleCategories.map((v) => (
              <div
                key={v.type}
                className={`p-6 rounded-2xl bg-gradient-to-b ${v.color} border backdrop-blur-sm relative flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{v.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
                      {v.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">{v.type}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ONBOARDING STEPS */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Simple 4-Step Verification
            </h2>
            <p className="text-sm text-zinc-400">
              Get onboarded fast from your smartphone. No complex paperwork or office visits required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {onboardingSteps.map((s) => (
              <div
                key={s.step}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl font-black text-amber-500/40 mb-3">{s.step}</div>
                  <h3 className="text-base font-black text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ & REQUIREMENTS */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 mb-16">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-6 text-center">
            Rider Requirements & Policies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-300">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
              <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <DocumentCheckIcon className="w-4 h-4" /> Identity Verification
              </div>
              <p>
                Valid Kenyan National ID, Alien ID or Passport. Front and back images uploaded through our secure encrypted portal.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
              <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <CheckBadgeIcon className="w-4 h-4" /> Driving License
              </div>
              <p>
                Required for Motorbike, Car, and Van riders. Bicycles do not require a driving license.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
              <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <BanknotesIcon className="w-4 h-4" /> Payouts & Settlement
              </div>
              <p>
                Earnings are credited to your in-app wallet immediately upon proof-of-delivery confirmation. Withdraw anytime to M-Pesa.
              </p>
            </div>
          </div>
        </div>

        {/* FINAL CTA BANNER */}
        <div className="text-center p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Hit the Road?
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Join thousands of riders already earning with Ghuba and SalesmanPro. Complete your application in less than 5 minutes.
            </p>
            <div className="pt-4">
              <Link
                href="/ghuba/rider/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all active:scale-95"
              >
                Apply as a Delivery Rider <ArrowRightIcon className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
