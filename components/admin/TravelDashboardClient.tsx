"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GlobeAltIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import ChartTwo from "@/components/ChartTwo";
import ChartThree from "@/components/ChartThree";

interface TourStat {
  totalDestinations: number;
  totalBookings: number;
  monthlyRevenue: number;
  activeTourGuides: number;
  upcomingTours: number;
}

interface UpcomingTour {
  id: string;
  title: string;
  date: string;
  location: string;
}

const sampleStats: TourStat = {
  totalDestinations: 42,
  totalBookings: 740,
  monthlyRevenue: 52500,
  activeTourGuides: 18,
  upcomingTours: 6,
};

const sampleTours: UpcomingTour[] = [
  { id: "1", title: "Safari to Maasai Mara", date: "2025-06-20", location: "Kenya" },
  { id: "2", title: "Island Getaway", date: "2025-06-25", location: "Zanzibar" },
  { id: "3", title: "Himalayan Trek", date: "2025-07-01", location: "Nepal" },
];

export default function TravelDashboard() {
  const [stats, setStats] = useState<TourStat>(sampleStats);
  const [tours, setTours] = useState<UpcomingTour[]>(sampleTours);

  const cards = [
    { title: "Destinations", value: stats.totalDestinations, icon: GlobeAltIcon, bg: "bg-sky-100", link: "/admin/destinations" },
    { title: "Bookings", value: stats.totalBookings, icon: CalendarDaysIcon, bg: "bg-green-100", link: "/admin/bookings" },
    { title: "Revenue", value: `$${stats.monthlyRevenue.toLocaleString()}`, icon: CurrencyDollarIcon, bg: "bg-yellow-100", link: "/admin/revenue" },
    { title: "Tour Guides", value: stats.activeTourGuides, icon: UsersIcon, bg: "bg-indigo-100", link: "/admin/tour-guides" },
    { title: "Upcoming Tours", value: stats.upcomingTours, icon: BuildingOfficeIcon, bg: "bg-pink-100", link: "/admin/tours" },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Travel & Tourism Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => (
          <Link key={card.title} href={card.link} className={`${card.bg} p-6 rounded-xl shadow-md hover:shadow-lg transition`}>
            <div className="flex items-center gap-3 mb-2">
              <card.icon className="h-8 w-8 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-800">{card.title}</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Booking Trends</h3>
          <ChartTwo />
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Revenue by Destination</h3>
          <ChartThree />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Upcoming Tours</h3>
          <Link href="/admin/tours" className="text-blue-600 hover:underline">Manage</Link>
        </div>
        <ul className="space-y-3">
          {tours.map((tour) => (
            <li key={tour.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100">
              <div>
                <p className="font-medium text-gray-700">{tour.title}</p>
                <p className="text-sm text-gray-500">{tour.location}</p>
              </div>
              <span className="text-sm text-gray-600">{tour.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


// Bonus Suggestions for Future Features:
// Interactive World Map for live destination tracking.

// Calendar Planner for tour schedules.

// Integrations: Flights, Hotels, Visa APIs.

// Ratings & Reviews Panel.

// Bookings Funnel using charts.