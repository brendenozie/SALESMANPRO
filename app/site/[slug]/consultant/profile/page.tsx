'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CalendarDaysIcon, 
  CheckCircleIcon, 
  BookOpenIcon, 
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  ArrowLongRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { ChevronRightIcon, DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  tier?: string;
}

interface Engagement {
  id: string;
  startDate: string;
  endDate: string | null;
  status: string;
  notes: string | null;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const TargetIcon = ({ className }: { className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const ConsultantDashboard = () => {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
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
      const [profileRes, engagementsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`${apiBaseUrl}/site/${slug}/me/engagements`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }

      if (engagementsRes.ok) {
        const data = await engagementsRes.json();
        setEngagements(data.items || []);
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
            Please sign in to access your dashboard.
          </h2>
          <Link href={`/auth/signin`}>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // Display values with defaults
  const displayUser = {
    name: user?.name || session?.user?.name || 'Client',
    firstName: (user?.name || session?.user?.name || 'there').split(' ')[0],
    upcomingEngagements: engagements.filter(e => new Date(e.startDate) > new Date()).length,
  };

  // Get next session if any
  const nextSession = engagements.find(e => new Date(e.startDate) > new Date());

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-amber-100">
      
      {/* --- HEADER & NEXT SESSION --- */}
      <div className="bg-white shadow-lg rounded-b-xl border-b border-gray-100 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="flex justify-between items-start mb-8">
            {/* Greeting */}
            <div>
              <p className="text-xl font-medium text-gray-500">Hello, {displayUser.firstName}.</p>
              <h1 className="text-4xl font-extrabold text-gray-900 mt-1">Ready for the next breakthrough?</h1>
            </div>
            
            {/* Sign Out Button */}
            <button 
              onClick={() => signOut({ redirect: true, callbackUrl: "/?logout=true" })}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

          {/* Next Session Card */}
          <div className="p-5 bg-blue-900 text-white rounded-xl shadow-xl shadow-blue-900/20 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4">
              <CalendarDaysIcon className="w-8 h-8 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm uppercase tracking-widest text-blue-300">Next Session</p>
                <h2 className="text-xl font-bold">
                  {nextSession?.notes || '1:1 Strategy Deep Dive (Week 4)'}
                </h2>
                <p className="text-sm text-blue-200">
                  {nextSession 
                    ? new Date(nextSession.startDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      }) + ' @ ' + new Date(nextSession.startDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Monday, December 2nd @ 10:00 AM PST'}
                </p>
              </div>
            </div>
            <button className="mt-4 md:mt-0 px-6 py-2 bg-amber-500 text-blue-900 font-bold rounded-lg flex items-center gap-2 hover:bg-amber-400 transition-colors">
              <VideoCameraIcon className="w-5 h-5" />
              Join Call Now
            </button>
          </div>
        </div>
      </div>
      
      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        
        {/* Quote / Insight */}
        <div className="mb-10 p-4 border-l-4 border-amber-500 bg-amber-50 rounded-lg text-gray-700 italic">
          <p className="font-semibold">Coach's Insight:</p>
          <p className="text-sm">"Remember, delegation isn't avoidance, it's leveraging your unique strengths. Focus on the 20% that moves the needle."</p>
        </div>

        {/* --- GOALS & ACTIONS GRID --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Goals & Action Items (Focus) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Primary Goal Tracker */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TargetIcon className="w-6 h-6 text-amber-500" /> Primary Goal: Launch MVP
                </h2>
                <span className="text-xs font-medium text-gray-500">Goal Set: Oct 15</span>
              </div>
              
              <GoalTracker progress={75} milestone="Launch Prep (Week 5)" />

              <div className="mt-4 flex justify-between text-sm text-gray-600">
                 <p className="font-semibold">Next Milestone: Beta Testing Start (85%)</p>
                 <button className="text-amber-600 hover:text-amber-700 flex items-center gap-1">
                   Edit Plan <ArrowLongRightIcon className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {/* 2. Action Items / Homework */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" /> Action Items (This Week)
              </h2>
              
              <div className="space-y-3 divide-y divide-gray-100">
                <ActionItem task="Finalize delegation matrix for admin tasks." deadline="Due Tomorrow" completed={true} />
                <ActionItem task="Draft the first version of the email marketing sequence." deadline="Due Friday" completed={false} />
                <ActionItem task="Book 3 discovery calls for market validation." deadline="Due Next Week" completed={false} />
                <ActionItem task="Review the 'Pricing Strategy' resource guide." deadline="Optional" completed={true} />
              </div>

              <div className="mt-6 text-sm text-gray-500">
                 <p>2/4 Required Actions Complete. Keep the momentum going!</p>
              </div>
            </div>

          </div>
          
          {/* RIGHT COLUMN: Support & History */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Session Log */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-500" /> Recent Session Log
              </h3>
              <div className="space-y-3">
                <LogItem date="Nov 25" topic="Identifying Bottlenecks" type="Strategy" />
                <LogItem date="Nov 18" topic="Defining Ideal Client" type="Vision" />
                <LogItem date="Nov 11" topic="Time Management Framework" type="Tactics" />
              </div>
              <button className="w-full mt-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                View Full History
              </button>
            </div>

            {/* Resource Library */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-gray-500" /> Resource Library
              </h3>
              <div className="space-y-3">
                <ResourceItem name="The Essential Delegation Matrix" type="Template" />
                <ResourceItem name="Pricing Strategy Playbook" type="PDF Guide" />
                <ResourceItem name="Q&A Session: Scaling" type="Video" />
              </div>
            </div>
            
             {/* Quick Links */}
             <div className="space-y-3 p-4 bg-gray-100 rounded-xl">
                <QuickLink text="Manage Billing & Invoices" icon={<DocumentTextIcon />} />
                <QuickLink text="Reschedule or Cancel Session" icon={<CalendarDaysIcon />} />
             </div>

          </div>
        </section>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const GoalTracker = ({ progress, milestone }:{progress: number; milestone: string}) => (
  <div>
    <div className="flex justify-between items-end mb-2">
      <span className="text-4xl font-extrabold text-amber-500">{progress}%</span>
      <span className="text-sm font-semibold text-gray-600">{milestone}</span>
    </div>
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

const ActionItem = ({ task, deadline, completed }:{task: string; deadline: string; completed: boolean}) => (
  <div className="flex items-center justify-between pt-3 cursor-pointer group">
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        completed 
          ? 'bg-blue-600 border-blue-600' 
          : 'border-gray-400 group-hover:border-blue-500'
      }`}>
        {completed && <CheckIcon className="w-3.5 h-3.5 text-white" />}
      </div>
      <p className={`text-base ${completed ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
        {task}
      </p>
    </div>
    <span className={`text-xs font-medium ${
      completed ? 'text-gray-400' : deadline.includes('Tomorrow') ? 'text-red-500' : 'text-gray-500'
    }`}>
      {deadline}
    </span>
  </div>
);

const LogItem = ({ date, topic, type }:{date: string; topic: string; type: string}) => (
  <div className="flex justify-between items-center py-2 group cursor-pointer border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-2">
      <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <p className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">{topic}</p>
    </div>
    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
      {type}
    </span>
  </div>
);

const ResourceItem = ({ name, type }:{name: string; type: string}) => (
  <div className="flex justify-between items-center py-2 group cursor-pointer border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-2">
      <DocumentTextIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <p className="text-sm text-gray-700 group-hover:text-amber-600 transition-colors">{name}</p>
    </div>
    <span className="text-xs text-gray-500">{type}</span>
  </div>
);

const QuickLink = ({ text, icon }:{text: string; icon: React.ReactElement}) => (
    <a href="#" className="flex items-center justify-between p-3 bg-white hover:bg-gray-200 rounded-lg transition-colors border border-gray-200">
        <div className="flex items-center gap-3">
            {React.cloneElement(icon, { className: 'w-5 h-5 text-blue-700' })}
            <span className="font-medium text-sm text-gray-800">{text}</span>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-500" />
    </a>
);

export default ConsultantDashboard;