"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BellAlertIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { ReportSummary } from "@/constant/Data";

/* ---------------- Animations ---------------- */

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const card = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/* ---------------- Sub-Components ---------------- */

const StatCard = ({
  title,
  value,
  description,
  icon,
  accent,
}: {
  title: string;
  value: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  accent: string;
}) => (
  <motion.div
    variants={card}
    whileHover={{ scale: 1.03 }}
    className="group relative overflow-hidden rounded-3xl border border-white/10 
               bg-white/5 backdrop-blur-xl p-6 shadow-xl
               transition-all hover:border-white/20"
  >
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition 
      bg-gradient-to-br ${accent}`}
    />

    <div className="relative z-10 flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          {title}
        </p>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl 
                      bg-white/10 text-white">
        {icon}
      </div>
    </div>
  </motion.div>
);

const ChartCard = ({ title }: { title: string }) => (
  <motion.div
    variants={card}
    className="rounded-3xl border border-white/10 bg-white/5 
               backdrop-blur-xl p-6 shadow-xl h-[22rem]"
  >
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-semibold text-white">{title}</h3>
      <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-400" />
    </div>

    <div className="flex h-full items-center justify-center rounded-2xl 
                    border border-dashed border-white/10 text-gray-400">
      Chart Component Goes Here
    </div>
  </motion.div>
);

/* ---------------- Client Component ---------------- */

interface ReportsClientProps {
  reports: ReportSummary;
}

export default function ReportsClient({ reports }: ReportsClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-6 py-10 text-gray-100">
      {/* Header */}
      <div className="mb-12 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Analytics Overview
        </h1>
        <p className="text-gray-400">
          Performance summary for <span className="text-white">{reports.period}</span>
        </p>
      </div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-12"
      >
        <StatCard
          title="Revenue"
          value={`$${reports.totalRevenue.toFixed(2)}`}
          description="↑ 15% from last period"
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          accent="from-emerald-500/20 to-transparent"
        />

        <StatCard
          title="New Members"
          value={reports.newMembers}
          description="This week sign-ups"
          icon={<UserGroupIcon className="h-6 w-6" />}
          accent="from-blue-500/20 to-transparent"
        />

        <StatCard
          title="Attendance"
          value={`${reports.classAttendanceRate}%`}
          description="Target 85%"
          icon={<ChartBarIcon className="h-6 w-6" />}
          accent="from-purple-500/20 to-transparent"
        />

        <StatCard
          title="Top Class"
          value={reports.topPerformingClass}
          description="Most attended"
          icon={<BellAlertIcon className="h-6 w-6" />}
          accent="from-indigo-500/20 to-transparent"
        />

        <StatCard
          title="Top Trainer"
          value={reports.mostBookedTrainer}
          description="Highest demand"
          icon={<StarIcon className="h-6 w-6" />}
          accent="from-yellow-400/20 to-transparent"
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid gap-6 lg:grid-cols-2"
      >
        <ChartCard title="Revenue Trend" />
        <ChartCard title="Attendance Breakdown" />
      </motion.div>
    </div>
  );
}