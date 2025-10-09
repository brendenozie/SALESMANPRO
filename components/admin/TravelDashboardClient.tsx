"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Using simple anchor tags (<a>) instead of Next.js <Link> for single-file mandate
import {
  GlobeAltIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ChartBarIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';

// --- New Interfaces based on Travel Dashboard ---

interface UpcomingTour {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface TourStat {
    totalDestinations: number;
    totalBookings: number;
    monthlyRevenue: number;
    activeTourGuides: number;
    upcomingTours: number;
}

interface Metric {
    title: string;
    value: string | number;
    icon: React.ElementType;
    link: string;
    color: string;
}

// --- New Sample Data based on Travel Dashboard ---

const sampleStats: TourStat = {
  totalDestinations: 42,
  totalBookings: 740,
  monthlyRevenue: 52500,
  activeTourGuides: 18,
  upcomingTours: 6,
};

const sampleTours: UpcomingTour[] = [
  { id: '1', title: 'Safari to Maasai Mara', date: '2025-06-20', location: 'Kenya' },
  { id: '2', title: 'Island Getaway', date: '2025-06-25', location: 'Zanzibar' },
  { id: '3', title: 'Himalayan Trek', date: '2025-07-01', location: 'Nepal' },
];

// --- Mock Chart Components (to make the single file runnable) ---

const MockChartTwo: React.FC = () => (
    <div className="h-56 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
        [Placeholder: Booking Trends Line Chart]
    </div>
);

const MockChartThree: React.FC = () => (
    <div className="h-56 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
        [Placeholder: Revenue by Destination Bar Chart]
    </div>
);


// --- Metric Card Component (Reused and adapted for Travel theme) ---
interface MetricCardProps extends Metric {
    delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, link, color, delay }) => {
    return (
        <motion.a
            href={link}
            className="group bg-white p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all duration-300 border border-gray-100 hover:ring-2 hover:ring-offset-2 hover:ring-sky-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
        >
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-')} bg-opacity-10 ${color} shadow-md`}>
                    <Icon className="w-7 h-7" />
                </div>
            </div>

            <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1 group-hover:text-sky-600 transition-colors">
                    {value}
                </p>
            </div>
        </motion.a>
    );
};

// --- Main Dashboard Component ---

export default function TravelDashboard() {
  const [stats] = useState<TourStat>(sampleStats);
  const [tours] = useState<UpcomingTour[]>(sampleTours);
  const adminSlug = 'travel-admin';

  const cards: Metric[] = [
    {
      title: 'Destinations',
      value: stats.totalDestinations,
      icon: GlobeAltIcon,
      color: 'text-sky-600',
      link: `/admin/${adminSlug}/destinations`,
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: TicketIcon,
      color: 'text-green-600',
      link: `/admin/${adminSlug}/bookings`,
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-yellow-600',
      link: `/admin/${adminSlug}/revenue`,
    },
    {
      title: 'Active Guides',
      value: stats.activeTourGuides,
      icon: UsersIcon,
      color: 'text-indigo-600',
      link: `/admin/${adminSlug}/tour-guides`,
    },
    {
      title: 'Upcoming Tours',
      value: stats.upcomingTours,
      icon: CalendarDaysIcon,
      color: 'text-pink-600',
      link: `/admin/${adminSlug}/tours`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <motion.header
          className="mb-10 pb-4 border-b border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Travel & Tourism <span className="text-sky-500">Management</span>
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Oversee global operations, bookings, and upcoming tour schedules.
          </p>
        </motion.header>

        {/* --- Metric Cards --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {cards.map((card, index) => (
            // Note: trend indicators removed as they were not in the new TourStat structure
            <MetricCard key={card.title} {...card} delay={0.3 + index * 0.05} />
          ))}
        </section>

        {/* --- Charts: Booking Trends & Revenue --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <motion.div
                className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3 flex items-center gap-2">
                    <ChartBarIcon className='w-6 h-6 text-sky-600'/> Booking Trends
                </h3>
                <MockChartTwo />
            </motion.div>
            <motion.div
                className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
            >
                <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3 flex items-center gap-2">
                    <CurrencyDollarIcon className='w-6 h-6 text-green-600'/> Revenue by Destination
                </h3>
                <MockChartThree />
            </motion.div>
        </section>

        {/* --- Upcoming Tours List --- */}
        <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
        >
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BuildingOfficeIcon className='w-6 h-6 text-pink-600'/> Upcoming Tours Schedule
                </h2>
                <a href={`/admin/${adminSlug}/tours`} className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                    View Full Schedule <CalendarDaysIcon className='w-4 h-4'/>
                </a>
            </div>
            <ul className="space-y-4">
                {tours.map((tour) => (
                    <li
                        key={tour.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-100 rounded-lg border-l-4 border-sky-500 hover:bg-gray-200 transition"
                    >
                        <div className="text-gray-900 font-medium truncate mb-1 sm:mb-0 flex items-center gap-3">
                            <MapPinIcon className="w-5 h-5 text-sky-500 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{tour.title}</p>
                                <p className="text-xs text-gray-500">{tour.location}</p>
                            </div>
                        </div>
                        <span className="text-sm text-gray-600 flex items-center gap-1 flex-shrink-0">
                            Departure: <span className="font-semibold text-gray-800">{tour.date}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </motion.div>

      </div>
    </div>
  );
}
