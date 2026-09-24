import React from 'react';
import { motion } from 'framer-motion';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { getFitnessDashboardMetrics } from '@/server/services/fitnessService';
import FitnessOperationsMonitor from './TeachersStudentListPage';

interface DashboardProps {
  params: Promise<{
    slug: string;
  }>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default async function DashboardPage({ params }: DashboardProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-gray-400">Company not found</div>;
  }

  const companyId = company.id;
  const dashboardData = await getFitnessDashboardMetrics(companyId);

  return (
    <div className="p-6 space-y-8">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-zinc-50">Fitness & Wellness Operations Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm" variants={cardVariants}>
            <p className="text-gray-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">Total Members</p>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2">{dashboardData.totalMembers}</p>
          </motion.div>
          <motion.div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm" variants={cardVariants}>
            <p className="text-gray-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">Active Memberships</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{dashboardData.activeMembers}</p>
          </motion.div>
          <motion.div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm" variants={cardVariants}>
            <p className="text-gray-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">New Signups Today</p>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{dashboardData.newMembersToday}</p>
          </motion.div>
          <motion.div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm" variants={cardVariants}>
            <p className="text-gray-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">Revenue Today</p>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">${dashboardData.revenueToday.toFixed(2)}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm" variants={cardVariants}>
            <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-50">Upcoming Classes & Sessions</h3>
            <motion.ul className="space-y-3" variants={listVariants}>
              {dashboardData.upcomingClasses.map((cls, index) => (
                <motion.li key={index} className="flex justify-between items-center text-sm p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50" variants={listItemVariants}>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{cls.name} <span className="text-zinc-400 text-xs block font-normal">Coach: {cls.instructor}</span></span>
                  <span className="font-bold text-xs uppercase px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">{cls.time}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm" variants={cardVariants}>
            <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-50">Recent Activities & Alerts</h3>
            <motion.ul className="space-y-3 text-sm" variants={listVariants}>
              {dashboardData.recentActivities.map((activity, index) => (
                <motion.li key={index} className="border-b border-zinc-100 dark:border-zinc-800/80 pb-3 last:border-b-0" variants={listItemVariants}>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200">{activity.type}: <span className="font-normal text-zinc-600 dark:text-zinc-400">{activity.description}</span></p>
                  <p className="text-zinc-400 text-[10px] mt-1">{activity.timestamp}</p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>

        {/* Live Attendance / Operations Monitor */}
        <div className="mt-8">
          <FitnessOperationsMonitor companyId={companyId} />
        </div>
      </motion.div>
    </div>
  );
}