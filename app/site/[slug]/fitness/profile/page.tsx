'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FireIcon, 
  ClockIcon, 
  SunIcon, 
  BoltIcon, 
  MapPinIcon, 
  TrophyIcon,
  HeartIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { ArrowTrendingUpIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  tier?: string;
}

interface FitnessProgram {
  id: string;
  status: string;
  course?: {
    title: string;
    description?: string;
    image?: string;
  };
  progress?: number;
  nextSession?: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const WaterDropIcon = ( { className } : { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-2.485 2.77-6.75 7.44-6.75 11.25a6.75 6.75 0 0013.5 0c0-3.81-4.265-8.48-6.75-11.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22.5c4.97 0 9-4.03 9-9h-18c0 4.97 4.03 9 9 9z" />
  </svg>
);

const FitnessDashboard = () => {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [programs, setPrograms] = useState<FitnessProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session, slug]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, fitnessRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`${apiBaseUrl}/site/${slug}/me/fitness`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }

      if (fitnessRes.ok) {
        const fitnessData = await fitnessRes.json();
        setPrograms(fitnessData.items || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show sign-in prompt if not authenticated
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <UserCircleIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Please sign in to access your fitness dashboard.
          </h2>
          <Link href={`/auth/signin`}>
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // Display values with defaults
  const displayUser = {
    name: user?.name || session?.user?.name || 'Athlete',
    avatar: user?.avatar || session?.user?.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop',
    location: 'Los Angeles',
    streak: programs.length > 0 ? `${programs.length * 10} Days 🔥` : '0 Days',
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-emerald-200">
      
      {/* Top Header / Profile Card */}
      <div className="bg-white shadow-xl rounded-b-3xl pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-teal-500">
                <img 
                  src={displayUser.avatar} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover rounded-full border-4 border-white"
                />
              </div>
              
              {/* Info */}
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

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-4">
               <button 
                 onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` })}
                 className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
               >
                 <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign Out
               </button>
               <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
                 Start Workout
               </button>
            </div>
          </div>
          
          {/* Daily Motivational Quote */}
          <div className="mt-8">
            <blockquote className="text-xl italic text-gray-600 border-l-4 border-emerald-400 pl-4">
              "Today's efforts determine tomorrow's results. Keep pushing your limits."
            </blockquote>
          </div>
        </div>
      </div>
      
      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        
        {/* --- 4-COLUMN METRICS GRID (THE RINGS) --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <MetricCard 
            title="Steps" 
            value="12,450" 
            unit="/ 10k Goal" 
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
            progress={124.5}
            color="emerald"
          />
          <MetricCard 
            title="Calories Burned" 
            value="680" 
            unit="/ 750 kcal" 
            icon={<FireIcon className="w-6 h-6" />}
            progress={90}
            color="red"
          />
          <MetricCard 
            title="Active Minutes" 
            value="85" 
            unit="/ 60 mins" 
            icon={<ClockIcon className="w-6 h-6" />}
            progress={141.6}
            color="teal"
          />
          <MetricCard 
            title="Sleep Score" 
            value="7.5" 
            unit="Hours Last Night" 
            icon={<MoonIcon className="w-6 h-6" />}
            progress={75}
            color="indigo"
          />

        </section>

        {/* --- ACTIVITY LOG & TRACKERS SPLIT --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BoltIcon className="w-6 h-6 text-yellow-500" /> Recent Activity
                </h2>
                <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-800">View All</a>
             </div>

             <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <ActivityList />
             </div>

             {/* Personal Records / Trophies */}
             <div className="mt-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-yellow-500" /> Personal Bests
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <TrophyCard title="Max Bench" value="185 kg" icon={<FireIcon />} color="red" />
                   <TrophyCard title="Fastest Mile" value="5:32 min" icon={<ClockIcon />} color="blue" />
                   <TrophyCard title="200-Day Streak" value="Achieved!" icon={<SunIcon />} color="orange" />
                   <TrophyCard title="Half Marathon" value="1:45:00" icon={<MapPinIcon />} color="green" />
                </div>
             </div>
          </div>
          
          {/* RIGHT COLUMN: Daily Trackers / Goals */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Water Intake Tracker */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
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

             {/* Next Challenge Card */}
             <div className="bg-emerald-500 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mt-10 -mr-10"></div>
                <h3 className="font-bold text-lg mb-1 relative z-10">28-Day Marathon Plan</h3>
                <p className="text-sm opacity-90 relative z-10 mb-4">You are on Week 2, Day 3. Keep focused!</p>
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden mb-4">
                   <div className="h-full bg-white" style={{ width: '45%' }}></div>
                </div>
                <button className="w-full py-2 bg-white text-emerald-700 font-bold rounded-lg text-sm hover:bg-gray-100 transition-colors">
                  Check Today's Workout
                </button>
             </div>
          </div>

        </section>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ProgressRing = ({ progress, color }:{progress: number, color: string}) => {
  const normalizedProgress = Math.min(progress, 100);
  const strokeDashoffset = 360 - (normalizedProgress / 100) * 360;
  
  // Dynamic color selection for the ring stroke
  const ringColorClass = `stroke-${color}-500`;

  return (
    <div className="w-24 h-24 relative">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          strokeWidth="10"
          className="stroke-gray-200 fill-none"
        />
        {/* Progress Circle (Arc) */}
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          strokeWidth="10"
          className={`fill-none ${ringColorClass}`}
          strokeDasharray="360"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      {/* Centered Percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{Math.round(progress)}%</span>
      </div>
       {/* If over 100%, show a small badge */}
      {progress > 100 && (
         <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, unit, icon, progress, color }:{title: string, value: number | string, unit: string, icon: React.ReactNode, progress: number, color: string}) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between transition-transform hover:scale-[1.02] duration-300 cursor-pointer">
    <div>
      <div className={`p-2 w-fit rounded-full bg-${color}-100 text-${color}-600 mb-3`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{value}</h3>
      <p className="text-sm text-gray-500">{unit}</p>
    </div>
    
    <div className="ml-4">
      <ProgressRing progress={progress} color={color} />
    </div>
  </div>
);

const ActivityItem = ({ type, duration, calories, icon, color }:{type: string, duration: string, calories: number | string, icon: React.ReactNode, color: string}) => (
  <div className="flex items-center justify-between py-3 px-4 -mx-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center text-${color}-600`}>
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{type}</h4>
        <p className="text-sm text-gray-500">{duration}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
       <span className="text-sm font-mono text-gray-600">{calories} kcal</span>
       <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

const ActivityList = () => (
  <div className="divide-y divide-gray-100">
    <ActivityItem 
      type="Outdoor Run" 
      duration="45 min" 
      calories="410" 
      icon={<MapPinIcon />} 
      color="emerald" 
    />
    <ActivityItem 
      type="Strength Training" 
      duration="60 min" 
      calories="350" 
      icon={<BoltIcon />} 
      color="red" 
    />
    <ActivityItem 
      type="Yoga & Meditation" 
      duration="30 min" 
      calories="120" 
      icon={<SunIcon />} 
      color="orange" 
    />
    <ActivityItem 
      type="Cycling" 
      duration="90 min" 
      calories="600" 
      icon={<ClockIcon />} 
      color="teal" 
    />
  </div>
);

const TrophyCard = ({ title, value, icon, color }:{title: string, value: number | string, icon: React.ReactNode, color: string}) => (
  <div className={`p-4 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center text-center bg-white hover:shadow-lg transition-shadow`}>
    <div className={`w-8 h-8 rounded-full bg-${color}-100 text-${color}-600 flex items-center justify-center mb-2`}>
       {icon}
    </div>
    <p className="text-xs text-gray-500 uppercase font-medium">{title}</p>
    <h5 className="font-bold text-lg text-gray-900 leading-tight">{value}</h5>
  </div>
);

export default FitnessDashboard;