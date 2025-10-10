"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon,
  TrophyIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
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

interface Metric {
    title: string;
    value: string | number;
    icon: React.ElementType;
    link: string;
    color: string;
}

interface Goal {
    target: number;
    achieved: number;
}

interface FitnessDashboardData {
    stats: FitnessStats;
    membershipGoal: Goal;
    sessions: ClassSession[];
    charts: {
        checkInTrends: any;
        classAttendance: any;
    }
}

// --- MOCK CHART COMPONENTS ---

const MockCheckInTrends: React.FC = () => {
    const data = [80, 120, 150, 110, 180, 160, 200]; // Daily check-ins
    const maxVal = 220;

    return (
        <div className="h-48 pt-4">
            <div className="relative h-full flex items-end justify-between px-2">
                {data.map((val, index) => {
                    const heightPercentage = Math.round((val / maxVal) * 100);
                    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

                    return (
                        <div key={index} className="w-1/8 h-full flex flex-col justify-end items-center px-1 group">
                            <motion.div
                                className="w-full bg-green-500 rounded-t-sm hover:bg-green-300 transition-colors duration-200 relative"
                                style={{ height: `${heightPercentage}%` }}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.8, delay: 0.7 + index * 0.05 }}
                            >
                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {val}
                                </span>
                            </motion.div>
                            <span className="text-xs text-gray-500 mt-2">{dayLabels[index]}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MockClassAttendance: React.FC = () => {
    // Data: HIIT (45%), Yoga (30%), Spin (25%)
    const classes = [45, 30, 25]; // Sum is 100%
    const labels = ['HIIT', 'Yoga Flow', 'Spin Class'];
    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-sky-500'];

    return (
        <div className="flex flex-col md:flex-row items-center justify-around h-56 py-4">
            {/* Mock Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `conic-gradient(
                            #EC4899 0% 45%,
                            #A855F7 45% 75%,
                            #0EA5E9 75% 100%
                        )`
                    }}
                ></div>
                <div className="w-24 h-24 bg-gray-900 rounded-full text-white text-sm flex flex-col items-center justify-center border-4 border-gray-700 shadow-inner">
                    <span className='font-bold text-2xl text-pink-400'>100%</span>
                </div>
            </div>

            {/* Legend */}
            <ul className="space-y-2 text-sm text-gray-400 mt-6 md:mt-0">
                {classes.map((percent, index) => (
                    <li key={index} className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${colors[index]}`}></span>
                        <span className="font-semibold text-gray-200">{percent}%</span> - {labels[index]}
                    </li>
                ))}
            </ul>
        </div>
    );
};


// --- METRIC CARD COMPONENT ---
interface MetricCardProps extends Metric {
    delay: number;
}
const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, link, color, delay }) => (
    <motion.a
        href={link}
        className="group bg-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col justify-between transition-all duration-300 border border-gray-700 hover:ring-2 hover:ring-offset-2 hover:ring-green-400 hover:scale-[1.02]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
    >
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-xl bg-gray-900 ${color} shadow-lg border border-gray-700`}>
                <Icon className="w-7 h-7" />
            </div>
        </div>
        <div className="mt-4">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-extrabold text-white mt-1 group-hover:text-green-400 transition-colors">{value}</p>
        </div>
    </motion.a>
);

// --- MEMBERSHIP GOAL TRACKER ---
interface GoalTrackerProps {
    target: number;
    achieved: number;
    delay: number;
}
const MembershipGoalTracker: React.FC<GoalTrackerProps> = ({ target, achieved, delay }) => {
    const progress = Math.min(100, Math.round((achieved / target) * 100));
    const isSuccess = progress >= 100;
    const color = isSuccess ? 'bg-purple-500' : 'bg-pink-500';
    const text = isSuccess ? 'text-purple-400' : 'text-pink-400';

    return (
        <motion.div
            className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
        >
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2"><TrophyIcon className={`w-6 h-6 ${text}`} /> New Member Goal</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full sm:w-2/3">
                    <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                        <span>Achieved: <span className="text-white font-bold">{achieved}</span></span>
                        <span>Target: <span className="text-white font-bold">{target}</span></span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <motion.div className={`h-3 rounded-full ${color}`} initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, type: 'spring', bounce: 0.3 }}></motion.div>
                    </div>
                    <p className={`mt-3 text-lg font-semibold ${text}`}>{isSuccess ? `GOAL ACHIEVED! Congrats!` : `${target - achieved} members to go this month.`}</p>
                </div>
                <div className="sm:w-1/3 flex justify-end items-center"><span className="text-6xl font-extrabold text-white"><span className={text}>{progress}</span>%</span></div>
            </div>
        </motion.div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function FitnessDashboard() {
  const [data, setData] = useState<FitnessDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/fitness/dashboard');
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
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-green-400 flex flex-col items-center justify-center">
        <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl font-semibold">Loading Performance Center...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex flex-col items-center justify-center text-center p-4">
        <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Offline</h2>
        <p>{error || "Could not retrieve fitness data."}</p>
      </div>
    );
  }
  
  const { stats, sessions, membershipGoal } = data;
  const adminSlug = 'gym-admin';

  const cards: Metric[] = [
    { title: 'Total Members', value: stats.totalMembers, icon: UsersIcon, color: 'text-green-400', link: `/admin/${adminSlug}/members` },
    { title: 'Active Trainers', value: stats.totalTrainers, icon: HeartIcon, color: 'text-pink-400', link: `/admin/${adminSlug}/trainers` },
    { title: 'Monthly Check-ins', value: stats.monthlyCheckins.toLocaleString(), icon: ChartBarIcon, color: 'text-sky-400', link: `/admin/${adminSlug}/checkins` },
    { title: 'Classes This Week', value: stats.classesThisWeek, icon: CalendarDaysIcon, color: 'text-yellow-400', link: `/admin/${adminSlug}/classes` },
    { title: 'Sessions Today', value: stats.sessionsToday, icon: ClockIcon, color: 'text-purple-400', link: `/admin/${adminSlug}/schedule` },
  ];

  return (
    <div className="min-h-screen bg-gray-900 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <motion.header className="mb-10 pb-4 border-b border-gray-700" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Fitness <span className="text-green-400">Performance Center</span></h1>
          <p className="text-lg text-gray-500 mt-2">Real-time management for club utilization and class scheduling.</p>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {cards.map((card, index) => <MetricCard key={card.title} {...card} delay={0.3 + index * 0.05} />)}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <motion.div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                <h3 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-3 flex items-center gap-2"><ChartBarIcon className='w-6 h-6 text-green-400'/> Weekly Check-In Trends</h3>
                <MockCheckInTrends />
            </motion.div>
            <motion.div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                <h3 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-3 flex items-center gap-2"><UsersIcon className='w-6 h-6 text-pink-400'/> Class Attendance Distribution</h3>
                <MockClassAttendance />
            </motion.div>
        </section>
        
        <MembershipGoalTracker target={membershipGoal.target} achieved={membershipGoal.achieved} delay={0.8} />

        <motion.div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><CalendarDaysIcon className='w-6 h-6 text-purple-400'/> Live Class Schedule</h2>
                <a href={`/admin/${adminSlug}/schedule`} className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">Manage Full Schedule <ArrowRightIcon className='w-4 h-4'/></a>
            </div>
            {sessions.length > 0 ? (
                <ul className="space-y-4">
                    {sessions.map((session) => (
                        <li key={session.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-700 rounded-lg border-l-4 border-pink-500 hover:bg-gray-600 transition">
                            <div className="text-white font-medium truncate mb-1 sm:mb-0 flex items-center gap-3">
                                <ClockIcon className="w-5 h-5 text-pink-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-lg">{session.title}</p>
                                    <p className="text-xs text-gray-400">Instructor: <span className="font-medium text-gray-300">{session.instructor}</span></p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-green-400 flex items-center gap-1 flex-shrink-0 bg-gray-900 py-1 px-3 rounded-full">{session.time}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 text-gray-500">No sessions scheduled for today.</div>
            )}
        </motion.div>
      </div>
    </div>
  );
}