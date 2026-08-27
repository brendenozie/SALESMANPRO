"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ScaleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

/* ----------------------------------
   TYPES
---------------------------------- */

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface FinanceLegalDashboardData {
  metrics: {
    totalClients: number;
    activeContracts: number;
    pendingInvoices: number;
    revenueThisMonth: number;
    scheduledMeetings: number;
  };
  tasks: Task[];
  charts: {
    caseDistribution: { type: string; count: number }[];
    revenueGrowth: number[];
  };
}

type Props = FinanceLegalDashboardData &{
  slug: string;
}

/* ----------------------------------
   METRIC CARD
---------------------------------- */

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  link: string;
  trend: number;
  color: string;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  link,
  color,
  delay,
}) => {
  const TrendIcon = trend > 0 ? ArrowUpIcon : ClockIcon;

  return (
    <motion.a
      href={link}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`group bg-gray-800 p-6 rounded-2xl shadow-xl border-t-4 ${color.replace(
        "text-",
        "border-"
      )} hover:ring-2 ${color.replace(
        "text-",
        "ring-"
      )} transition-all`}
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl bg-gray-700 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>

        {trend !== 0 && (
          <span className="flex items-center text-sm text-green-400">
            <TrendIcon className="w-4 h-4 mr-1" />
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-4xl font-extrabold text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-400 uppercase tracking-wider mt-1">
          {title}
        </p>
      </div>
    </motion.a>
  );
};

/* ----------------------------------
   CHARTS
---------------------------------- */

const RevenueGrowthChart: React.FC<{ data: number[] }> = ({ data }) => {
  const maxVal = Math.max(...data, 1);
  const monthLabels = ["Feb", "Mar", "Apr", "May", "Jun"];

  return (
    <div className="p-6 bg-gray-800 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ChartBarIcon className="w-5 h-5 text-green-400" />
        Revenue Growth
      </h2>

      <div className="flex items-end h-56 gap-2">
        {data.map((val, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(val / maxVal) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="flex-1 bg-blue-600 rounded-t-lg relative group"
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-300 opacity-0 group-hover:opacity-100">
              ${(val / 1000).toFixed(1)}K
            </span>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">
              {monthLabels[i]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CaseDistributionChart: React.FC<{
  data: { type: string; count: number }[];
}> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  const colors: Record<string, string> = {
    FINANCE: "bg-yellow-500",
    LEGAL: "bg-red-500",
    ADVISORY: "bg-blue-500",
  };

  return (
    <div className="p-6 bg-gray-800 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ChartPieIcon className="w-5 h-5 text-purple-400" />
        Case Distribution
      </h2>

      <ul className="space-y-3">
        {data.map((item) => (
          <li key={item.type} className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                colors[item.type] || "bg-gray-500"
              }`}
            />
            <span className="text-gray-200 font-medium">
              {item.type}
            </span>
            <span className="text-gray-400">
              {Math.round((item.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ----------------------------------
   MAIN COMPONENT
---------------------------------- */

export default function FinanceLegalDashboardClient({ metrics, tasks, charts, slug }: Props) {
  const adminSlug = "firm-admin";

  const cards = [
    {
      title: "Clients",
      value: metrics.totalClients,
      icon: UserGroupIcon,
      trend: 5,
      color: "text-blue-400",
      link: `/admin/${adminSlug}/clients`,
    },
    {
      title: "Active Contracts",
      value: metrics.activeContracts,
      icon: DocumentCheckIcon,
      trend: 2,
      color: "text-teal-400",
      link: `/admin/${adminSlug}/contracts`,
    },
    {
      title: "Pending Invoices",
      value: metrics.pendingInvoices,
      icon: BriefcaseIcon,
      trend: 0,
      color: "text-red-400",
      link: `/admin/${adminSlug}/invoices`,
    },
    {
      title: "Monthly Revenue",
      value: `$${metrics.revenueThisMonth.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      trend: 8,
      color: "text-green-400",
      link: `/admin/${adminSlug}/revenue`,
    },
    {
      title: "Meetings",
      value: metrics.scheduledMeetings,
      icon: CalendarDaysIcon,
      trend: 0,
      color: "text-purple-400",
      link: `/admin/${adminSlug}/meetings`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-6">
      <div className="max-w-screen-xl mx-auto">

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-white">
            Legal & Financial{" "}
            <span className="text-amber-400">Command Center</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Monitor revenue, clients, and deadlines at a glance.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {cards.map((c, i) => (
            <MetricCard key={c.title} {...c} delay={i * 0.05} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <RevenueGrowthChart data={charts.revenueGrowth} />
          <CaseDistributionChart data={charts.caseDistribution} />
        </section>

        <section className="bg-gray-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-red-400" />
            Critical Deadlines
          </h2>

          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No critical deadlines today.
            </p>
          ) : (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex justify-between items-center bg-gray-700 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-gray-200">
                    <ScaleIcon className="w-5 h-5 text-amber-400" />
                    {task.name}
                  </div>
                  <span className="text-sm text-gray-400">
                    {task.dueDate} @ {task.dueTime}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
