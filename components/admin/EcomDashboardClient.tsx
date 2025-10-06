'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon, // Replaced EyeDropperIcon with ShoppingCartIcon for 'Monthly Targets'
  MegaphoneIcon,
  UsersIcon,
  CubeTransparentIcon, // For 'Low Stock' instead of ChartBarSquareIcon
  EnvelopeIcon, // For 'Messages' instead of RssIcon
} from '@heroicons/react/24/outline';

// Mock components for ChartTwo and ChartThree remain as placeholders
const ChartTwo = () => (
  <div className="flex items-center justify-center h-52 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 text-gray-400">
    <p className="text-sm font-medium">Sales Statistics Chart (Placeholder)</p>
  </div>
);

const ChartThree = () => (
  <div className="flex items-center justify-center h-52 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 text-gray-400">
    <p className="text-sm font-medium">Activity Chart (Placeholder)</p>
  </div>
);

// DashboardCard component with a more premium, glass-like style
export interface DashboardCardProps {
  href: string;
  bgColor: string;
  title: string;
  icon: React.ElementType;
  value: string;
  progress: number;
  barColor: string;
}

// Staggered delay for card animation
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08 + 0.1, // Faster, more prominent stagger
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};


const DashboardCard = ({ href, bgColor, title, icon: Icon, value, progress, barColor }: DashboardCardProps) => {
  // Determine if it's a "danger" card for an extra visual punch
  const isDanger = title === 'Low Stock';
  const progressPercent = Math.min(Math.max(progress, 0), 100);

  return (
    <a
      href={href}
      className={`
        ${bgColor} 
        flex flex-col gap-6 p-6 rounded-3xl shadow-2xl 
        hover:shadow-3xl transition-all transform hover:scale-[1.03] group 
        relative overflow-hidden cursor-pointer
        backdrop-filter backdrop-blur-lg border border-white/20 dark:border-gray-700/50
        ${isDanger ? 'ring-2 ring-red-500/50 dark:ring-red-400/50' : ''}
      `}
    >
      {/* Dynamic Background Flare on hover */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl"></div>

      <div className="flex items-start gap-4">
        <div className="p-4 bg-white/90 rounded-xl shadow-lg dark:bg-gray-900/90 transition-all duration-300 group-hover:bg-white dark:group-hover:bg-gray-700">
          {/* Icon with a clear color */}
          <Icon className={`w-8 h-8 ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'} transition-colors duration-300`} />
        </div>
        <div className="flex-1 min-h-24">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-2xl">{title}</h3>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-1">{value}</p>
        </div>
      </div>

      <div className="relative w-full h-2 rounded-full bg-white/50 dark:bg-gray-700 overflow-hidden">
        <div 
          className={`${barColor} absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out`} 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      <div className="flex justify-between items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
        <span>{Math.round(progressPercent)}% Goal Progress</span>
        <span className="flex items-center text-orange-600 dark:text-orange-400 group-hover:underline transition-colors duration-300">
          Analyze <ArrowRightIcon className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </a>
  );
};

export interface DashboardData {
  slug: string;
  clientData: { newClients: number };
  inventoryData: { lowStock: number };
  agentData: { topAgent: string; topAgentSales: number };
  communicationData: { today: number };
  orderData: { completedToday: number };
  salesData?: {
    todaySales?: number;
    monthlyTargetProgress?: number;

  };
  taskData?: { tasks: { id: string; taskName: string; dueDate: string; dueTime: string }[] };
}

type Props = DashboardData;

const calculateProgress = (current: number, goal?: number) => {
  if (!goal || goal === 0) return 0;
  const pct = (current / goal) * 100;
  return Math.min(Math.max(pct, 0), 100);
};

// **Enhanced Aurora Color Palette for Cards**
const COLOR_PALETTE = {
    sales: { bg: 'bg-gradient-to-br from-indigo-200/50 to-purple-200/50 dark:from-indigo-900/60 dark:to-purple-900/60', bar: 'bg-indigo-500' },
    targets: { bg: 'bg-gradient-to-br from-pink-200/50 to-red-200/50 dark:from-pink-900/60 dark:to-red-900/60', bar: 'bg-pink-500' },
    clients: { bg: 'bg-gradient-to-br from-green-200/50 to-teal-200/50 dark:from-green-900/60 dark:to-teal-900/60', bar: 'bg-green-500' },
    agent: { bg: 'bg-gradient-to-br from-teal-200/50 to-cyan-200/50 dark:from-teal-900/60 dark:to-cyan-900/60', bar: 'bg-cyan-500' },
    stock: { bg: 'bg-gradient-to-br from-red-200/50 to-orange-200/50 dark:from-red-900/60 dark:to-orange-900/60', bar: 'bg-red-500' },
    orders: { bg: 'bg-gradient-to-br from-yellow-200/50 to-orange-200/50 dark:from-yellow-900/60 dark:to-orange-900/60', bar: 'bg-orange-500' },
    messages: { bg: 'bg-gradient-to-br from-gray-200/50 to-blue-200/50 dark:from-gray-700/60 dark:to-blue-800/60', bar: 'bg-blue-500' },
};


export default function EcomDashboardClient(props: Props) {
  const salesGoal = 100; // Example goal for daily sales units

  const dataCards = [
    {
      href: `/admin/${props.slug}/sales`,
      bgColor: COLOR_PALETTE.sales.bg,
      title: 'Daily Sales',
      icon: ArrowTrendingUpIcon,
      value: `${props.salesData?.todaySales || 0} Units`,
      progress: calculateProgress(props.salesData?.todaySales || 0, salesGoal),
      barColor: COLOR_PALETTE.sales.bar,
    },
    {
      href: `/admin/${props.slug}/targets`,
      bgColor: COLOR_PALETTE.targets.bg,
      title: 'Monthly Targets',
      icon: ShoppingCartIcon,
      value: `${props.salesData?.monthlyTargetProgress || 0}% Achieved`,
      progress: props.salesData?.monthlyTargetProgress || 0,
      barColor: COLOR_PALETTE.targets.bar,
    },
    {
      href: `/admin/${props.slug}/customers`,
      bgColor: COLOR_PALETTE.clients.bg,
      title: 'New Clients',
      icon: UsersIcon,
      value: `${props.clientData.newClients} Clients`,
      progress: calculateProgress(props.clientData.newClients, 10),
      barColor: COLOR_PALETTE.clients.bar,
    },
    {
      href: `/admin/${props.slug}/agents`,
      bgColor: COLOR_PALETTE.agent.bg,
      title: 'Top Agent Sales',
      icon: ChartBarIcon,
      value: props.agentData.topAgent,
      progress: calculateProgress(props.agentData.topAgentSales, 10),
      barColor: COLOR_PALETTE.agent.bar,
    },
    {
      href: `/admin/${props.slug}/inventory`,
      bgColor: COLOR_PALETTE.stock.bg,
      title: 'Low Stock',
      icon: CubeTransparentIcon,
      value: `${props.inventoryData.lowStock} Items`,
      progress: calculateProgress(props.inventoryData.lowStock, 5),
      barColor: COLOR_PALETTE.stock.bar,
    },
    {
      href: `/admin/${props.slug}/orders`,
      bgColor: COLOR_PALETTE.orders.bg,
      title: 'Orders Completed',
      icon: CheckCircleIcon,
      value: `${props.orderData.completedToday} Orders`,
      progress: calculateProgress(props.orderData.completedToday, 50),
      barColor: COLOR_PALETTE.orders.bar,
    },
    {
      href: `/admin/${props.slug}/communications`,
      bgColor: COLOR_PALETTE.messages.bg,
      title: 'New Messages',
      icon: EnvelopeIcon,
      value: `${props.communicationData.today} Today`,
      progress: calculateProgress(props.communicationData.today, 50),
      barColor: COLOR_PALETTE.messages.bar,
    },
  ];

  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen p-4 sm:p-8 lg:p-12 transition-colors duration-500">
      {/* Subtle Background Effect (Aurora) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Light Mode Flare */}
          <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:hidden"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-pink-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:hidden"></div>
          {/* Dark Mode Flare */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 hidden dark:block"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 hidden dark:block"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Main Dashboard Header */}
        <motion.header 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="mb-4 lg:mb-6  py-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md "
        >
          <h1 className="text-2xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-orange-500 dark:from-indigo-400 dark:to-orange-300 leading-tight tracking-tighter">
            Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mt-3 font-light">
            Actionable insights and performance metrics for today.
          </p>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="w-full lg:w-2/3 space-y-8">
            
            {/* 1. Progress & Key Metrics Section (The Grid) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white border-b border-orange-400/30 pb-2">Key Performance Indicators</h2>
              
              {/* Low Stock Alert - Prominent, animated warning */}
              {props.inventoryData.lowStock > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center p-5 rounded-2xl bg-red-100/80 dark:bg-red-900/80 text-red-800 dark:text-red-200 mb-6 shadow-xl border border-red-300 dark:border-red-700 backdrop-blur-sm"
                >
                  <span className="mr-4 text-3xl animate-pulse">🚨</span>
                  <p className="text-lg font-medium">
                    Critical Alert: <span className="font-extrabold">{props.inventoryData.lowStock}</span> products are **low on stock**.
                    <a href="/admin/inventory" className="ml-2 text-red-900 dark:text-red-100 underline hover:no-underline font-semibold transition-colors duration-300">
                      Restock Now <ArrowRightIcon className="inline ml-1 w-4 h-4" />
                    </a>
                  </p>
                </motion.div>
              )}

              {/* Data Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {dataCards.map((card, idx) => (
                  <motion.div key={card.title} custom={idx} variants={cardVariants} initial="hidden" animate="visible">
                    <DashboardCard {...card} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 2. Charts Section - Clean, side-by-side presentation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="p-6 rounded-3xl shadow-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sales Distribution</h2>
                <ChartTwo />
              </div>
              <div className="p-6 rounded-3xl shadow-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">User Activity Log</h2>
                <ChartThree />
              </div>
            </motion.div>

            {/* 3. Ongoing Campaigns Section - Distinct and action-oriented */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="p-6 sm:p-8 rounded-3xl shadow-xl bg-gradient-to-br from-purple-100/60 to-indigo-100/60 dark:from-purple-900/60 dark:to-indigo-950/60 border border-purple-300/50 dark:border-indigo-700/50 backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-6">
  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Recent / Active Orders</h3>
  <a
    href={`/admin/${props.slug}/orders`}
    className="py-2 px-5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
  >
    View All
  </a>
</div>

<div className="space-y-4">
  {[
    {
      id: 'ORD-001',
      customerName: 'John Doe',
      orderDesc: '2x Smartwatch, 1x Fitness Band',
      progress: 80,
      color: 'bg-green-500',
      status: 'On Delivery',
    },
    {
      id: 'ORD-002',
      customerName: 'Mary Wanjiru',
      orderDesc: '1x Wireless Earbuds, 1x Phone Case',
      progress: 45,
      color: 'bg-yellow-500',
      status: 'Processing',
    },
    {
      id: 'ORD-003',
      customerName: 'Alex Kiptoo',
      orderDesc: '1x Laptop Stand',
      progress: 100,
      color: 'bg-blue-500',
      status: 'Delivered',
    },
  ].map((order, i) => (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1 + 0.8 }}
    >
      <a href={`/orders/${order.id}`} className="block">
        <div
          className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-4 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-indigo-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h18l-1.68 9.39a2 2 0 01-1.98 1.61H6.66a2 2 0 01-1.98-1.61L3 3zm0 0l1.5 9h15L21 3M5 21h2a2 2 0 002-2v-1H5v3zm10-3v1a2 2 0 002 2h2v-3h-4z"
            />
          </svg>

          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">
              {order.customerName}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {order.orderDesc}
            </p>
            <div className="mt-2 w-full h-1 rounded-full bg-gray-300 overflow-hidden">
              <div
                className={`${order.color} h-full transition-all duration-500`}
                style={{ width: `${order.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 block">
              {order.status}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{order.progress}%</span>
          </div>
        </div>
      </a>
    </motion.div>
  ))}
</div>

            </motion.div>
          </div>

          {/* Sidebar / Today's Plan Section - Elegant and focused */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full lg:w-1/3 p-6 sm:p-8 space-y-6 bg-gradient-to-b from-white/70 to-gray-100/70 dark:from-gray-800/70 dark:to-gray-900/70 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white">Marketing Campaigns</h3>
              <a href={`/admin/${props.slug}/tasks`} className="py-2 px-5 text-sm font-medium bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105">
                Manage
              </a>
            </div>
            
              <div className="space-y-4">
                {[
                  { id: '1', campaignName: 'Holiday Sales Drive', campaignDesc: 'Boost holiday sales by focusing on discounted products.', progress: 75, color: 'bg-green-500' },
                  { id: '2', campaignName: 'Customer Retention Campaign', campaignDesc: 'Follow up with existing customers for repeat sales.', progress: 40, color: 'bg-yellow-500' },
                  { id: '3', campaignName: 'New Product Launch', campaignDesc: 'Promote the latest product to drive initial sales.', progress: 90, color: 'bg-blue-500' }
                ].map((camp, i) => (
                  <motion.div key={camp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.8 }}>
                    <a href={`/campaigns/${camp.id}`} className="block">
                      <div className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-4 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600`}>
                        <MegaphoneIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-white">{camp.campaignName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{camp.campaignDesc}</p>
                          <div className="mt-2 w-full h-1 rounded-full bg-gray-300 overflow-hidden">
                            <div className={`${camp.color} h-full transition-all duration-500`} style={{ width: `${camp.progress}%` }}></div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{camp.progress}%</span>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white">Today's Focus</h3>
              <a href={`/admin/${props.slug}/tasks`} className="py-2 px-5 text-sm font-medium bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105">
                All Tasks
              </a>
            </div>
            <div className="grid gap-4">
              {props.taskData?.tasks && props.taskData.tasks.slice(0, 3).length > 0 ? (
                props.taskData.tasks.slice(0, 3).map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                    className="bg-white dark:bg-gray-700/80 shadow-lg p-5 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:bg-indigo-50/50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-600"
                  >
                    <a href={`/taskdetails/${task.id}`} className="block group">
                        <div className="flex items-start">
                            <ClipboardDocumentListIcon className="w-6 h-6 mr-3 mt-1 text-indigo-500 flex-shrink-0" />
                            <div className='flex-1'>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors">{task.taskName}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Due: <span className="font-semibold">{task.dueDate}</span> at <span className="font-semibold">{task.dueTime}</span>
                                </p>
                            </div>
                            <ArrowRightIcon className="w-5 h-5 ml-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </a>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white/70 dark:bg-gray-700/70 shadow-md p-6 rounded-xl text-center text-lg font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                  🎉 All clear! No urgent tasks for today.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}