// app/admin/[adminSlug]/sponsors/page.tsx
"use client";

import React from 'react';
import AdminLayout from '../../../../components/AdminLayout'; // Adjust path as needed
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, GlobeAltIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

const sampleSponsors = [
  { id: "sp1", name: "Tech Innovations Inc.", contact: "john.doe@techinnov.com", phone: "555-123-4567", website: "https://www.techinnov.com", logoUrl: "/images/logos/techinnov.png", status: "Active" },
  { id: "sp2", name: "Global Entertainment Co.", contact: "jane.s@globalent.com", phone: "555-987-6543", website: "https://www.globalent.com", logoUrl: "/images/logos/globalent.png", status: "Active" },
  { id: "sp3", name: "Future Foods Ltd.", contact: "mike.r@futurefoods.com", phone: "555-111-2222", website: "https://www.futurefoods.com", logoUrl: "/images/logos/futurefoods.png", status: "Pending" },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;


export default function SponsorsPage() {
  const handleEdit = (id: string) => alert(`Edit sponsor ${id}`);
  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete sponsor ${id}?`)) {
      alert(`Sponsor ${id} deleted.`);
    }
  };
  const handleAddSponsor = () => alert("Add new sponsor form will open.");

  return (
    <div>
      <div className="flex justify-end mb-6">
        <motion.button
          onClick={handleAddSponsor}
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Add New Sponsor
        </motion.button>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Logo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Company Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Contact Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Website
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sampleSponsors.map((sponsor, index) => (
              <motion.tr
                key={sponsor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-700 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0 h-16 w-16 relative rounded-md overflow-hidden bg-gray-900 flex items-center justify-center p-2">
                    <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain" loader={loader}/>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-medium text-white">{sponsor.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-400 flex items-center"><EnvelopeIcon className="h-4 w-4 mr-1" /> {sponsor.contact}</div>
                  <div className="text-gray-400 flex items-center"><PhoneIcon className="h-4 w-4 mr-1" /> {sponsor.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center">
                    <GlobeAltIcon className="h-4 w-4 mr-1" /> Visit Site
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sponsor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sponsor.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <motion.button
                    onClick={() => handleEdit(sponsor.id)}
                    className="text-indigo-400 hover:text-indigo-300 mr-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Edit ${sponsor.name}`}
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(sponsor.id)}
                    className="text-red-400 hover:text-red-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Delete ${sponsor.name}`}
                  >
                    <TrashIcon className="h-5 w-5 inline" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}