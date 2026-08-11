import React from 'react';
import { motion } from 'framer-motion';
import { DashboardMetrics, getDashboardData } from '@/constant/Data';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

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
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

    
  const dashboardData: DashboardMetrics = getDashboardData(companyId);

  return (
    <div>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={cardVariants}>
            <p className="text-gray-500 text-sm">Total Members</p>
            <p className="text-4xl font-bold text-primary-dark">{dashboardData.totalMembers}</p>
          </motion.div>
          <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={cardVariants}>
            <p className="text-gray-500 text-sm">Active Members</p>
            <p className="text-4xl font-bold text-green-600">{dashboardData.activeMembers}</p>
          </motion.div>
          <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={cardVariants}>
            <p className="text-gray-500 text-sm">New Members Today</p>
            <p className="text-4xl font-bold text-blue-600">{dashboardData.newMembersToday}</p>
          </motion.div>
          <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={cardVariants}>
            <p className="text-gray-500 text-sm">Revenue Today</p>
            <p className="text-4xl font-bold text-purple-600">${dashboardData.revenueToday.toFixed(2)}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={cardVariants}>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Upcoming Classes</h3>
            <motion.ul className="space-y-3" variants={listVariants}>
              {dashboardData.upcomingClasses.map((cls, index) => (
                <motion.li key={index} className="flex justify-between items-center text-gray-700" variants={listItemVariants}>
                  <span>{cls.name} <span className="text-gray-500 text-sm">({cls.instructor})</span></span>
                  <span className="font-medium text-primary-dark">{cls.time}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div className="bg-white p-6 rounded-lg shadow-md" variants={cardVariants}>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Activities</h3>
            <motion.ul className="space-y-3 text-sm" variants={listVariants}>
              {dashboardData.recentActivities.map((activity, index) => (
                <motion.li key={index} className="border-b pb-2 last:border-b-0" variants={listItemVariants}>
                  <p className="font-semibold text-gray-800">{activity.type}: <span className="font-normal">{activity.description}</span></p>
                  <p className="text-gray-500 text-xs mt-1">{activity.timestamp}</p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}