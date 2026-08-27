"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  GlobeAltIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  MapPinIcon,
  ChartBarIcon,
  TicketIcon
} from "@heroicons/react/24/outline";

/* ================= DYNAMIC CHART ================= */

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ================= TYPES ================= */

interface UpcomingTour {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface TourStats {
  totalDestinations: number;
  totalBookings: number;
  monthlyRevenue: number;
  activeTourGuides: number;
  upcomingTours: number;
}

interface TravelDashboardData {
  stats: TourStats;
  tours: UpcomingTour[];
}

type Props = TravelDashboardData & {
  slug: string;
}

/* ================= CHARTS ================= */

const BookingTrendsChart = ({ data }: { data?: any }) => {
  const series = [
    {
      name: "Bookings",
      data: data?.values ?? [0, 0, 0, 0, 0, 0, 0]
    }
  ];

  const options: any = {
    chart: { type: "area", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 3 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0.1 } },
    colors: ["#0ea5e9"],
    xaxis: {
      categories: data?.labels ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    dataLabels: { enabled: false }
  };

  return <Chart options={options} series={series} type="area" height={250} />;
};

const DestinationRevenueChart = ({ data }: { data?: any }) => {
  const series = [
    {
      name: "Revenue",
      data: data?.values ?? []
    }
  ];

  const options: any = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.labels ?? [],
      labels: {
        formatter: (val: number) => `KES ${val}`
      }
    }
  };

  if (!series[0].data.length) {
    return <p className="text-slate-400">No revenue data available</p>;
  }

  return <Chart options={options} series={series} type="bar" height={250} />;
};

/* ================= METRIC CARD ================= */

const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
  delay
}: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col items-center"
  >
    <div className={`p-3 rounded-full ${color.replace("text-", "bg-")} bg-opacity-10 mb-2`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <p className="text-2xl font-black text-slate-900">{value}</p>
    <p className="text-xs font-bold text-slate-400 uppercase">{title}</p>
  </motion.div>
);

/* ================= MAIN COMPONENT ================= */

export default function TravelDashboardClient({ slug, stats, tours }: Props) {

  const statsCards = [
    { title: "Destinations", value: stats.totalDestinations, icon: GlobeAltIcon, color: "text-sky-600" },
    { title: "Bookings", value: stats.totalBookings, icon: TicketIcon, color: "text-green-600" },
    {
      title: "Revenue",
      value: `KES ${stats.monthlyRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "text-yellow-600"
    },
    { title: "Guides", value: stats.activeTourGuides, icon: UsersIcon, color: "text-indigo-600" },
    { title: "Upcoming Tours", value: stats.upcomingTours, icon: CalendarDaysIcon, color: "text-pink-600" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 flex justify-between">
          <div>
            <h1 className="text-4xl font-black">
              Travel Hub <span className="text-sky-500">Explorer</span>
            </h1>
            <p className="text-slate-500">Monitoring global routes & tours</p>
          </div>
        </motion.header>

        {/* STATS */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {statsCards.map((card, i) => (
            <MetricCard key={i} {...card} delay={i * 0.1} />
          ))}
        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-3xl border">
            <h3 className="font-black flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-6 h-6 text-sky-500" />
              Booking Velocity
            </h3>
            <BookingTrendsChart />
          </div>

          <div className="bg-white p-8 rounded-3xl border">
            <h3 className="font-black flex items-center gap-2 mb-4">
              <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
              Revenue by Destination
            </h3>
            <DestinationRevenueChart />
          </div>
        </section>

        {/* TOURS */}
        <section className="bg-white p-8 rounded-3xl border">
          <h2 className="text-2xl font-black flex items-center gap-2 mb-6">
            <MapPinIcon className="w-6 h-6 text-pink-500" />
            Expedition Schedule
          </h2>

          {tours.length ? (
            <div className="grid md:grid-cols-3 gap-4">
              {tours.map(tour => (
                <div key={tour.id} className="p-4 bg-slate-50 rounded-xl border">
                  <p className="text-xs font-bold text-sky-600 uppercase">{tour.location}</p>
                  <p className="font-bold">{tour.title}</p>
                  <p className="text-xs text-slate-500 mt-2">{tour.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No upcoming tours scheduled</p>
          )}
        </section>
      </div>
    </div>
  );
}
