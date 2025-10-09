"use client";

import React from 'react';
import { motion } from 'framer-motion';
// Using simple anchor tags to simulate Next.js Link/router for single-file mandate
// import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon, // FIX: Replaced non-existent StethoscopeIcon with AcademicCapIcon for Doctors
  ClockIcon, // For critical alerts/wait times
  ExclamationTriangleIcon, // For critical alerts
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// --- Reusable Card Component ---

interface DashboardCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  accentColor: string;
  link: string;
  delay: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon: Icon, title, value, description, accentColor, link, delay }) => {
  // const router = useRouter(); // Disabled for single-file environment
  return (
    <motion.a
      href={link} // Use href to simulate navigation
      className={`relative p-6 rounded-2xl bg-white shadow-lg flex flex-col justify-between transition duration-300 hover:shadow-xl hover:ring-2 ${accentColor.replace('text-', 'ring-')} cursor-pointer group border border-gray-100`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      <div className="flex items-start justify-between">
        {/* Icon and Title */}
        <div>
            <Icon className={`w-8 h-8 mb-2 ${accentColor}`} />
            <h3 className="text-sm font-medium text-gray-500 mt-1">{title}</h3>
        </div>
        {/* Value */}
        <p className="text-4xl font-extrabold text-gray-900 group-hover:text-teal-700 transition-colors">
            {value}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-400">{description}</p>
        <ArrowRightIcon className={`w-4 h-4 text-gray-300 group-hover:${accentColor.replace('text-', 'text-')} transition-all`} />
      </div>
    </motion.a>
  );
};

// --- Mock Components for Dashboard Sections ---

const CriticalAlerts: React.FC = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-200">
        <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-7 h-7" /> Critical Patient Alerts
        </h2>
        <ul className="space-y-4">
            <li className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-red-800">ER - Severe Chest Pain</p>
                    <p className="text-sm text-red-600">Patient ID: 4578. Wait time: 45 min.</p>
                </div>
                <ClockIcon className="w-5 h-5 text-red-500 animate-pulse" />
            </li>
            <li className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-yellow-800">Lab Results Pending Review</p>
                    <p className="text-sm text-yellow-600">Urgent follow-up needed for 3 patients.</p>
                </div>
                <ClipboardDocumentListIcon className="w-5 h-5 text-yellow-500" />
            </li>
        </ul>
        <a href="/admin/alerts" className="mt-4 text-sm font-medium text-red-600 hover:text-red-800 flex items-center">
            View Alert Center <ArrowRightIcon className="w-4 h-4 ml-1" />
        </a>
    </div>
);

const ActivityLog: React.FC = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Recent System Activity</h2>
        <ul className="space-y-3 text-gray-700">
            <li className="flex items-center space-x-3 text-sm">
                <CalendarDaysIcon className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="truncate"><span className="font-medium">Appointment:</span> Jane Doe scheduled with Dr. Smith today.</span>
            </li>
            <li className="flex items-center space-x-3 text-sm">
                <UsersIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate"><span className="font-medium">New Patient:</span> Registration for Mark Taylor completed.</span>
            </li>
            <li className="flex items-center space-x-3 text-sm">
                <CurrencyDollarIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="truncate"><span className="font-medium">Billing:</span> Invoice #20230712-001 paid ($350).</span>
            </li>
            <li className="flex items-center space-x-3 text-sm">
                <AcademicCapIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="truncate"><span className="font-medium">Staff Update:</span> Dr. Johnson updated availability for next week.</span>
            </li>
        </ul>
    </div>
);

// --- Main Dashboard Component ---

export default function HealthcareSystemOverview({ params }: { params: { adminSlug: string } }) {
  const { adminSlug } = params;

  const dashboardStats = [
    { 
        icon: UsersIcon, 
        title: 'Total Active Patients', 
        value: '1,245', 
        description: 'Currently registered and active patients.',
        accentColor: 'text-teal-600', 
        link: `/admin/${adminSlug}/patients`,
        delay: 0.2
    },
    { 
        icon: CalendarDaysIcon, 
        title: 'Upcoming Appointments', 
        value: '78', 
        description: 'Total appointments scheduled for today.',
        accentColor: 'text-blue-600', 
        link: `/admin/${adminSlug}/appointments`,
        delay: 0.3
    },
    { 
        icon: ClipboardDocumentListIcon, 
        title: 'Unsigned Documents', 
        value: '35', 
        description: 'New prescriptions and lab forms pending doctor sign-off.',
        accentColor: 'text-orange-600', 
        link: `/admin/${adminSlug}/documents`,
        delay: 0.4
    },
    { 
        icon: AcademicCapIcon, // FIX: Replaced StethoscopeIcon
        title: 'Active Physicians', 
        value: '12', 
        description: 'Doctors currently logged in and on shift.',
        accentColor: 'text-indigo-600', 
        link: `/admin/${adminSlug}/doctors`,
        delay: 0.5
    },
  ];
  
  // Separate financial/bottom-line metric for different visual treatment
  const financialStat = { 
    icon: CurrencyDollarIcon, 
    title: 'Today\'s Gross Revenue', 
    value: '$1,520', 
    description: 'Billed and confirmed revenue transactions today.',
    accentColor: 'text-green-600', 
    link: `/admin/${adminSlug}/billing`,
    delay: 0.6
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <motion.header
          className="mb-10 pb-4 border-b border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Clinical <span className="text-teal-600">System Overview</span>
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Monitoring facility operations and critical health metrics.
          </p>
        </motion.header>

        {/* --- Main Metric Grid (4 Cards) --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {dashboardStats.map((stat, index) => (
            <DashboardCard
              key={index}
              {...stat}
            />
          ))}
        </section>
        
        {/* --- Critical Alerts, Financial, and Activity Sections --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 1. Critical Alerts (Urgency) */}
            <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
            >
                <CriticalAlerts />
            </motion.div>

            {/* 2. Financial & Doctors (Combined) */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Financial Card (High value, distinct color) */}
                <motion.a
                    href={financialStat.link}
                    className="md:col-span-1 p-6 rounded-2xl bg-white shadow-lg border-l-4 border-green-500 flex flex-col justify-center transition duration-300 hover:shadow-xl hover:ring-2 ring-green-500 group"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <div className="flex items-center justify-between">
                        <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                        <span className="text-sm font-medium text-gray-500">TODAY'S REVENUE</span>
                    </div>
                    <p className="text-4xl font-extrabold text-gray-900 mt-3">{financialStat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{financialStat.description}</p>
                    <div className="flex justify-end mt-4">
                        <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-colors" />
                    </div>
                </motion.a>

                {/* Activity Log */}
                <motion.div
                    className="md:col-span-1"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                >
                    <ActivityLog />
                </motion.div>

            </div>
            
        </section>

        {/* --- Chart Placeholder --- */}
        <motion.div
            className="mt-6 bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Patient Flow vs. Capacity</h2>
            <div className="min-h-[300px] flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-teal-200 text-teal-600 font-semibold">
                [Placeholder for Patient Inflow/Outflow Line Chart]
            </div>
        </motion.div>

      </div>
    </div>
  );
}
