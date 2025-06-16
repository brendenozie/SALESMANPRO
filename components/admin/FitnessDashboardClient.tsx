"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HeartIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import ChartTwo from "@/components/ChartTwo";
import ChartThree from "@/components/ChartThree";

interface FitnessStats {
  totalMembers: number;
  totalTrainers: number;
  monthlyCheckins: number;
  classesThisWeek: number;
  sessionsToday: number;
}

interface ClassSession {
  id: string;
  title: string;
  time: string;
  instructor: string;
}

const sampleStats: FitnessStats = {
  totalMembers: 320,
  totalTrainers: 12,
  monthlyCheckins: 1480,
  classesThisWeek: 28,
  sessionsToday: 5,
};

const sampleSessions: ClassSession[] = [
  { id: "1", title: "HIIT Workout", time: "08:00 AM", instructor: "Coach Mandy" },
  { id: "2", title: "Yoga Flow", time: "10:00 AM", instructor: "Lara Chen" },
  { id: "3", title: "Spin Class", time: "12:00 PM", instructor: "Jake Nolan" },
];

export default function FitnessDashboard() {
  const [stats, setStats] = useState<FitnessStats>(sampleStats);
  const [sessions, setSessions] = useState<ClassSession[]>(sampleSessions);

  const cards = [
    { title: "Members", value: stats.totalMembers, icon: UsersIcon, bg: "bg-green-100", link: "/admin/members" },
    { title: "Trainers", value: stats.totalTrainers, icon: HeartIcon, bg: "bg-pink-100", link: "/admin/trainers" },
    { title: "Check-ins", value: stats.monthlyCheckins, icon: ChartBarIcon, bg: "bg-blue-100", link: "/admin/checkins" },
    { title: "Classes This Week", value: stats.classesThisWeek, icon: CalendarDaysIcon, bg: "bg-yellow-100", link: "/admin/classes" },
    { title: "Today’s Sessions", value: stats.sessionsToday, icon: ClockIcon, bg: "bg-indigo-100", link: "/admin/schedule" },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Fitness & Wellness Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className={`${card.bg} p-6 rounded-xl shadow-md hover:shadow-lg transition`}
          >
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
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Check-In Trends</h3>
          <ChartTwo />
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Class Attendance</h3>
          <ChartThree />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Today’s Sessions</h3>
          <Link href="/admin/schedule" className="text-blue-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100">
              <div>
                <p className="font-medium text-gray-700">{session.title}</p>
                <p className="text-sm text-gray-500">Instructor: {session.instructor}</p>
              </div>
              <span className="text-sm text-gray-600">{session.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


// Ideas for Future Expansion:
// BMI/Progress Tracker panel.

// Meal Plans & Diet Tracking widgets.

// Personal Trainer Assignments & Bookings.

// Subscription & Membership Reports.

// Mobile Check-In Integration with QR codes.