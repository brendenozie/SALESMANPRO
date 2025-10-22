"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  PlusCircleIcon,
  GlobeAltIcon,
  CubeTransparentIcon,
  ArrowRightIcon,
  BellAlertIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon, // Imported for Logout button
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
// Removed: import { useSession, signOut } from 'next-auth/react'; 

// --- START: Simulated Auth & Data (Replaces next-auth/react) ---
// const useSession = () => ({
//   data: { user: { name: 'Simulated Admin' } },
//   status: 'authenticated',
// });

// Mock Sign Out function for demonstration
const mockSignOut = ({ callbackUrl } : { callbackUrl: string }) => {
    console.log(`User logged out. Redirecting to: ${callbackUrl}`);
    // In a real app, this would clear session cookies/tokens.
    // alert('User logged out successfully!'); // Using alert temporarily for user feedback
    //
    // clear session logic here
    // For example, remove user data from local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Clear any other session-related data
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    localStorage.removeItem('session');

    window.location.href = callbackUrl; // Uncomment for actual page navigation
};
// --- END: Simulated Auth & Data ---


// --- Simulated Data Source (Replace with Prisma/MongoDB Fetch Logic) ---
const SIMULATED_DATA = {
  storeCount: 0, // <<-- Change this to 3 to see the full dashboard view
  totalMetrics: [
    { title: "Total Revenue", value: "Ksh. 185,231", icon: <ArrowTrendingUpIcon />, color: "bg-green-500", lightColor: "text-green-600" },
    { title: "Active Orders", value: "25", icon: <ShoppingBagIcon />, color: "bg-indigo-500", lightColor: "text-indigo-600" },
    { title: "Total Customers", value: "450", icon: <UsersIcon />, color: "bg-purple-500", lightColor: "text-purple-600" },
    { title: "Store Locations", value: "3", icon: <BuildingStorefrontIcon />, color: "bg-orange-500", lightColor: "text-orange-600" },
  ],
  recentActivity: [
    { id: 1, type: "New Store Created", description: "Vintage Vibe Boutique added", time: "10 minutes ago", icon: <PlusCircleIcon className="h-5 w-5 text-green-500" /> },
    { id: 2, type: "New Order", description: "Order #562 placed at Gourmet Grinds", time: "35 minutes ago", icon: <ShoppingBagIcon className="h-5 w-5 text-indigo-500" /> },
    { id: 3, type: "Inventory Alert", description: "Low stock for 'Smartwatch' at Tech Treasures", time: "2 hours ago", icon: <BellAlertIcon className="h-5 w-5 text-red-500" /> },
    { id: 4, type: "Customer Signed Up", description: "New account created by Sarah Jones", time: "Yesterday", icon: <UsersIcon className="h-5 w-5 text-purple-500" /> },
  ],
  criticalAlerts: [
    { id: 101, message: "Two orders require manual review.", icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: "text-yellow-600 bg-yellow-100" },
    { id: 102, message: "Payout schedule updated, new cycle starts tomorrow.", icon: <GlobeAltIcon className="w-5 h-5" />, color: "text-blue-600 bg-blue-100" },
  ],
};

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

// --- Helper function for dynamic greeting ---
const getGreeting = (name : string) => {
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }
  return `${greeting}, ${name}`;
};

// --- Components ---

// 1. Enhanced Metric Card
const MetricCard = ({ title, value, icon, color, lightColor } : { title: string; value: string; icon: React.ReactElement; color: string; lightColor: string; }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px rgba(0,0,0,0.05)" }}
    className="relative p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform"
  >
    <div className={`absolute top-0 right-0 h-24 w-24 rounded-full opacity-10 ${color}`}></div>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="mt-1 text-3xl font-extrabold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${lightColor} bg-gray-50 ring-2 ring-gray-100`}>
        {React.cloneElement(icon, { className: "h-6 w-6" })}
      </div>
    </div>
    <p className="mt-4 text-xs font-medium text-gray-400 flex items-center">
      <SparklesIcon className="w-3 h-3 mr-1 text-yellow-500" />
      Last updated 5 minutes ago
    </p>
  </motion.div>
);

// 2. Empty State / Setup Wizard Component
const EmptyStateWizard = ({ name } : { name: string }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.6, type: "spring", damping: 10, stiffness: 100 }}
    className="col-span-1 md:col-span-3 lg:col-span-4 p-10 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center"
  >
    <CubeTransparentIcon className="w-16 h-16 text-indigo-200 mb-4 animate-pulse" />
    <h2 className="text-3xl font-extrabold mb-3">Welcome, {name}! Let's Get Started.</h2>
    <p className="max-w-xl text-indigo-200 mb-8 text-lg">
      It looks like you haven't created any store locations yet. Your business metrics will appear here once your first store is set up.
    </p>
    
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: "0 8px 15px rgba(255, 255, 255, 0.3)" }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-indigo-800 bg-white rounded-full shadow-lg transition-colors duration-200"
      onClick={() => {
        // Redirect to Store Setup Wizard
        window.location.href = '/stores';
      }}
    >
      <BuildingStorefrontIcon className="w-6 h-6 mr-3" />
      Proceed to Store Setup Wizard
      <ArrowRightIcon className="w-5 h-5 ml-2" />
    </motion.button>
    <p className="mt-4 text-sm text-indigo-300">It only takes 3 minutes to launch your first location.</p>
  </motion.div>
);

// 3. Quick Action Button
const QuickActionButton = ({
  title,
  description,
  icon,
  href = '#',
} : { title: string; description: string; icon: React.ReactElement; href?: string; }) => (
  <motion.a
    href={href}
    variants={itemVariants}
    whileHover={{ y: -3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
    className="group p-5 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer flex flex-col justify-between"
  >
    <div className="flex items-center justify-between">
      <div className="p-3 bg-gray-100 rounded-full group-hover:bg-indigo-500 transition-colors duration-200">
        {React.cloneElement(icon, { className: "h-6 w-6 text-gray-600 group-hover:text-white transition-colors duration-200" })}
      </div>
      <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
    </div>
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  </motion.a>
);

// 4. Logout Button Component
const LogoutButton = () => (
  <motion.button
    onClick={() => {
      // Calls the mock sign-out function
      mockSignOut({ callbackUrl: '/' }); 
    }}
    whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)" }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-full shadow-lg transition-all duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
  >
    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
    <span>Log Out</span>
  </motion.button>
);


// --- Main Admin Dashboard Component ---
const AdminDashboardPage = () => {
  const { data: session, status } = useSession(); // Use simulated hook
  const data = SIMULATED_DATA;

  // Use session name or default to 'Admin'
  const userName = session?.user?.name || 'Admin'; 
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting(userName));
  }, [userName]);

  // Determine if the user has stores (simulating a check against Prisma/MongoDB)
  const hasStores = useMemo(() => data.storeCount > 0, [data.storeCount]);

  // Adapt metrics data based on store existence
  const metrics = hasStores
    ? data.totalMetrics
    : data.totalMetrics.map(m => ({
        ...m,
        value: 'N/A',
      }));

  return (
    <div className="min-h-screen bg-gray-50 font-inter text-gray-800 p-4 sm:p-6 lg:p-10">
      
      {/* Dashboard Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8 flex justify-between items-start" // Flex for alignment
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            {greeting}
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Central management hub for all your e-commerce operations.
          </p>
        </div>
        
        {/* Logout Button */}
        <LogoutButton />
        
      </motion.header>

      {/* Main Content Grid */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Metric Cards Section (Full width on large screens) */}
        <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}

        {hasStores ? (
          <>
            {/* Quick Actions Panel (2/4 width) */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <QuickActionButton
                title="Create New Store"
                description="Launch another physical or virtual location."
                icon={<BuildingStorefrontIcon />}
                href="/create-store"
              />
              <QuickActionButton
                title="View Analytics"
                description="Dive deep into sales trends and growth."
                icon={<ArrowTrendingUpIcon />}
                href="/analytics"
              />
              <QuickActionButton
                title="Manage Users"
                description="Set roles and permissions for your team."
                icon={<UsersIcon />}
                href="/users"
              />
              <QuickActionButton
                title="System Settings"
                description="Configure payouts, taxes, and integrations."
                icon={<GlobeAltIcon />}
                href="/settings"
              />
            </div>

            {/* Recent Activity & Alerts Panel (2/4 width) */}
            <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
              {/* Critical Alerts Card */}
              <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                  <BellAlertIcon className="h-6 w-6 mr-2 text-red-500" />
                  Critical Alerts
                </h2 >
                <ul className="space-y-3">
                  {data.criticalAlerts.map((alert) => (
                    <li key={alert.id} className={`p-3 rounded-xl flex items-center space-x-3 ${alert.color}`}>
                      {alert.icon}
                      <p className="text-sm font-medium">{alert.message}</p>
                    </li>
                  ))}
                  <li className="text-right pt-2">
                    <a href="/alerts" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                      View All Alerts &rarr;
                    </a>
                  </li>
                </ul>
              </div>

              {/* Recent Activity Card */}
              <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                  <ClockIcon className="h-6 w-6 mr-2 text-gray-500" />
                  Recent Activity Log
                </h2>
                <ul className="divide-y divide-gray-100">
                  {data.recentActivity.map((activity) => (
                    <motion.li
                      key={activity.id}
                      variants={itemVariants}
                      className="py-3 flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        {activity.icon}
                        <div className="ml-4">
                          <p className="text-base font-medium text-gray-900">{activity.type}</p>
                          <p className="mt-1 text-sm text-gray-500">{activity.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        ) : (
          /* Empty State Section (Full width) */
          <EmptyStateWizard name={userName} />
        )}
      </motion.main>
    </div>
  );
};

export default AdminDashboardPage;
