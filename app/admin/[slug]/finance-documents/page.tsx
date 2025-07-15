// app/admin/[adminSlug]/documents/page.tsx
"use client";

import { motion } from 'framer-motion';
import { EyeIcon, ArrowDownTrayIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

const documentsData = [
  { id: 1, name: "Client Agreement - Alice Johnson", type: "PDF", size: "1.2 MB", date: "2024-07-10" },
  { id: 2, name: "Investment Proposal - Q3 2024", type: "DOCX", size: "850 KB", date: "2024-07-08" },
  { id: 3, name: "Tax Filing Checklist 2023", type: "PDF", size: "300 KB", date: "2024-06-25" },
  { id: 4, name: "NDA - Partner X", type: "PDF", size: "500 KB", date: "2024-06-01" },
];

export default function DocumentsPage() {
  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-400">Document Library</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Upload New Document
          </button>
        </div>

        <div className="overflow-x-auto bg-[#0A192F] rounded-lg shadow-md border border-blue-800">
          <table className="min-w-full divide-y divide-blue-700">
            <thead className="bg-[#1B2A41]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Size</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Upload Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900">
              {documentsData.map((doc) => (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: doc.id * 0.05 }}
                  className="hover:bg-blue-900/30"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{doc.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{doc.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{doc.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{doc.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-400 hover:text-blue-600 mr-3">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button className="text-green-400 hover:text-green-600 mr-3">
                      <ArrowDownTrayIcon className="h-5 w-5" />
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