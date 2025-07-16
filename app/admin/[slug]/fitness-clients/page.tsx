import React from 'react';
import { motion } from 'framer-motion';
import { Client, getClientsData } from '@/constant/Data';

interface ClientsProps {
  params: {
    adminSlug: string;
  };
}

const clientRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ClientsPage({ params }: ClientsProps) {
  const { adminSlug } = params;
  const clientsData: Client[] = getClientsData(adminSlug);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Clients & Members Management</h2>

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">All Members</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary-dark text-white rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          + Add New Client
        </motion.button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
            </tr>
          </thead>
          <motion.tbody
            className="bg-white divide-y divide-gray-200"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {clientsData.map((client) => (
              <motion.tr key={client.id} variants={clientRowVariants}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.membershipType}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    client.membershipStatus === 'active' ? 'bg-green-100 text-green-800' :
                    client.membershipStatus === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {client.membershipStatus.charAt(0).toUpperCase() + client.membershipStatus.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.lastActive}</td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}