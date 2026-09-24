'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FireIcon, 
  ClockIcon, 
  SunIcon, 
  BoltIcon, 
  MapPinIcon, 
  TrophyIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/solid';
import { ArrowTrendingUpIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// --- TYPE DEFINITIONS ---
interface DashboardViewProps {
  displayUser: {
    name: string;
    avatar: string;
    location: string;
    streak: string;
  };
  programs?: any[];
  memberships?: any[];
  checkIns?: any[];
  bookings?: any[];
  slug?: string;
}

// --- TAILWIND SAFELIST MAP ---
const colorStyles: Record<string, { bg: string, text: string, stroke: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', stroke: 'stroke-emerald-500' },
  red: { bg: 'bg-red-100', text: 'text-red-600', stroke: 'stroke-red-500' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', stroke: 'stroke-teal-500' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', stroke: 'stroke-indigo-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', stroke: 'stroke-orange-500' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', stroke: 'stroke-blue-500' },
  green: { bg: 'bg-green-100', text: 'text-green-600', stroke: 'stroke-green-500' },
};

export default function DashboardView({ 
  displayUser, 
  programs = [], 
  memberships = [], 
  checkIns = [], 
  bookings = [], 
  slug = 'fitness' 
}: DashboardViewProps) {
  const activePlanName = memberships[0]?.plan?.name || (memberships.length > 0 ? 'Active Member' : 'Guest Tier');

  return (
    <div className="pb-10">
      {/* Top Header / Profile Card */}
      <div className="bg-white shadow-sm rounded-b-3xl pb-10 pt-10 px-8 mb-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-teal-500">
              <img 
                src={displayUser.avatar} 
                alt="User Avatar" 
                className="w-full h-full object-cover rounded-full border-4 border-white"
              />
            </div>
            
            <div>
              <p className="text-sm font-medium text-emerald-600 uppercase tracking-widest">Athlete Dashboard</p>
              <h1 className="text-4xl font-extrabold text-gray-900 mt-1">{displayUser.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-600" /> {activePlanName}
                </span>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                <span className="font-semibold text-gray-700">Total Visits: {displayUser.streak}</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
             <Link href={`/site/${slug}/fitness/listings`}>
               <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
                 <BoltIcon className="w-5 h-5" /> Browse Courses
               </button>
             </Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8">
          <blockquote className="text-lg text-gray-500 border-l-4 border-emerald-400 pl-4">
            "Discipline is the bridge between goals and accomplishment."
          </blockquote>
        </div>
      </div>
      
      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-8">
        
        {/* 4-COLUMN AUTHORITATIVE METRICS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard 
            title="Memberships" 
            value={memberships.length} 
            unit={memberships.length > 0 ? "Active Plan" : "None Active"} 
            icon={<CheckBadgeIcon className="w-6 h-6" />} 
            progress={memberships.length > 0 ? 100 : 0} 
            color="emerald"
          />
          <MetricCard 
            title="Gym Check-ins" 
            value={checkIns.length} 
            unit="Verified Visits" 
            icon={<MapPinIcon className="w-6 h-6" />} 
            progress={Math.min(checkIns.length * 10, 100)} 
            color="teal"
          />
          <MetricCard 
            title="Enrolled Courses" 
            value={programs.length} 
            unit="Digital Curriculums" 
            icon={<BoltIcon className="w-6 h-6" />} 
            progress={Math.min(programs.length * 25, 100)} 
            color="indigo"
          />
          <MetricCard 
            title="Bookings" 
            value={bookings.length} 
            unit="Sessions & Classes" 
            icon={<CalendarDaysIcon className="w-6 h-6" />} 
            progress={Math.min(bookings.length * 20, 100)} 
            color="orange"
          />
        </section>

        {/* RECENT ACTIVITY & MEMBERSHIP DETAILS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BoltIcon className="w-6 h-6 text-emerald-600" /> Recent Activity & Check-Ins
                </h2>
             </div>

             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                {checkIns.length === 0 && bookings.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <CalendarDaysIcon className="w-12 h-12 mx-auto mb-2 opacity-50 text-emerald-500" />
                    <p className="font-semibold text-gray-600">No recorded activity yet</p>
                    <p className="text-xs text-gray-400 mt-1">Check in at any gym facility or book a class to view attendance records here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {checkIns.slice(0, 5).map((ci: any) => (
                      <div key={ci.id} className="flex items-center justify-between py-4 px-4 -mx-4 rounded-2xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 text-emerald-600">
                            <MapPinIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{ci.location?.name || 'Gym Facility Check-in'}</h4>
                            <p className="text-xs font-medium text-gray-400">
                              {new Date(ci.checkInTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                          VERIFIED
                        </span>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
          
          {/* RIGHT COLUMN: Active Membership Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <CheckBadgeIcon className="w-5 h-5 text-emerald-600" /> Current Membership
              </h3>
              {memberships.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-4">No active gym membership subscription.</p>
                  <Link href={`/site/${slug}/fitness/listings`}>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors">
                      View Plans
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {memberships.map((m: any) => (
                    <div key={m.id} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-emerald-950 text-base">{m.plan?.name || 'Membership'}</h4>
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {m.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Valid: {new Date(m.startDate).toLocaleDateString()} - {new Date(m.endDate).toLocaleDateString()}
                      </p>
                      <div className="text-xs text-emerald-700 font-semibold">
                        Access: {m.plan?.locationAccess || 'ALL_LOCATIONS'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const ProgressRing = ({ progress, color }: { progress: number, color: string }) => {
  const normalizedProgress = Math.min(progress, 100);
  const strokeDashoffset = 360 - (normalizedProgress / 100) * 360;
  const style = colorStyles[color] || colorStyles.emerald;

  return (
    <div className="w-16 h-16 relative">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r="40%" strokeWidth="6" className="stroke-gray-100 fill-none" />
        <circle
          cx="50%" cy="50%" r="40%" strokeWidth="6"
          className={`fill-none ${style.stroke}`}
          strokeDasharray="360"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-900">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  progress, 
  color 
}: { 
  title: string; 
  value: number | string; 
  unit: string; 
  icon: React.ReactNode; 
  progress: number; 
  color: string; 
}) => {
  const style = colorStyles[color] || colorStyles.emerald;
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
      <div>
        <div className={`p-2.5 w-fit rounded-xl mb-4 ${style.bg} ${style.text}`}>
          {icon}
        </div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
        <p className="text-xs font-semibold text-emerald-600 mt-1">{unit}</p>
      </div>
      <div className="ml-2">
        <ProgressRing progress={progress} color={color} />
      </div>
    </div>
  );
};