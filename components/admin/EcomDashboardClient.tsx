'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Session } from 'next-auth';
import { motion } from 'framer-motion';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

import salesIcon from '../../assets/bmi.png';
import targetIcon from '../../assets/hb.png';
import clientsIcon from '../../assets/bmi.png';
import productIcon from '../../assets/bmi.png';
import agentIcon from '../../assets/bmi.png';
import orderIcon from '../../assets/bmi.png';
import communicationIcon from '../../assets/bmi.png';
import DashboardCard from './components/DashboardCard';

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

export default function EcomDashboardClient(props: Props) {
  const salesGoal = 100;

  const dataCards = [
    {
      href: '/admin/sales',
      bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
      title: 'Daily Sales',
      icon: salesIcon,
      value: `${props.salesData?.todaySales || 0} Units`,
      progress: calculateProgress(props.salesData?.todaySales || 0, salesGoal),
      barColor: 'bg-green-500',
    },
    {
      href: '/admin/targets',
      bgColor: 'bg-gradient-to-br from-pink-100 to-pink-200',
      title: 'Monthly Targets',
      icon: targetIcon,
      value: `${props.salesData?.monthlyTargetProgress || 0}% Achieved`,
      progress: props.salesData?.monthlyTargetProgress || 0,
      barColor: 'bg-blue-500',
    },
    {
      href: '/admin/customers',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-200',
      title: 'New Clients',
      icon: clientsIcon,
      value: `${props.clientData.newClients} Clients`,
      progress: calculateProgress(props.clientData.newClients, 10),
      barColor: 'bg-green-500',
    },
    {
      href: '/admin/agents',
      bgColor: 'bg-gradient-to-br from-teal-100 to-teal-200',
      title: 'Top Agent',
      icon: agentIcon,
      value: props.agentData.topAgent,
      progress: calculateProgress(props.agentData.topAgentSales, 10),
      barColor: 'bg-teal-500',
    },
    {
      href: '/admin/inventory',
      bgColor: 'bg-gradient-to-br from-red-100 to-red-200',
      title: 'Low Stock',
      icon: productIcon,
      value: `${props.inventoryData.lowStock} Items`,
      progress: calculateProgress(props.inventoryData.lowStock, 5),
      barColor: 'bg-red-500',
    },
    {
      href: '/admin/orders',
      bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200',
      title: 'Orders Completed',
      icon: orderIcon,
      value: `${props.orderData.completedToday} Orders`,
      progress: calculateProgress(props.orderData.completedToday, 50),
      barColor: 'bg-orange-500',
    },
    {
      href: '/admin/communications',
      bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
      title: 'Messages',
      icon: communicationIcon,
      value: `${props.communicationData.today} Messages`,
      progress: calculateProgress(props.communicationData.today, 50),
      barColor: 'bg-gray-500',
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen p-4 space-y-8 lg:space-y-0 lg:space-x-8">
      <div className="w-full lg:w-2/3 space-y-6">
        <div className="p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Progress</h2>
          </header>
          {props.inventoryData.lowStock > 0 && (
            <div className="p-4 rounded-xl bg-yellow-100 text-yellow-800 mb-6">
              ⚠️ {props.inventoryData.lowStock} products are low on stock. <Link href="/admin/inventory">View Inventory</Link>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <DashboardCard {...card} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ongoing Campaigns</h3>
            <Link href="/salescampaigns" className="py-2 px-5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg">View All</Link>
          </div>
          <div className="space-y-6">
            {[{ id: '1', campaignName: 'Holiday Sales Drive', campaignDesc: 'Boost holiday sales by focusing on discounted products.' },
              { id: '2', campaignName: 'Customer Retention Campaign', campaignDesc: 'Follow up with existing customers for repeat sales.' },
              { id: '3', campaignName: 'New Product Launch', campaignDesc: 'Promote the latest product to drive initial sales.' }
            ].map((camp, i) => (
              <motion.div key={camp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link href={`/campaigns/${camp.id}`}> 
                  <div className={`p-6 rounded-xl shadow-lg hover:scale-[1.02] transition ${i % 2 === 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <h2 className="text-lg font-bold text-gray-800">{camp.campaignName}</h2>
                    <p className="text-sm text-gray-600">{camp.campaignDesc}</p>
                    <span className="inline-block mt-4 py-2 px-4 text-sm font-medium bg-orange-500 text-white rounded-lg">View Details</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Statistics</h2>
            <ChartTwo />
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Activity</h2>
            <ChartThree />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/3 p-6 space-y-8 bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-extrabold text-gray-800">Today's Plan</h3>
          <Link href="/tasks" className="py-2 px-5 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300">View All</Link>
        </div>
        <div className="grid gap-6">
          {props.taskData?.tasks.map(task => (
            <div key={task.id} className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg transition-all">
              <div className="mb-2 text-xl">📋 {task.taskName}</div>
              <p className="text-sm text-gray-600 mb-4">Due: {task.dueDate} at {task.dueTime}</p>
              <Link href={`/taskdetails/${task.id}`}>
                <span className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600">View Details</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
