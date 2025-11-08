"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- TYPE DEFINITIONS ---
interface DashboardCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  accentColor: string;
  link: string;
  delay: number;
}

interface Alert {
    id: string;
    taskName: string;
    dueTime: string;
}

interface Activity {
    id: string;
    type: string;
    description: string;
    time: string;
}

interface DashboardData {
    metrics: {
        totalActivePatients: number;
        upcomingAppointments: number;
        unsignedDocuments: number;
        activePhysicians: number;
        todaysRevenue: number;
    };
    criticalAlerts: Alert[];
    recentActivities: Activity[];
}

// --- Reusable Card Component ---
const DashboardCard: React.FC<DashboardCardProps> = ({ icon: Icon, title, value, description, accentColor, link, delay }) => (
    <motion.a
      href={link}
      className={`relative p-6 rounded-2xl bg-white shadow-lg flex flex-col justify-between transition duration-300 hover:shadow-xl hover:ring-2 ${accentColor.replace('text-', 'ring-')} cursor-pointer group border border-gray-100`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      <div className="flex items-start justify-between">
        <div>
            <Icon className={`w-8 h-8 mb-2 ${accentColor}`} />
            <h3 className="text-sm font-medium text-gray-500 mt-1">{title}</h3>
        </div>
        <p className="text-4xl font-extrabold text-gray-900 group-hover:text-teal-700 transition-colors">
            {value}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-400">{description}</p>
        <ArrowRightIcon className={`w-4 h-4 text-gray-300 group-hover:${accentColor} transition-all`} />
      </div>
    </motion.a>
);

// --- Sections Components ---
const CriticalAlerts: React.FC<{ alerts: Alert[] }> = ({ alerts }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-200">
        <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-7 h-7" /> Critical Patient Alerts
        </h2>
        {alerts.length > 0 ? (
            <ul className="space-y-4">
                {alerts.map(alert => (
                    <li key={alert.id} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-red-800">{alert.taskName}</p>
                            <p className="text-sm text-red-600">Due: {alert.dueTime}</p>
                        </div>
                        <ClockIcon className="w-5 h-5 text-red-500 animate-pulse" />
                    </li>
                ))}
            </ul>
        ) : (
             <div className="text-center py-4 text-gray-500">No high-priority alerts.</div>
        )}
        <a href="/admin/alerts" className="mt-4 text-sm font-medium text-red-600 hover:text-red-800 flex items-center">
            View Alert Center <ArrowRightIcon className="w-4 h-4 ml-1" />
        </a>
    </div>
);

const ActivityLog: React.FC<{ activities: Activity[] }> = ({ activities }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Recent System Activity</h2>
        {activities.length > 0 ? (
            <ul className="space-y-3 text-gray-700">
            {activities.map(act => (
                 <li key={act.id} className="flex items-center space-x-3 text-sm">
                    <CalendarDaysIcon className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span className="truncate"><span className="font-medium">{act.type}:</span> {act.description} at {act.time}</span>
                </li>
            ))}
            </ul>
        ) : (
            <div className="text-center py-4 text-gray-500">No recent activity.</div>
        )}
    </div>
);

// --- Main Dashboard Component ---
export default function HealthcareSystemOverview() {
  const { slug: companyId } = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`${apiBaseUrl}/admin/dashboard/healthcare/${companyId}`);
          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.data?.message || "Failed to fetch dashboard data.");
          }
          setData(result.data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [companyId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-teal-600 flex flex-col items-center justify-center p-8">
        <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl font-semibold">Loading Clinical Systems...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-red-50 text-red-600 p-8 flex flex-col items-center justify-center">
        <ExclamationTriangleIcon className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
        <p>{error || "An unknown error occurred."}</p>
      </div>
    );
  }

  const dashboardStats = [
    { icon: UsersIcon, title: 'Total Active Patients', value: data.metrics.totalActivePatients.toLocaleString(), description: 'Currently registered and active.', accentColor: 'text-teal-600', link: `/admin/${companyId}/patients`, delay: 0.2 },
    { icon: CalendarDaysIcon, title: 'Appointments Today', value: data.metrics.upcomingAppointments.toLocaleString(), description: 'Scheduled for today.', accentColor: 'text-blue-600', link: `/admin/${companyId}/appointments`, delay: 0.3 },
    { icon: ClipboardDocumentListIcon, title: 'Unsigned Documents', value: data.metrics.unsignedDocuments.toLocaleString(), description: 'Prescriptions pending sign-off.', accentColor: 'text-orange-600', link: `/admin/${companyId}/documents`, delay: 0.4 },
    { icon: AcademicCapIcon, title: 'Active Physicians', value: data.metrics.activePhysicians.toLocaleString(), description: 'Doctors currently on shift.', accentColor: 'text-indigo-600', link: `/admin/${companyId}/doctors`, delay: 0.5 },
  ];

  const financialStat = { icon: CurrencyDollarIcon, title: 'Today\'s Gross Revenue', value: `$${data.metrics.todaysRevenue.toLocaleString()}`, description: 'Billed and confirmed revenue.', accentColor: 'text-green-600', link: `/admin/${companyId}/billing`, delay: 0.6 };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <motion.header className="mb-10 pb-4 border-b border-gray-200" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Clinical <span className="text-teal-600">System Overview</span>
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Monitoring facility operations.
          </p>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {dashboardStats.map((stat, index) => <DashboardCard key={index} {...stat} />)}
        </section>
        
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>
                <CriticalAlerts alerts={data.criticalAlerts} />
            </motion.div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.a href={financialStat.link} className="md:col-span-1 p-6 rounded-2xl bg-white shadow-lg border-l-4 border-green-500 flex flex-col justify-center transition duration-300 hover:shadow-xl hover:ring-2 ring-green-500 group" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}>
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

                <motion.div className="md:col-span-1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}>
                    <ActivityLog activities={data.recentActivities} />
                </motion.div>
            </div>
        </section>

        <motion.div className="mt-6 bg-white rounded-2xl shadow-lg p-8 border border-gray-200" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Patient Flow vs. Capacity</h2>
            <div className="min-h-[300px] flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-teal-200 text-teal-600 font-semibold">
                [Placeholder for Patient Inflow/Outflow Line Chart]
            </div>
        </motion.div>
      </div>
    </div>
  );
}