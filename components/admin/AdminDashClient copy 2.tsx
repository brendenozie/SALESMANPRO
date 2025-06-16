
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Session } from 'next-auth';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

// Asset imports
import salesIcon from '../../assets/bmi.png';
import targetIcon from '../../assets/hb.png';
import clientsIcon from '../../assets/bmi.png';
import productIcon from '../../assets/bmi.png';
import agentIcon from '../../assets/bmi.png';
import orderIcon from '../../assets/bmi.png';
import communicationIcon from '../../assets/bmi.png';

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

type Props = DashboardData & { session: Session };

const calculateProgress = (current: number, goal?: number) => {
  if (!goal) return 0;
  const pct = (current / goal) * 100;
  return Math.min(Math.max(pct, 0), 100);
};

const loaderProp = ({ src, width, quality }: { src: string; width?: number; quality?: number }) => {
  const params = [`w=${width || 800}`];
  if (quality) params.push(`q=${quality}`);
  return `${src}?${params.join('&')}`;
};

export default function AdminDashClient(props: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(open => !open);
  const salesGoal = 100;

  const dataCards = [
    {
      href: '/admin/sales',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      title: 'Daily Sales',
      icon: salesIcon,
      value: `${props.salesData?.todaySales || 0} Units`,
      progress: calculateProgress(props.salesData?.todaySales || 0, salesGoal),
      barColor: 'bg-green-500',
    },
    {
      href: '/admin/targets',
      bgColor: 'bg-pink-50 dark:bg-pink-900',
      title: 'Monthly Targets',
      icon: targetIcon,
      value: `${props.salesData?.monthlyTargetProgress || 0}% Achieved`,
      progress: props.salesData?.monthlyTargetProgress || 0,
      barColor: 'bg-blue-500',
    },
    {
      href: '/admin/customers',
      bgColor: 'bg-green-50 dark:bg-green-900',
      title: 'New Clients',
      icon: clientsIcon,
      value: `${props.clientData.newClients} Clients`,
      progress: calculateProgress(props.clientData.newClients, 10),
      barColor: 'bg-green-500',
    },
    {
      href: '/admin/agents',
      bgColor: 'bg-teal-50 dark:bg-teal-900',
      title: 'Top Agent',
      icon: agentIcon,
      value: props.agentData.topAgent,
      progress: calculateProgress(props.agentData.topAgentSales, 10),
      barColor: 'bg-teal-500',
    },
    {
      href: '/admin/inventory',
      bgColor: 'bg-red-50 dark:bg-red-900',
      title: 'Low Stock',
      icon: productIcon,
      value: `${props.inventoryData.lowStock} Items`,
      progress: calculateProgress(props.inventoryData.lowStock, 5),
      barColor: 'bg-red-500',
    },
    {
      href: '/admin/orders',
      bgColor: 'bg-orange-50 dark:bg-orange-900',
      title: 'Orders Completed',
      icon: orderIcon,
      value: `${props.orderData.completedToday} Orders`,
      progress: calculateProgress(props.orderData.completedToday, 50),
      barColor: 'bg-orange-500',
    },
    {
      href: '/admin/communications',
      bgColor: 'bg-gray-50 dark:bg-gray-900',
      title: 'Messages',
      icon: communicationIcon,
      value: `${props.communicationData.today} Messages`,
      progress: calculateProgress(props.communicationData.today, 50),
      barColor: 'bg-gray-500',
    },
  ];

  return (    
      <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen p-4 space-y-8 lg:space-y-0 lg:space-x-8">
        {/* Left Section */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* Progress Alert */}
          <div className="p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Progress</h2>
            </header>
            {props.inventoryData.lowStock > 0 && (
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 mb-6">
                ⚠️ {props.inventoryData.lowStock} products are low on stock. <Link href="/admin/inventory">View Inventory</Link>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataCards.map((card, idx) => (
                <Link key={idx} href={card.href} className={`${card.bgColor} flex flex-col gap-6 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-full shadow-md dark:bg-gray-800">
                      <Image src={card.icon} alt={card.title} width={48} height={48} loader={loaderProp} className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{card.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300">{card.value}</p>
                    </div>
                  </div>
                  <div className="relative w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className={`${card.barColor} absolute top-0 left-0 h-full rounded-full`} style={{ width: `${card.progress}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <span>{`${card.progress}% Completed`}</span>
                    <span className="text-orange-500 font-medium hover:underline">View Details</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Campaigns */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ongoing Campaigns</h3>
              <Link href="/salescampaigns" className="py-2 px-5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-lg hover:from-orange-600 hover:to-yellow-600 transition-transform transform hover:scale-105">View All</Link>
            </div>
            <div className="space-y-6">
              {[
                { id: 'campaign1', campaignName: 'Holiday Sales Drive', campaignDesc: 'Boost holiday sales by focusing on discounted products.', status: 'Ongoing' },
                { id: 'campaign2', campaignName: 'Customer Retention Campaign', campaignDesc: 'Follow up with existing customers for repeat sales.', status: 'Ongoing' },
                { id: 'campaign3', campaignName: 'New Product Launch', campaignDesc: 'Promote the latest product to drive initial sales.', status: 'Ongoing' },
              ].map((camp, i) => (
                <Link key={camp.id} href={`/campaigns/${camp.id}`} className="block">
                  <div className={`p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105 ${i % 2 === 0 ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800' : 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-600 dark:to-orange-700'}`}>                  
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{camp.campaignName}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{camp.campaignDesc}</p>
                    <button className={`w-full py-2 px-4 font-medium text-white rounded-lg shadow-md transition-colors ${i % 2 === 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-900 hover:bg-gray-800'}`}>View Details</button>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Statistics & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Statistics</h2>
              <ChartTwo />
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Exercise Activity</h2>
              <ChartThree />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-1/3 p-6 space-y-8 bg-gradient-to-b from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-extrabold text-gray-800">Today's Plan</h3>
            <Link href="/tasks" className="py-2 px-5 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25M8.25 9V5.25m-1.5 12.75h9a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0015.75 5.25h-7.5A2.25 2.25 0 006 7.5v7.5A2.25 2.25 0 008.25 17.25z" />
              </svg>
              View All
            </Link>
          </div>
          <div className="grid gap-6">
            {props.taskData?.tasks.map(task => (
              <div key={task.id} className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-start gap-4">
                <div className="flex-shrink-0 text-3xl">📋</div>
                <div className="flex-grow">
                  <h4 className="text-lg font-bold text-gray-800">{task.taskName}</h4>
                  <p className="text-sm text-gray-600 mt-1"><strong>Due:</strong> {task.dueDate} at {task.dueTime}</p>
                  <Link href={`/taskdetails/${task.id}`}>
                    <button className="mt-4 py-2 px-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-md shadow hover:from-orange-500 hover:to-orange-600 transition-all duration-300 flex items-center gap-2">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
