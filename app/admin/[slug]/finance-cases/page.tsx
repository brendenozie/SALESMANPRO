// app/admin/[adminSlug]/cases/page.tsx

import { motion } from 'framer-motion';
import { PencilIcon, TrashIcon, PlusCircleIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

const casesData = [
  { id: "LGL-001", client: "Alice Johnson", type: "Corporate Mergers", status: "Active", assigned: "Dr. Evelyn Reed" },
  { id: "FIN-002", client: "Bob Williams", type: "Wealth Management", status: "On Hold", assigned: "Mr. Benjamin Carter" },
  { id: "LGL-003", client: "Charlie Davis", type: "Intellectual Property", status: "Closed", assigned: "Dr. Evelyn Reed" },
  { id: "FIN-004", client: "Diana Miller", type: "Tax Advisory", status: "Active", assigned: "Ms. Olivia Hayes" },
];

export default function CasesPage() {
  return (
    <div  >
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-400">Case List</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New Case
          </button>
        </div>

        <div className="overflow-x-auto bg-[#0A192F] rounded-lg shadow-md border border-blue-800">
          <table className="min-w-full divide-y divide-blue-700">
            <thead className="bg-[#1B2A41]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Case ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Assigned To</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900">
              {casesData.map((_case) => (
                <motion.tr
                  key={_case.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: casesData.indexOf(_case) * 0.05 }}
                  className="hover:bg-blue-900/30"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{_case.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{_case.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{_case.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${_case.status === 'Active' ? 'bg-green-100 text-green-800' :
                        _case.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {_case.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{_case.assigned}</td>
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