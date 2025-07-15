// app/admin/[adminSlug]/content/page.tsx
"use client";

import React from 'react';
import AdminLayout from '../../../../components/AdminLayout'; // Adjust path as needed
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NewspaperIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { useParams } from 'next/navigation';

const contentCategories = [
  { label: "Article Management", hrefSuffix: "/articles", icon: NewspaperIcon, description: "Create, edit, and publish written content." },
  { label: "Video Management", hrefSuffix: "/videos", icon: VideoCameraIcon, description: "Upload, organize, and optimize video content." },
];

export default function ContentLibraryPage() {
  const params = useParams();
  const adminSlug = params.adminSlug as string;

  return (
    <div>
      <p className="text-gray-300 text-lg mb-8">
        Manage all your media assets, including articles, videos, and more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {contentCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Link key={index} href={`/admin/${adminSlug}${category.hrefSuffix}`} passHref>
              <motion.div
                className="bg-gray-800 rounded-xl p-8 shadow-lg cursor-pointer group hover:bg-gray-700 transition-colors duration-300 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Icon className="h-16 w-16 text-red-500 mb-4 group-hover:text-red-400 transition-colors" />
                <h3 className="text-2xl font-bold text-white mb-2">{category.label}</h3>
                <p className="text-gray-400">{category.description}</p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}