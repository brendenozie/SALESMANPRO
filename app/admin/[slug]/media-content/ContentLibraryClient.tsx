"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NewspaperIcon, VideoCameraIcon, } from '@heroicons/react/24/outline'; // Swapped to outline for a cleaner look
import { useParams } from 'next/navigation';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

// A more vibrant and cohesive color palette
const COLORS = {
  bgPrimary: 'bg-slate-900',
  bgCard: 'bg-slate-800',
  textPrimary: 'text-white',
  textSecondary: 'text-slate-400',
  highlight: 'text-indigo-400',
  hoverCard: 'hover:bg-slate-700',
  shadow: 'shadow-2xl',
};

const contentCategories = [
  { label: "Article Management", hrefSuffix: "/articles", icon: NewspaperIcon, description: "Create, edit, and publish engaging written content." },
  { label: "Video Management", hrefSuffix: "/videos", icon: VideoCameraIcon, description: "Upload, organize, and optimize video content." },
  { label: "Image Library", hrefSuffix: "/images", icon: PhotoIcon, description: "Organize and manage your visual assets efficiently." },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ContentLibraryPage({ params }: PageProps) {
  
    const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  return (
    
      <div className={`p-8 rounded-lg ${COLORS.bgPrimary} min-h-screen`}>
        {/* Header Section with a subtle animated effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className={`text-5xl font-extrabold mb-4 ${COLORS.textPrimary}`}>
            Your Creative Hub 🚀
          </h1>
          <p className={`text-xl ${COLORS.textSecondary} max-w-2xl mx-auto`}>
            Effortlessly manage all your media assets from a single, intuitive dashboard.
          </p>
        </motion.div>

        {/* Grid of interactive cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {contentCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 1, transition: { duration: 0.2 } }} // More dynamic hover effect
                whileTap={{ scale: 0.95 }}
                className={`${COLORS.bgCard} p-8 rounded-2xl ${COLORS.shadow} border border-slate-700 cursor-pointer transition-transform duration-300 ${COLORS.hoverCard} overflow-hidden relative`}
              >
                {/* Background gradient for visual depth */}
                <div className="absolute inset-0 z-0 opacity-10 blur-xl pointer-events-none" style={{ background: 'radial-gradient(circle at top left, var(--tw-highlight) 0%, transparent 70%)' }} />
                
                <Link href={`/admin/${companyId}${category.hrefSuffix}`} passHref className="relative z-10 block">
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-4 rounded-full bg-slate-700 mb-6 border border-slate-600`}>
                      <Icon className={`h-12 w-12 ${COLORS.highlight}`} />
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${COLORS.textPrimary}`}>
                      {category.label}
                    </h3>
                    <p className={`text-sm ${COLORS.textSecondary}`}>
                      {category.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
  );
}