// components/NewsSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CalendarDaysIcon, TagIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper function for date formatting
const formatBlogDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return {
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        full: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  } catch (error) {
    return { day: '01', month: 'JAN', full: 'Date N/A' };
  }
};

const fallbackBlogs = [
  {
    id: 'fb-blog-1',
    title: 'New Study on Heart Health: What You Need to Know',
    excerpt: 'An in-depth look at recent research findings on cardiovascular wellness and practical tips to protect your heart.',
    coverImage: 'https://images.unsplash.com/photo-1603512193164-9844f77c8e6b?q=80&w=2670&auto=format&fit=crop',
    slug: 'new-study-heart-health',
    publishedAt: '2025-09-01T10:00:00Z',
    category: 'Cardiology'
  },
  {
    id: 'fb-blog-2',
    title: 'Navigating Your Prescriptions: A Quick Guide',
    excerpt: 'Simple steps to help you understand your medications, dosage, and when to consult your doctor for refills.',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop',
    slug: 'navigating-your-prescriptions',
    publishedAt: '2025-08-25T10:00:00Z',
    category: 'Pharmacy'
  },
  {
    id: 'fb-blog-3',
    title: 'The Importance of Mental Health Check-ups',
    excerpt: 'Learn why regular mental health check-ins are just as vital as physical exams for your overall well-being.',
    coverImage: 'https://images.unsplash.com/photo-1516574163900-e791b8f041de?q=80&w=2670&auto=format&fit=crop',
    slug: 'mental-health-checkups',
    publishedAt: '2025-08-18T10:00:00Z',
    category: 'Wellness'
  },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2 } 
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

export default function NewsSection() {
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // Teal-600
  
  // Merge fallback data with potential real data structure
  const blogsToRender = storeFormData?.blogs && Array.isArray(storeFormData?.blogs) && storeFormData.blogs.length > 0
    ? storeFormData.blogs.slice(0, 3)
    : fallbackBlogs;
    
  const organizationSlug = storeFormData?.slug || 'unbite-healthcare';

  return (
    <section id="news" className="relative py-24 md:py-32 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gray-200 dark:bg-gray-800 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-50 dark:bg-teal-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* --- Section Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
        >
            <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 bg-white dark:bg-gray-800 shadow-sm" style={{ color: primaryColor }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></span>
                    Latest Insights
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                    News & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Articles</span>
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Expert advice, latest medical research, and wellness tips curated just for you.
                </p>
            </div>

            {/* Desktop View All Button */}
            <Link href={`/${organizationSlug}/blog`} className="hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 hover:border-teal-500 hover:text-teal-600 transition-all duration-300 font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md">
                View All Posts
                <ArrowRightIcon className="w-4 h-4" />
            </Link>
        </motion.div>

        {/* --- Blog Grid --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogsToRender.map((newsItem) => {
            const dateObj = formatBlogDate(newsItem.publishedAt! as unknown as string);
            
            return (
              <motion.article
                key={newsItem.id}
                variants={cardVariants}
                className="group flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Link href={`/${organizationSlug}/blog/${newsItem.slug}`}>
                    <Image
                        src={newsItem.coverImage || "https://placehold.co/600x400"}
                        alt={newsItem.title || 'Blog Image'}
                        loader={loader}
                        fill
                        className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </Link>
                  
                  {/* Floating Date Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl px-3 py-2 text-center shadow-lg border border-white/20">
                    <span className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{dateObj.month}</span>
                    <span className="block text-xl font-extrabold text-gray-900 dark:text-white leading-none">{dateObj.day}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="flex flex-col flex-grow p-6 md:p-8">
                    {/* Category Label */}
                    <div className="flex items-center gap-2 mb-4">
                        <TagIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {(newsItem as any).category || 'Healthcare'}
                        </span>
                    </div>

                    <Link href={`/${organizationSlug}/blog/${newsItem.slug}`} className="block mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug group-hover:text-teal-600 transition-colors duration-300">
                        {newsItem.title}
                        </h3>
                    </Link>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                        {newsItem.excerpt || 'Read full article to learn more...'}
                    </p>

                    {/* Read More Link */}
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                        <Link 
                            href={`/${organizationSlug}/blog/${newsItem.slug}`} 
                            className="inline-flex items-center font-bold text-sm hover:underline decoration-2 underline-offset-4 transition-all"
                            style={{ color: primaryColor }}
                        >
                            Read Full Story
                            <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
          <Link href={`/${organizationSlug}/blog`} className="inline-flex items-center px-8 py-3 rounded-full font-semibold text-white shadow-lg transition duration-300 transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
            View All News
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>

      </div>
    </section>
  );
}