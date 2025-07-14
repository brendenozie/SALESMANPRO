// app/admin/[adminSlug]/page.tsx
'use client'; // This component will use client-side features like useState, useEffect

import React, { useState, useEffect, useMemo } from 'react';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// --- Sample Data Generation (for fallback) ---
const generateSampleDashboardData = () => ({
  totalProperties: Math.floor(Math.random() * 100) + 50,
  activeListings: Math.floor(Math.random() * 40) + 10,
  pendingSales: Math.floor(Math.random() * 15) + 5,
  totalAgents: Math.floor(Math.random() * 30) + 5,
  newInquiriesToday: Math.floor(Math.random() * 10) + 1,
  pendingShowings: Math.floor(Math.random() * 8) + 2,
  recentActivities: [
    { id: 'act1', type: 'Property Added', description: 'New luxury villa listed in Karen', date: new Date(Date.now() - Math.random() * 86400000).toLocaleString() },
    { id: 'act2', type: 'Inquiry Received', description: 'New inquiry for "Riverside Apartment"', date: new Date(Date.now() - Math.random() * 86400000 * 2).toLocaleString() },
    { id: 'act3', type: 'Agent Joined', description: 'Agent Jane Doe onboarded', date: new Date(Date.now() - Math.random() * 86400000 * 3).toLocaleString() },
    { id: 'act4', type: 'Sale Pending', description: 'Offer accepted for "Garden House"', date: new Date(Date.now() - Math.random() * 86400000 * 5).toLocaleString() },
  ],
  popularProperties: [
    { id: 'prop1', title: 'Luxury Villa in Karen', views: Math.floor(Math.random() * 500) + 100 },
    { id: 'prop2', title: 'Modern Apartment, Kilimani', views: Math.floor(Math.random() * 300) + 50 },
    { id: 'prop3', title: 'Commercial Plot, Upper Hill', views: Math.floor(Math.random() * 200) + 30 },
  ],
});

interface AdminDashboardPageProps {
  params: {
    adminSlug: string;
  };
}

export default function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { adminSlug } = params;
  const [dashboardData, setDashboardData] = useState<any>(null); // Use a more specific type in a real app
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, you'd fetch data from your API here:
    // const fetchDashboardData = async () => {
    //   setIsLoading(true);
    //   try {
    //     const res = await fetch(`/api/admin/${adminSlug}/dashboard-summary`);
    //     if (!res.ok) throw new Error('Failed to fetch dashboard data');
    //     const data = await res.json();
    //     setDashboardData(data);
    //   } catch (err: any) {
    //     console.error("Error fetching dashboard data:", err);
    //     setError(err.message || "Failed to load dashboard data.");
    //     setDashboardData(generateSampleDashboardData()); // Fallback to sample data
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchDashboardData();

    // For now, directly use sample data or simulate loading
    const timer = setTimeout(() => {
      setDashboardData(generateSampleDashboardData());
      setIsLoading(false);
    }, 500); // Simulate network delay
    return () => clearTimeout(timer);
  }, [adminSlug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="ml-4 text-xl text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p>{error}</p>
        <button
          onClick={() => { /* Implement retry logic or navigate away */ }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome, Admin <span className="text-indigo-600">({adminSlug})</span> 👋
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Quick overview of your real estate operations.
          </p>
        </div>
        <Link
          href={`/admin/${adminSlug}/properties/add-new`} // Example: Link to add new property
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <BuildingOfficeIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Property
        </Link>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Properties"
          value={dashboardData.totalProperties}
          icon={<BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />}
          description="Across all listings"
        />
        <DashboardCard
          title="Active Listings"
          value={dashboardData.activeListings}
          icon={<CheckCircleIcon className="h-8 w-8 text-green-600" />}
          description="Currently available"
        />
        <DashboardCard
          title="Pending Sales"
          value={dashboardData.pendingSales}
          icon={<ClockIcon className="h-8 w-8 text-yellow-600" />}
          description="Offers accepted, awaiting closure"
        />
        <DashboardCard
          title="New Inquiries (Today)"
          value={dashboardData.newInquiriesToday}
          icon={<ChatBubbleLeftRightIcon className="h-8 w-8 text-teal-600" />}
          description="Recent client messages"
        />
      </div>

      {/* Recent Activity & Popular Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <NewspaperIcon className="h-6 w-6 text-blue-500" /> Recent Activities
          </h3>
          <ul className="divide-y divide-gray-200">
            {dashboardData.recentActivities.map((activity: any) => (
              <li key={activity.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium">{activity.type}: <span className="text-gray-600">{activity.description}</span></p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
                {/* You might add an action button here, e.g., <button>View</button> */}
              </li>
            ))}
          </ul>
          {dashboardData.recentActivities.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activities to display.</p>
          )}
        </div>

        {/* Popular Properties */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <StarIcon className="h-6 w-6 text-yellow-500" /> Popular Properties
          </h3>
          <ul className="divide-y divide-gray-200">
            {dashboardData.popularProperties.sort((a: any, b: any) => b.views - a.views).map((prop: any) => (
              <li key={prop.id} className="py-3 flex items-center justify-between">
                <p className="text-gray-800 font-medium">{prop.title}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {prop.views} Views
                </span>
              </li>
            ))}
          </ul>
          {dashboardData.popularProperties.length === 0 && (
            <p className="text-gray-500 text-center py-4">No popular properties yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Dashboard Card Component
interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, description }) => (
  <div className="p-6 rounded-xl shadow-md border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center">
      <div className="flex-shrink-0 bg-indigo-50 rounded-full p-3 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
    <p className="mt-2 text-sm text-gray-500">{description}</p>
  </div>
);