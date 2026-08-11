// app/admin/[adminSlug]/page.tsx
"use client";

import React from 'react';
import AdminLayout from '@/components/AdminLayout'; // Adjust path as needed
import { motion } from 'framer-motion';
import { UsersIcon, FilmIcon, NewspaperIcon, ChartBarIcon } from '@heroicons/react/24/solid';

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const dashboardStats = [
  { label: "Total Users", value: "12,450", icon: UsersIcon, color: "text-blue-400" },
  { label: "Videos Published", value: "875", icon: FilmIcon, color: "text-green-400" },
  { label: "Articles Published", value: "1,230", icon: NewspaperIcon, color: "text-yellow-400" },
  { label: "Avg. Daily Views", value: "55,200", icon: ChartBarIcon, color: "text-purple-400" },
];

const recentActivities = [
  { id: 1, type: "Video Upload", description: "New trailer for 'Cosmic Echo' uploaded.", timestamp: "2 hours ago" },
  { id: 2, type: "Article Publish", description: "'Future of AI' article went live.", timestamp: "Yesterday" },
  { id: 3, type: "User Registered", description: "New user 'AliceB' joined.", timestamp: "3 days ago" },
  { id: 4, type: "Sponsor Added", description: "New partnership with 'TechCorp' established.", timestamp: "Last week" },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminDashboardPage({ params }: PageProps) {

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

  return (
    <div>
      <div className="space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Icon className={`h-12 w-12 ${stat.color}`} />
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Activities */}
        <motion.div
          className="bg-gray-800 rounded-xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Recent Activities</h2>
          <ul className="space-y-4">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
                <div>
                  <p className="font-semibold text-lg">{activity.description}</p>
                  <span className="text-gray-400 text-sm">{activity.type}</span>
                </div>
                <span className="text-gray-500 text-sm">{activity.timestamp}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}