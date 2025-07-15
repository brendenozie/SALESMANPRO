// app/admin/[adminSlug]/page.tsx

import { motion } from 'framer-motion';
import { SparklesIcon, BriefcaseIcon, UsersIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const dataCards = [
  { title: "Total Clients", value: "850", icon: UsersIcon, color: "text-blue-400" },
  { title: "Active Cases", value: "124", icon: BriefcaseIcon, color: "text-green-400" },
  { title: "Pending Invoices", value: "$45,000", icon: SparklesIcon, color: "text-yellow-400" },
  { title: "Appointments Today", value: "3", icon: CheckCircleIcon, color: "text-purple-400" },
];

const recentActivities = [
  { id: 1, type: "New Client Added", description: "John Doe joined as a new client.", time: "2 hours ago" },
  { id: 2, type: "Invoice Sent", description: "Invoice #20240715 for ABC Corp.", time: "5 hours ago" },
  { id: 3, type: "Case Update", description: "Matter #FIN-001 progressed to review phase.", time: "Yesterday" },
  { id: 4, type: "Appointment Scheduled", description: "Meeting with Jane Smith at 10 AM.", time: "Yesterday" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0A192F] rounded-lg p-6 shadow-md flex items-center space-x-4 border border-blue-800"
            >
              <card.icon className={`h-12 w-12 ${card.color}`} />
              <div>
                <p className="text-xl font-medium text-blue-200">{card.title}</p>
                <p className="text-4xl font-bold text-white">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-blue-400">Recent Activity</h3>
          <div className="bg-[#0A192F] rounded-lg shadow-md border border-blue-800">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center p-4 border-b border-blue-900 last:border-b-0">
                <div>
                  <p className="text-lg font-semibold text-white">{activity.type}</p>
                  <p className="text-blue-200 text-sm">{activity.description}</p>
                </div>
                <p className="text-blue-300 text-sm">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (Example) */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-blue-400">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
              <UsersIcon className="h-5 w-5 mr-2" /> Add New Client
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
              <BriefcaseIcon className="h-5 w-5 mr-2" /> Create New Case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}