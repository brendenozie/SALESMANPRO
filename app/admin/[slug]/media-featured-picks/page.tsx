// app/admin/[adminSlug]/featured-picks/page.tsx
"use client";

import React from 'react';
import AdminLayout from '../../../../components/AdminLayout'; // Adjust path as needed
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, StarIcon, FilmIcon, NewspaperIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

const sampleFeaturedPicks = [
  { id: "fp1", title: "The Quantum Enigma", type: "Series", imageUrl: "/images/toppicks/pick1.jpg", isFeatured: true },
  { id: "fp2", title: "Art of Storytelling with Lena Khan", type: "Interview", imageUrl: "/images/toppicks/pick2.jpg", isFeatured: true },
  { id: "fp3", title: "Human Creativity in the AI Age", type: "Article", imageUrl: "/images/toppicks/pick3.jpg", isFeatured: true },
  { id: "fp4", title: "New Horizons: Space Documentary", type: "Video", imageUrl: "/images/videos/video2.jpg", isFeatured: false },
  { id: "fp5", title: "Culinary Journeys: Italy", type: "Article", imageUrl: "/images/articles/travel.jpg", isFeatured: false },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;


export default function FeaturedPicksPage() {
  const handleToggleFeatured = (id: string, currentStatus: boolean) => {
    alert(`${currentStatus ? 'Removing' : 'Adding'} item ${id} ${currentStatus ? 'from' : 'to'} featured picks.`);
    // In a real app, update state/API
  };
  const handleAddPick = () => alert("Add new item to featured picks form will open.");

  return (
    <div>
      <div className="flex justify-end mb-6">
        <motion.button
          onClick={handleAddPick}
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Add New Pick
        </motion.button>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Thumbnail
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Type
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
            {sampleFeaturedPicks.map((pick, index) => (
              <motion.tr
                key={pick.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-700 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0 h-16 w-16 relative rounded-md overflow-hidden">
                    <Image src={pick.imageUrl} alt={pick.title} fill className="object-cover" loader={loader} />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-medium text-white">{pick.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-white">
                    {pick.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    pick.isFeatured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pick.isFeatured ? 'Featured' : 'Not Featured'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <motion.button
                    onClick={() => handleToggleFeatured(pick.id, pick.isFeatured)}
                    className={`mr-4 ${pick.isFeatured ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`${pick.isFeatured ? 'Remove from' : 'Add to'} featured`}
                  >
                    {pick.isFeatured ? <TrashIcon className="h-5 w-5 inline" /> : <StarIcon className="h-5 w-5 inline" />}
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