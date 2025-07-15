// app/admin/[slug]/DashboardClient.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { DashboardStats, RecentActivity, LatestReview } from "./page"; // Import types

interface DashboardClientProps {
  companyId: string;
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  latestReviews: LatestReview[];
}

// Framer Motion Variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function DashboardClient({
  companyId,
  stats,
  recentActivities,
  latestReviews,
}: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 md:p-10">
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Welcome back, {companyId}! Here's a quick overview of your SaaS product.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <StatCard
          icon={UsersIcon}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+23 today"
          changeType="positive"
        />
        <StatCard
          icon={CreditCardIcon}
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change={`+${stats.mrrGrowth}% MRR`}
          changeType="positive"
        />
        <StatCard
          icon={ChartBarIcon}
          title="Active Subscriptions"
          value={stats.activeSubscriptions.toLocaleString()}
          change={`${stats.churnRate}% Churn`}
          changeType="negative"
        />
        <StatCard
          icon={SparklesIcon}
          title="New Signups Today"
          value={stats.newSignupsToday.toLocaleString()}
          change="Keep up the growth!"
          changeType="neutral"
        />
      </motion.div>

      {/* Recent Activity & Latest Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-indigo-500" /> Recent Activity
          </h2>
          {recentActivities.length > 0 ? (
            <ul className="space-y-4">
              <AnimatePresence>
                {recentActivities.map((activity) => (
                  <motion.li
                    key={activity.id}
                    className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="flex-shrink-0 text-indigo-600 dark:text-indigo-300">
                      {activity.type.includes("Signup") && <UsersIcon className="h-5 w-5" />}
                      {activity.type.includes("Invoice") && <CreditCardIcon className="h-5 w-5" />}
                      {activity.type.includes("Blog") && <SparklesIcon className="h-5 w-5" />}
                      {activity.type.includes("Ticket") && <LifebuoyIcon className="h-5 w-5" />} {/* Assuming LifebuoyIcon is imported */}
                      {activity.type.includes("Subscription") && <ClipboardDocumentListIcon className="h-5 w-5" />} {/* Assuming ClipboardDocumentListIcon is imported */}
                      {!activity.type.includes("Signup") && !activity.type.includes("Invoice") && !activity.type.includes("Blog") && !activity.type.includes("Ticket") && !activity.type.includes("Subscription") && <ChartBarIcon className="h-5 w-5" />} {/* Default icon */}
                    </div>
                    <div className="flex-grow">
                      <p className="text-gray-800 dark:text-gray-100 font-medium text-base leading-tight">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {format(new Date(activity.timestamp), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity.</p>
          )}
        </motion.div>

        {/* Latest Reviews */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <StarIcon className="h-6 w-6 text-yellow-500" /> Latest Reviews
          </h2>
          {latestReviews.length > 0 ? (
            <ul className="space-y-4">
              <AnimatePresence>
                {latestReviews.map((review) => (
                  <motion.li
                    key={review.id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="flex items-center mb-2">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 mr-2">{review.user}</p>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <StarIcon key={i} className="h-4 w-4 fill-current" />
                        ))}
                        {Array.from({ length: 5 - review.rating }).map((_, i) => (
                          <StarIcon key={i + review.rating} className="h-4 w-4 stroke-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 text-sm italic mb-2">"{review.comment}"</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                      {format(new Date(review.timestamp), "MMM dd, yyyy")}
                    </p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent reviews.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change, changeType }) => {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-500 dark:text-emerald-400"
      : changeType === "negative"
      ? "text-red-500 dark:text-red-400"
      : "text-gray-500 dark:text-gray-400";

  const changeIcon =
    changeType === "positive" ? (
      <ArrowTrendingUpIcon className="h-4 w-4" />
    ) : changeType === "negative" ? (
      <ArrowTrendingDownIcon className="h-4 w-4" />
    ) : null;

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-start"
      variants={cardVariants}
    >
      <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1 mb-2">{value}</h3>
      <p className={`text-sm flex items-center gap-1 ${changeColor}`}>
        {changeIcon}
        <span>{change}</span>
      </p>
    </motion.div>
  );
};