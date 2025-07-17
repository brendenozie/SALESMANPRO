'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  EyeDropperIcon,
  MegaphoneIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

import { ChartBarSquareIcon, RssIcon } from '@heroicons/react/24/solid';


// Mock components for ChartTwo and ChartThree as their actual implementation is not provided
const ChartTwo = () => (
  <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-inner text-gray-400">
    {/* Placeholder for your ChartTwo component */}
    <p>Sales Statistics Chart (Placeholder)</p>
  </div>
);

const ChartThree = () => (
  <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-inner text-gray-400">
    {/* Placeholder for your ChartThree component */}
    <p>Activity Chart (Placeholder)</p>
  </div>
);

// DashboardCard component - now accepts a Lucide React icon component directly
export interface DashboardCardProps {
  href: string;
  bgColor: string;
  title: string;
  icon: React.ElementType; // Changed to accept a React component for the icon
  value: string;
  progress: number;
  barColor: string;
}

const DashboardCard = ({ href, bgColor, title, icon: Icon, value, progress, barColor }: DashboardCardProps) => {
  return (
    // Use a standard <a> tag instead of Next.js Link for self-contained immersive
    <a href={href} className={`${bgColor} flex flex-col gap-6 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 group relative overflow-hidden`}>
      {/* Subtle background overlay on hover */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl"></div>

      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-full shadow-md dark:bg-gray-800 transition-colors duration-300">
          {/* Render the Lucide icon component */}
          <Icon className="w-10 h-10 text-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{value}</p>
        </div>
      </div>
      <div className="relative w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className={`${barColor} absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
        <span>{Math.round(progress)}% Completed</span> {/* Round progress for display */}
        <span className="flex items-center text-orange-600 font-medium group-hover:underline transition-colors duration-300">
          View Details <ArrowRightIcon className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </a>
  );
};

export interface DashboardData {
  clientData: { newClients: number };
  inventoryData: { lowStock: number };
  agentData: { topAgent: string; topAgentSales: number };
  communicationData: { today: number };
  orderData: { completedToday: number };
  salesData?: {
    todaySales?: number;
    monthlyTargetProgress?: number;
    leadsConverted?: number;
    demosConducted?: number;
    commissionEarned?: number;
  };
  taskData?: { tasks: { id: string; taskName: string; dueDate: string; dueTime: string }[] };
}

type Props = DashboardData;

const calculateProgress = (current: number, goal?: number) => {
  if (!goal || goal === 0) return 0; // Prevent division by zero
  const pct = (current / goal) * 100;
  return Math.min(Math.max(pct, 0), 100);
};

export default function EcomDashboardClient(props: Props) {
  const salesGoal = 100; // Example goal for daily sales units

  const dataCards = [
    {
      href: '/admin/sales',
      bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-700 dark:to-blue-800',
      title: 'Daily Sales',
      icon: ArrowTrendingUpIcon, // Lucide icon
      value: `${props.salesData?.todaySales || 0} Units`,
      progress: calculateProgress(props.salesData?.todaySales || 0, salesGoal),
      barColor: 'bg-green-500',
    },
    {
      href: '/admin/targets',
      bgColor: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-700 dark:to-pink-800',
      title: 'Monthly Targets',
      icon: EyeDropperIcon, // Lucide icon
      value: `${props.salesData?.monthlyTargetProgress || 0}% Achieved`,
      progress: props.salesData?.monthlyTargetProgress || 0,
      barColor: 'bg-blue-500',
    },
    {
      href: '/admin/customers',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-700 dark:to-green-800',
      title: 'New Clients',
      icon: UsersIcon, // Lucide icon
      value: `${props.clientData.newClients} Clients`,
      progress: calculateProgress(props.clientData.newClients, 10), // Example goal
      barColor: 'bg-green-500',
    },
    {
      href: '/admin/agents',
      bgColor: 'bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-700 dark:to-teal-800',
      title: 'Top Agent',
      icon: ChartBarIcon, // Lucide icon
      value: props.agentData.topAgent,
      progress: calculateProgress(props.agentData.topAgentSales, 10), // Example goal
      barColor: 'bg-teal-500',
    },
    {
      href: '/admin/inventory',
      bgColor: 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-700 dark:to-red-800',
      title: 'Low Stock',
      icon: ChartBarSquareIcon, // Lucide icon
      value: `${props.inventoryData.lowStock} Items`,
      progress: calculateProgress(props.inventoryData.lowStock, 5), // Example goal
      barColor: 'bg-red-500',
    },
    {
      href: '/admin/orders',
      bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-700 dark:to-orange-800',
      title: 'Orders Completed',
      icon: CheckCircleIcon, // Lucide icon
      value: `${props.orderData.completedToday} Orders`,
      progress: calculateProgress(props.orderData.completedToday, 50), // Example goal
      barColor: 'bg-orange-500',
    },
    {
      href: '/admin/communications',
      bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800',
      title: 'Messages',
      icon: RssIcon, // Lucide icon
      value: `${props.communicationData.today} Messages`,
      progress: calculateProgress(props.communicationData.today, 50), // Example goal
      barColor: 'bg-gray-500',
    },
  ];

  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Main Dashboard Header */}
      <header className="mb-8 lg:mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-white leading-tight">
          E-commerce Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
          Overview of your daily operations and key metrics.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3 space-y-6 lg:space-y-8">
          {/* Progress & Key Metrics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 sm:p-8 rounded-3xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Performance Overview</h2>
            </header>
            {props.inventoryData.lowStock > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 mb-6 shadow-md border border-yellow-200 dark:border-yellow-700"
              >
                <span className="mr-3 text-2xl">⚠️</span>
                <p className="text-sm sm:text-base">
                  <span className="font-semibold">{props.inventoryData.lowStock}</span> products are low on stock. {' '}
                  {/* Use <a> tag for self-contained immersive */}
                  <a href="/admin/inventory" className="text-yellow-900 dark:text-yellow-100 underline hover:no-underline font-medium">View Inventory</a>
                </p>
              </motion.div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataCards.map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.2 }} // Staggered animation
                >
                  <DashboardCard {...card} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Ongoing Campaigns Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-950 p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-200 dark:border-indigo-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Ongoing Campaigns</h3>
              {/* Use <a> tag for self-contained immersive */}
              <a href="/salescampaigns" className="py-2 px-4 sm:px-5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                View All
              </a>
            </div>
            <div className="space-y-6">
              {[
                { id: '1', campaignName: 'Holiday Sales Drive', campaignDesc: 'Boost holiday sales by focusing on discounted products.' },
                { id: '2', campaignName: 'Customer Retention Campaign', campaignDesc: 'Follow up with existing customers for repeat sales.' },
                { id: '3', campaignName: 'New Product Launch', campaignDesc: 'Promote the latest product to drive initial sales.' }
              ].map((camp, i) => (
                <motion.div key={camp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.4 }}>
                  {/* Use <a> tag for self-contained immersive */}
                  <a href={`/campaigns/${camp.id}`}>
                    <div className={`p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-start gap-4 ${i % 2 === 0 ? 'bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700' : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
                      <MegaphoneIcon className="w-8 h-8 text-orange-500 dark:text-orange-300 flex-shrink-0 mt-1" />
                      <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">{camp.campaignName}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{camp.campaignDesc}</p>
                        <span className="inline-flex items-center mt-4 py-2 px-4 text-sm font-medium bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300">
                          View Details <ArrowRightIcon className="ml-1 w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-200 dark:border-blue-700"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sales Statistics</h2>
              <ChartTwo />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 p-6 sm:p-8 rounded-3xl shadow-xl border border-green-200 dark:border-green-700"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Activity Overview</h2>
              <ChartThree />
            </motion.div>
          </div>
        </div>

        {/* Sidebar / Today's Plan Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="w-full lg:w-1/3 p-6 sm:p-8 space-y-6 bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">Today's Plan</h3>
            {/* Use <a> tag for self-contained immersive */}
            <a href="/tasks" className="py-2 px-4 sm:px-5 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105">
              View All
            </a>
          </div>
          <div className="grid gap-6">
            {props.taskData?.tasks && props.taskData.tasks.length > 0 ? (
              props.taskData.tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.8 }}
                  className="bg-white dark:bg-gray-700 shadow-md p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] border border-gray-100 dark:border-gray-600"
                >
                  <div className="flex items-center mb-2 text-xl font-semibold text-gray-800 dark:text-white">
                    <ClipboardDocumentListIcon className="mr-3 text-indigo-500 flex-shrink-0" />
                    {task.taskName}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Due: <span className="font-medium">{task.dueDate}</span> at <span className="font-medium">{task.dueTime}</span>
                  </p>
                  {/* Use <a> tag for self-contained immersive */}
                  <a href={`/taskdetails/${task.id}`} className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition-colors duration-300">
                    View Details <ArrowRightIcon className="ml-1 w-4 h-4" />
                  </a>
                </motion.div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-700 shadow-md p-6 rounded-xl text-center text-gray-500 dark:text-gray-400">
                No tasks planned for today!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


