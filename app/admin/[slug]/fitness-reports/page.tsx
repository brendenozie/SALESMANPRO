import React from 'react';
import { getReportsData, ReportSummary } from '@/constant/Data'; // Adjust path as needed
import { motion } from 'framer-motion';

interface ReportsProps {
  params: {
    adminSlug: string;
  };
}

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ReportsPage({ params }: ReportsProps) {
  const { adminSlug } = params;
  const reportsSummary: ReportSummary = getReportsData(adminSlug);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Reports & Analytics</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Summary: {reportsSummary.period}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div className="border p-4 rounded-lg text-center" variants={statCardVariants}>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">${reportsSummary.totalRevenue.toFixed(2)}</p>
          </motion.div>
          <motion.div className="border p-4 rounded-lg text-center" variants={statCardVariants}>
            <p className="text-gray-500 text-sm">New Members</p>
            <p className="text-3xl font-bold text-blue-600">{reportsSummary.newMembers}</p>
          </motion.div>
          <motion.div className="border p-4 rounded-lg text-center" variants={statCardVariants}>
            <p className="text-gray-500 text-sm">Class Attendance Rate</p>
            <p className="text-3xl font-bold text-purple-600">{reportsSummary.classAttendanceRate}%</p>
          </motion.div>
          <motion.div className="border p-4 rounded-lg text-center" variants={statCardVariants}>
            <p className="text-gray-500 text-sm">Top Performing Class</p>
            <p className="text-xl font-bold text-gray-800">{reportsSummary.topPerformingClass}</p>
          </motion.div>
          <motion.div className="border p-4 rounded-lg text-center" variants={statCardVariants}>
            <p className="text-gray-500 text-sm">Most Booked Trainer</p>
            <p className="text-xl font-bold text-gray-800">{reportsSummary.mostBookedTrainer}</p>
          </motion.div>
        </div>
      </div>
      {/* Placeholder for more detailed charts/graphs */}
      <div className="bg-white p-6 rounded-lg shadow-md h-64 flex items-center justify-center text-gray-400">
        [ Charts and detailed graphs will go here ]
      </div>
    </div>
  );
}