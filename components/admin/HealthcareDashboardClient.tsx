"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";

/* -------------------- CHART -------------------- */

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PatientFlowChart: React.FC<{ data?: any }> = ({ data }) => {
  const series = [
    {
      name: "Patient Inflow",
      data: data?.inflow || [30, 40, 35, 50, 49, 60, 70],
    },
    {
      name: "Facility Capacity",
      data: data?.capacity || [80, 80, 80, 80, 80, 80, 80],
    },
  ];

  const options: any = {
    chart: { type: "area", toolbar: { show: false } },
    colors: ["#0d9488", "#94a3b8"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.45, opacityTo: 0.05 },
    },
    xaxis: {
      categories: data?.labels || ["08:00", "10:00", "12:00", "14:00", "16:00"],
    },
  };

  return <Chart options={options} series={series} type="area" height={350} />;
};

/* -------------------- TYPES -------------------- */

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

export interface HealthcareDashboardData {
  metrics: {
    totalActivePatients: number;
    upcomingAppointments: number;
    unsignedDocuments: number;
    activePhysicians: number;
    todaysRevenue: number;
  };
  criticalAlerts: Alert[];
  recentActivities: Activity[];
  charts?: {
    patientFlow?: any;
  };
}

type Props = HealthcareDashboardData &{
  slug: string;
}

/* -------------------- CARD -------------------- */

const DashboardCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  accentColor: string;
  link: string;
  delay: number;
}> = ({ icon: Icon, title, value, description, accentColor, link, delay }) => (
  <motion.a
    href={link}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transition border border-gray-100 group"
  >
    <Icon className={`w-8 h-8 ${accentColor} mb-2`} />
    <h3 className="text-sm text-gray-500">{title}</h3>
    <p className="text-4xl font-extrabold text-gray-900">{value}</p>
    <div className="mt-4 pt-4 border-t flex justify-between items-center">
      <p className="text-xs text-gray-400">{description}</p>
      <ArrowRightIcon className={`w-4 h-4 ${accentColor}`} />
    </div>
  </motion.a>
);

/* -------------------- MAIN -------------------- */

export default function HealthcareSystemOverview({ metrics, criticalAlerts, recentActivities, charts, slug: companyId }: Props) {
  // const { slug: companyId } = useParams();

  const stats = [
    {
      icon: UsersIcon,
      title: "Active Patients",
      value: metrics.totalActivePatients.toLocaleString(),
      description: "Currently under care",
      accentColor: "text-teal-600",
      link: `/admin/${companyId}/patients`,
      delay: 0.1,
    },
    {
      icon: CalendarDaysIcon,
      title: "Appointments Today",
      value: metrics.upcomingAppointments.toLocaleString(),
      description: "Scheduled consultations",
      accentColor: "text-blue-600",
      link: `/admin/${companyId}/appointments`,
      delay: 0.2,
    },
    {
      icon: ClipboardDocumentListIcon,
      title: "Unsigned Docs",
      value: metrics.unsignedDocuments.toLocaleString(),
      description: "Pending physician approval",
      accentColor: "text-orange-600",
      link: `/admin/${companyId}/documents`,
      delay: 0.3,
    },
    {
      icon: AcademicCapIcon,
      title: "Physicians On-Call",
      value: metrics.activePhysicians.toLocaleString(),
      description: "Active staff",
      accentColor: "text-indigo-600",
      link: `/admin/${companyId}/doctors`,
      delay: 0.4,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="mb-10 border-b pb-4">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Clinical <span className="text-teal-600">Operations</span>
          </h1>
          <p className="text-gray-500 mt-2">Facility</p>
        </header>

        {/* METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((s, i) => (
            <DashboardCard key={i} {...s} />
          ))}
        </section>

        {/* ALERTS + REVENUE */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow border border-red-100">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6" />
              Critical Alerts
            </h2>

            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-red-50 rounded-xl border-l-4 border-red-500 flex justify-between"
                >
                  <div>
                    <p className="font-semibold text-red-900">{alert.taskName}</p>
                    <p className="text-xs text-red-600">Due {alert.dueTime}</p>
                  </div>
                  <ClockIcon className="w-4 h-4 text-red-400" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">
                No critical alerts
              </p>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-2">Facility Saturation</h2>
            <p className="text-sm text-gray-500 mb-4">
              Patient inflow vs capacity
            </p>
            <PatientFlowChart data={charts?.patientFlow} />
          </div>
        </section>

        {/* ACTIVITY LOG */}
        <section className="bg-white p-6 rounded-2xl shadow">
          <h3 className="font-bold mb-4">Recent Activity</h3>

          {recentActivities.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {recentActivities.map((a) => (
                <div
                  key={a.id}
                  className="p-3 bg-gray-50 rounded-xl text-sm border"
                >
                  <span className="font-semibold">{a.type}</span> —{" "}
                  {a.description}
                  <div className="text-xs text-gray-400 mt-1">{a.time}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">
              No recent clinical activity
            </p>
          )}
        </section>

        {/* REVENUE */}
        <div className="mt-6 bg-white p-6 rounded-2xl shadow border-l-4 border-green-500">
          <p className="text-xs text-gray-400 uppercase">Today’s Revenue</p>
          <p className="text-3xl font-black text-gray-900">
            ${metrics.todaysRevenue.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
