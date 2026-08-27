'use client';

import React from 'react';
import { 
  FireIcon, 
  ClockIcon, 
  SunIcon, 
  BoltIcon, 
  MapPinIcon, 
  TrophyIcon,
  MoonIcon,
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
  programs: any[];
}

// --- TAILWIND SAFELIST MAP ---
// Required because Tailwind cannot compile dynamic strings like `bg-${color}-100`
const colorStyles: Record<string, { bg: string, text: string, stroke: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', stroke: 'stroke-emerald-500' },
  red: { bg: 'bg-red-100', text: 'text-red-600', stroke: 'stroke-red-500' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', stroke: 'stroke-teal-500' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', stroke: 'stroke-indigo-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', stroke: 'stroke-orange-500' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', stroke: 'stroke-blue-500' },
  green: { bg: 'bg-green-100', text: 'text-green-600', stroke: 'stroke-green-500' },
};

// --- ICONS ---
const WaterDropIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-2.485 2.77-6.75 7.44-6.75 11.25a6.75 6.75 0 0013.5 0c0-3.81-4.265-8.48-6.75-11.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22.5c4.97 0 9-4.03 9-9h-18c0 4.97 4.03 9 9 9z" />
  </svg>
);

// --- MAIN VIEW COMPONENT ---
export default function DashboardView({ displayUser, programs }: DashboardViewProps) {
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
              <p className="text-sm font-medium text-emerald-600 uppercase tracking-widest">Welcome Back</p>
              <h1 className="text-4xl font-extrabold text-gray-900 mt-1">{displayUser.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-red-500" /> {displayUser.location}
                </span>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                <span className="font-semibold text-gray-700">Active Streak: {displayUser.streak}</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
             <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
               <BoltIcon className="w-5 h-5" /> Start Workout
             </button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8">
          <blockquote className="text-lg text-gray-500 border-l-4 border-emerald-400 pl-4">
            "Today's efforts determine tomorrow's results. Keep pushing your limits."
          </blockquote>
        </div>
      </div>
      
      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-8">
        
        {/* 4-COLUMN METRICS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard 
            title="Steps" value="12,450" unit="/ 10k Goal" 
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />} progress={124.5} color="emerald"
          />
          <MetricCard 
            title="Calories Burned" value="680" unit="/ 750 kcal" 
            icon={<FireIcon className="w-6 h-6" />} progress={90} color="red"
          />
          <MetricCard 
            title="Active Minutes" value="85" unit="/ 60 mins" 
            icon={<ClockIcon className="w-6 h-6" />} progress={141.6} color="teal"
          />
          <MetricCard 
            title="Sleep Score" value="7.5" unit="Hours Last Night" 
            icon={<MoonIcon className="w-6 h-6" />} progress={75} color="indigo"
          />
        </section>

        {/* ACTIVITY LOG & TRACKERS SPLIT */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Activity Feed & Trophies */}
          <div className="lg:col-span-2 space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BoltIcon className="w-6 h-6 text-yellow-500" /> Recent Activity
                </h2>
                <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-800">View All</a>
             </div>

             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <ActivityList />
             </div>

             <div className="mt-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-yellow-500" /> Personal Bests
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <TrophyCard title="Max Bench" value="185 kg" icon={<FireIcon className="w-5 h-5"/>} color="red" />
                   <TrophyCard title="Fastest Mile" value="5:32 min" icon={<ClockIcon className="w-5 h-5"/>} color="blue" />
                   <TrophyCard title="200-Day Streak" value="Achieved!" icon={<SunIcon className="w-5 h-5"/>} color="orange" />
                   <TrophyCard title="Half Marathon" value="1:45:00" icon={<MapPinIcon className="w-5 h-5"/>} color="green" />
                </div>
             </div>
          </div>
          
          {/* RIGHT COLUMN: Daily Trackers */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <WaterDropIcon className="w-5 h-5 text-blue-500" /> Water Intake
                 </h3>
                 <span className="text-sm font-semibold text-blue-600">8 / 10 Glasses</span>
              </div>
              <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{ width: '80%' }}></div>
              </div>
              <div className="mt-4 flex justify-between">
                 <button className="text-blue-500 text-sm font-medium hover:text-blue-700">+ Add Glass</button>
                 <button className="text-gray-400 text-sm hover:text-gray-600">Reset</button>
              </div>
            </div>

             <div className="bg-emerald-500 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
                <h3 className="font-bold text-lg mb-1 relative z-10">28-Day Marathon Plan</h3>
                <p className="text-sm opacity-90 relative z-10 mb-4">You are on Week 2, Day 3. Keep focused!</p>
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden mb-4">
                   <div className="h-full bg-white" style={{ width: '45%' }}></div>
                </div>
                <button className="w-full py-3 bg-white text-emerald-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Check Today's Workout
                </button>
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
    <div className="w-20 h-20 relative">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r="40%" strokeWidth="8" className="stroke-gray-100 fill-none" />
        <circle
          cx="50%" cy="50%" r="40%" strokeWidth="8"
          className={`fill-none ${style.stroke}`}
          strokeDasharray="360"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{Math.round(progress)}%</span>
      </div>
      {progress > 100 && (
         <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, unit, icon, progress, color }: { title: string, value: number | string, unit: string, icon: React.ReactNode, progress: number, color: string }) => {
  const style = colorStyles[color] || colorStyles.emerald;
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300 cursor-pointer">
      <div>
        <div className={`p-2.5 w-fit rounded-xl mb-4 ${style.bg} ${style.text}`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
        <p className="text-xs font-semibold text-gray-400 mt-1">{unit}</p>
      </div>
      <div className="ml-2">
        <ProgressRing progress={progress} color={color} />
      </div>
    </div>
  );
};

const ActivityItem = ({ type, duration, calories, icon, color }: { type: string, duration: string, calories: number | string, icon: React.ReactNode, color: string }) => {
  const style = colorStyles[color] || colorStyles.emerald;
  return (
    <div className="flex items-center justify-between py-4 px-4 -mx-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.bg} ${style.text}`}>
          <div className="w-6 h-6">{icon}</div>
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{type}</h4>
          <p className="text-sm font-medium text-gray-500">{duration}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
         <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{calories} kcal</span>
         <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

const ActivityList = () => (
  <div className="divide-y divide-gray-50">
    <ActivityItem type="Outdoor Run" duration="45 min" calories="410" icon={<MapPinIcon />} color="emerald" />
    <ActivityItem type="Strength Training" duration="60 min" calories="350" icon={<BoltIcon />} color="red" />
    <ActivityItem type="Yoga & Meditation" duration="30 min" calories="120" icon={<SunIcon />} color="orange" />
    <ActivityItem type="Cycling" duration="90 min" calories="600" icon={<ClockIcon />} color="teal" />
  </div>
);

const TrophyCard = ({ title, value, icon, color }: { title: string, value: number | string, icon: React.ReactNode, color: string }) => {
  const style = colorStyles[color] || colorStyles.emerald;
  return (
    <div className="p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center bg-white hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${style.bg} ${style.text}`}>
         {icon}
      </div>
      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">{title}</p>
      <h5 className="font-black text-lg text-gray-900 leading-tight">{value}</h5>
    </div>
  );
};