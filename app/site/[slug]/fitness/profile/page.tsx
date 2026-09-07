'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import DashboardView from './components/dashboard/Views/DashboardView';
import Sidebar from './components/dashboard/sideBar';
import MessagesView from './components/dashboard/Views/MessagesView';
import ProgramsView from './components/dashboard/Views/ProgramsView';
import SettingsView from './components/dashboard/Views/SettingsView';
import WorkoutsView from './components/dashboard/Views/WorkoutsView';

// import Sidebar from '@/components/dashboard/Sidebar';
// import DashboardView from '@/components/dashboard/views/DashboardView';

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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function FitnessDashboard() {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [activeView, setActiveView] = useState('dashboard');
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

  const displayUser = {
    name: user?.name || session?.user?.name || 'Athlete',
    avatar: user?.avatar || session?.user?.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop',
    location: 'Los Angeles',
    streak: programs.length > 0 ? `${programs.length * 10} Days 🔥` : '0 Days',
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': 
        return <DashboardView displayUser={displayUser} programs={programs} />;
      case 'workouts':
        return <WorkoutsView programs={programs} />;
      case 'programs':
        return <ProgramsView programs={programs} />;
      case 'messages':
        return <MessagesView />;
      case 'settings':
        return <SettingsView />;

      default: 
        return <DashboardView displayUser={displayUser} programs={programs} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans selection:bg-emerald-200">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto mt-16">
        {renderContent()}
      </main>
    </div>
  );
}