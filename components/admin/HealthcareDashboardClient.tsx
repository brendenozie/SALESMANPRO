"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
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

// Dynamic import for ApexCharts to prevent SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- APEX CHART COMPONENT ---

const PatientFlowChart: React.FC<{ data: any }> = ({ data }) => {
  const series = [
    {
      name: "Patient Inflow",
      data: data?.inflow || [30, 40, 35, 50, 49, 60, 70, 91, 125]
    },
    {
      name: "Facility Capacity",
      data: data?.capacity || [80, 80, 80, 80, 80, 80, 80, 80, 80]
    }
  ];

  const options: any = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#0d9488', '#94a3b8'], // teal-600 and slate-400
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100]
      }
    },
    xaxis: {
      categories: data?.labels || ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'],
      axisBorder: { show: false },
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: {
      labels: { style: { colors: '#64748b' } }
    },
    grid: { borderColor: '#f1f5f9' },
    tooltip: { theme: 'light' },
    legend: { position: 'top', horizontalAlign: 'right' }
  };

  return <Chart options={options} series={series} type="area" height={350} />;
};

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
    charts: {
        patientFlow: any;
    };
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

// --- MAIN COMPONENT ---
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
  
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 text-teal-600 flex flex-col items-center justify-center p-8">
      <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
      <p className="text-xl font-semibold">Syncing Clinical Records...</p>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-red-50 text-red-600 p-8 flex flex-col items-center justify-center text-center">
      <ExclamationTriangleIcon className="w-16 h-16 mb-4" />
      <h2 className="text-2xl font-bold mb-2">System Offline</h2>
      <p>{error || "Verify your connection to the clinical API."}</p>
    </div>
  );

  const dashboardStats = [
    { icon: UsersIcon, title: 'Active Patients', value: data.metrics.totalActivePatients.toLocaleString(), description: 'Total under care.', accentColor: 'text-teal-600', link: `/admin/${companyId}/patients`, delay: 0.1 },
    { icon: CalendarDaysIcon, title: 'Daily Consults', value: data.metrics.upcomingAppointments.toLocaleString(), description: 'Scheduled today.', accentColor: 'text-blue-600', link: `/admin/${companyId}/appointments`, delay: 0.2 },
    { icon: ClipboardDocumentListIcon, title: 'Pending Signatures', value: data.metrics.unsignedDocuments.toLocaleString(), description: 'Charts needing MD sign-off.', accentColor: 'text-orange-600', link: `/admin/${companyId}/documents`, delay: 0.3 },
    { icon: AcademicCapIcon, title: 'Staff On-Call', value: data.metrics.activePhysicians.toLocaleString(), description: 'Physicians on shift.', accentColor: 'text-indigo-600', link: `/admin/${companyId}/doctors`, delay: 0.4 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <motion.header className="mb-10 pb-4 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Clinical <span className="text-teal-600">Operations</span>
            </h1>
            <p className="text-lg text-gray-500 mt-2">Facility ID: {companyId}</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
             <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Export Report</button>
             <button className="px-4 py-2 bg-teal-600 rounded-lg text-sm font-semibold text-white hover:bg-teal-700 transition shadow-lg shadow-teal-600/20">+ Admit Patient</button>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {dashboardStats.map((stat, index) => <DashboardCard key={index} {...stat} />)}
        </section>
        
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div className="lg:col-span-1 space-y-6" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100">
                    <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-6 h-6" /> Critical Alerts
                    </h2>
                    <div className="space-y-3">
                        {data.criticalAlerts.map(alert => (
                            <div key={alert.id} className="p-3 bg-red-50 rounded-xl border-l-4 border-red-500 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-red-900">{alert.taskName}</p>
                                    <p className="text-xs text-red-600">Due {alert.dueTime}</p>
                                </div>
                                <ClockIcon className="w-4 h-4 text-red-400 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white shadow-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                        <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        <span className="text-xs font-bold text-gray-400 uppercase">Gross Revenue</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">${data.metrics.todaysRevenue.toLocaleString()}</p>
                </div>
            </motion.div>

            <motion.div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Facility Saturation</h2>
                        <p className="text-sm text-gray-500">Real-time patient inflow vs. discharge capacity</p>
                    </div>
                    <div className="flex gap-4 text-xs font-bold uppercase">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-500 rounded-full"></span> Inflow</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-300 rounded-full"></span> Capacity</span>
                    </div>
                </div>
                <PatientFlowChart data={data.charts?.patientFlow || []} />
            </motion.div>
        </section>

        <motion.div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <h3 className="font-bold text-gray-800 mb-4">Shift Audit Log</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.recentActivities.map(act => (
                    <div key={act.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm border border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                        <span className="text-gray-500 font-medium w-16">{act.time}</span>
                        <span className="text-gray-700 font-semibold">{act.type}:</span>
                        <span className="text-gray-600 truncate">{act.description}</span>
                    </div>
                ))}
            </div>
        </motion.div>
      </div>
    </div>
  );
}