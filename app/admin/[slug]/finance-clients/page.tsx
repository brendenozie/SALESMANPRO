// app/admin/[adminSlug]/clients/page.tsx

import { motion } from 'framer-motion';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

const clientsData = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "+1 (555) 123-4567", status: "Active" },
  { id: 2, name: "Bob Williams", email: "bob@example.com", phone: "+1 (555) 987-6543", status: "Inactive" },
  { id: 3, name: "Charlie Davis", email: "charlie@example.com", phone: "+1 (555) 111-2222", status: "Active" },
  { id: 4, name: "Diana Miller", email: "diana@example.com", phone: "+1 (555) 333-4444", status: "Active" },
];

export default function ClientsPage() {
  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-400">Client List</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New Client
          </button>
        </div>

        <div className="overflow-x-auto bg-[#0A192F] rounded-lg shadow-md border border-blue-800">
          <table className="min-w-full divide-y divide-blue-700">
            <thead className="bg-[#1B2A41]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Phone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900">
              {clientsData.map((client) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: client.id * 0.05 }}
                  className="hover:bg-blue-900/30"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{client.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-400 hover:text-blue-600 mr-3">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}