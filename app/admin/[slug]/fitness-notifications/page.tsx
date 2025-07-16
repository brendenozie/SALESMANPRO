import React from 'react';
import { getCommunicationsData, Communication } from '@/constant/Data'; // Adjust path as needed
import { motion } from 'framer-motion';

interface CommunicationsProps {
  params: {
    adminSlug: string;
  };
}

const commCardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function CommunicationsPage({ params }: CommunicationsProps) {
  const { adminSlug } = params;
  const communicationsData: Communication[] = getCommunicationsData(adminSlug);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Notifications & Communications</h2>

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Message History</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary-dark text-white rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          + New Message
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {communicationsData.map((comm) => (
          <motion.div
            key={comm.id}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
            variants={commCardVariants}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-bold text-gray-900">{comm.subject}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                comm.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                comm.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{comm.content}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Type: {comm.type}</span>
              <span>Recipients: {comm.recipients}</span>
              {comm.sentDate && <span>Sent: {comm.sentDate}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}