// app/admin/[adminSlug]/videos/page.tsx
"use client";

import React from 'react';
import AdminLayout from '../../../../components/AdminLayout'; // Adjust path as needed
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

const sampleVideos = [
  { id: "vid1", title: "Exclusive Interview: Director James Cameron", status: "Published", date: "2025-07-12", duration: "18:30", views: "1.5M", imageUrl: "/images/videos/video1.jpg" },
  { id: "vid2", title: "Behind the Scenes: Cosmic Echo Visuals", status: "Published", date: "2025-07-08", duration: "10:15", views: "800K", imageUrl: "/images/videos/video2.jpg" },
  { id: "vid3", title: "Top 5 Tech Innovations of the Decade", status: "Draft", date: "2025-07-01", duration: "07:45", views: "2.1M", imageUrl: "/images/videos/video3.jpg" },
  { id: "vid4", title: "Fitness Unlocked: Home Workout Revolution", status: "Published", date: "2025-06-25", duration: "05:20", views: "450K", imageUrl: "/images/videos/video4.jpg" },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function VideoManagementPage() {
  const handleEdit = (id: string) => alert(`Edit video ${id}`);
  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete video ${id}?`)) {
      alert(`Video ${id} deleted.`);
    }
  };
  const handleUploadVideo = () => alert("Upload new video form will open.");
  const handlePreview = (id: string) => alert(`Preview video ${id}`);

  return (
    <div>
      <div className="flex justify-end mb-6">
        <motion.button
          onClick={handleUploadVideo}
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Upload New Video
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
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Views
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sampleVideos.map((video, index) => (
              <motion.tr
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-700 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 relative rounded-md overflow-hidden">
                      <Image src={video.imageUrl} alt={video.title} fill className="object-cover" loader={loader}/>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-medium text-white">{video.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    video.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {video.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  {video.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  {video.duration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  {video.views}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <motion.button
                    onClick={() => handlePreview(video.id)}
                    className="text-blue-400 hover:text-blue-300 mr-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Preview ${video.title}`}
                  >
                    <PlayCircleIcon className="h-5 w-5 inline" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleEdit(video.id)}
                    className="text-indigo-400 hover:text-indigo-300 mr-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Edit ${video.title}`}
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(video.id)}
                    className="text-red-400 hover:text-red-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Delete ${video.title}`}
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