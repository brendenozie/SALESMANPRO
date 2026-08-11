"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { HomeIcon, UsersIcon, CalendarDaysIcon, CurrencyDollarIcon, ClipboardDocumentListIcon, SunIcon } from '@heroicons/react/24/solid';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

interface DashboardCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
  link?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon: Icon, title, value, bgColor, textColor, link }) => {
  const router = useRouter();
  return (
    <motion.div
      className={`relative p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group`}
      style={{ backgroundColor: bgColor }}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.2)" }}
      onClick={() => link && router.push(link)}
    >
      {/* Background Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <Icon className="w-32 h-32" style={{ color: textColor }} />
      </div>

      <Icon className={`w-12 h-12 mb-4 relative z-10`} style={{ color: textColor }} />
      <h3 className="text-xl font-semibold mb-2 relative z-10" style={{ color: textColor }}>{title}</h3>
      <p className="text-4xl font-bold relative z-10" style={{ color: textColor }}>{value}</p>
      {link && (
        <span className="mt-4 text-sm font-medium relative z-10 underline opacity-80 group-hover:opacity-100 transition-opacity duration-300" style={{ color: textColor }}>
          View Details
        </span>
      )}
    </motion.div>
  );
};

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminDashboardPage({ params }: PageProps) {
  
  const { slug } = await params;

  // Sample Data for Dashboard Cards
  const dashboardStats = [
    { icon: UsersIcon, title: 'Total Patients', value: '1,245', bgColor: '#e0f7fa', textColor: '#00796b', link: `/admin/${slug}/patients` },
    { icon: CalendarDaysIcon, title: 'Upcoming Appointments', value: '78', bgColor: '#e3f2fd', textColor: '#1976d2', link: `/admin/${slug}/appointments` },
    { icon: CurrencyDollarIcon, title: 'Today\'s Revenue', value: '$1,520', bgColor: '#fbe9e7', textColor: '#d84315', link: `/admin/${slug}/billing` },
    { icon: SunIcon, title: 'Active Doctors', value: '12', bgColor: '#ede7f6', textColor: '#673ab7', link: `/admin/${slug}/doctors` },
    { icon: ClipboardDocumentListIcon, title: 'New Prescriptions', value: '35', bgColor: '#fff3e0', textColor: '#ef6c00', link: `/admin/${slug}/prescriptions` },
  ];

    
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Welcome, Admin!
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          Overview of your healthcare system at a glance.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {dashboardStats.map((stat, index) => (
            <DashboardCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              bgColor={stat.bgColor}
              textColor={stat.textColor}
              link={stat.link}
            />
          ))}
        </div>

        {/* Placeholder for recent activity or quick links */}
        <motion.div
          className="mt-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex items-center space-x-3"><CalendarDaysIcon className="w-5 h-5 text-blue-500" /> <span>Appointment booked for Jane Doe (Dr. Smith) - Today, 2:00 PM</span></li>
            <li className="flex items-center space-x-3"><UsersIcon className="w-5 h-5 text-green-500" /> <span>New patient registered: Mark Taylor</span></li>
            <li className="flex items-center space-x-3"><CurrencyDollarIcon className="w-5 h-5 text-orange-500" /> <span>Invoice #20230712-001 paid by Sarah Connor</span></li>
            <li className="flex items-center space-x-3"><SunIcon className="w-5 h-5 text-purple-500" /> <span>Dr. Johnson updated his availability</span></li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
