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

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  tier?: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function FitnessDashboard() {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [activeView, setActiveView] = useState('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fitnessData, setFitnessData] = useState<{
    items: any[];
    memberships: any[];
    checkIns: any[];
    trainingPlans: any[];
    bookings: any[];
  }>({
    items: [],
    memberships: [],
    checkIns: [],
    trainingPlans: [],
    bookings: [],
  });
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
        const resData = await fitnessRes.json();
        setFitnessData({
          items: resData.items || [],
          memberships: resData.memberships || [],
          checkIns: resData.checkIns || [],
          trainingPlans: resData.trainingPlans || [],
          bookings: resData.bookings || [],
        });
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
    location: 'Active Gym Member',
    streak: `${fitnessData.checkIns.length} Check-ins`,
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': 
        return (
          <DashboardView 
            displayUser={displayUser} 
            programs={fitnessData.items} 
            memberships={fitnessData.memberships}
            checkIns={fitnessData.checkIns}
            bookings={fitnessData.bookings}
            slug={slug}
          />
        );
      case 'workouts':
        return (
          <WorkoutsView 
            trainingPlans={fitnessData.trainingPlans} 
            slug={slug} 
          />
        );
      case 'programs':
        return (
          <ProgramsView 
            programs={fitnessData.items} 
            slug={slug} 
          />
        );
      case 'messages':
        return <MessagesView slug={slug} bookings={fitnessData.bookings} />;
      case 'settings':
        return <SettingsView />;

      default: 
        return (
          <DashboardView 
            displayUser={displayUser} 
            programs={fitnessData.items} 
            memberships={fitnessData.memberships}
            checkIns={fitnessData.checkIns}
            bookings={fitnessData.bookings}
            slug={slug}
          />
        );
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