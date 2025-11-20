'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CalendarDaysIcon, UserCircleIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// --- Interfaces ---
interface Article {
  id: string;
  name: string;
  title?: string;
  slug: string;
  imageUrl: string;
  subtitle: string;
  publishDate?: string;
  category?: string;
  author?: string;
  authorAvatar?: string;
}

interface FeaturedArticlesSectionProps {
  sectionTitle?: string; // Added for flexibility
  sectionSubtitle?: string; // Added for flexibility
  featured?: Article[]; 
  storeSlug: string;
}

// --- Mock Data (Fallbacks) ---
const fallbackArticles: Article[] = [
  {
    id: 'fa-1',
    name: 'The Future of Precision Medicine: AI and Personalized Care',
    slug: 'precision-medicine-2025',
    imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=2532&auto=format&fit=crop',
    subtitle: 'How AI and genetic profiling are customizing treatments for individual patients, leading to higher success rates and fewer side effects.',
    publishDate: 'Oct 12, 2024',
    category: 'Research',
    author: 'Dr. Sarah Jenkins',
    authorAvatar: 'https://images.unsplash.com/photo-1582266859550-d45f7823e20e?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'fa-2',
    name: 'Mental Wellness in the Digital Age: Strategies for Connection',
    slug: 'mental-wellness-digital',
    imageUrl: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?q=80&w=2693&auto=format&fit=crop',
    subtitle: 'Strategies for maintaining mental health amidst the noise of social media and constant connectivity.',
    publishDate: 'Sep 28, 2024',
    category: 'Wellness',
    author: 'Mark Thompson',
    authorAvatar: 'https://images.unsplash.com/photo-1544723795-3fb646cb0d75?q=80&w=2694&auto=format&fit=crop'
  },
  {
    id: 'fa-3',
    name: 'Nutrition Myths Debunked: Fact vs. Fiction in Daily Intake',
    slug: 'nutrition-myths',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2653&auto=format&fit=crop',
    subtitle: 'We separate fact from fiction regarding superfoods, intermittent fasting, and daily vitamin intake.',
    publishDate: 'Sep 15, 2024',
    category: 'Nutrition',
    author: 'Lisa Ray',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=2574&auto=format&fit=crop'
  }
];

// --- Helper: Image Loader ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Animation Variants (Consistent) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function FeaturedArticlesSection({ 
    sectionTitle, 
    sectionSubtitle, 
    featured, 
    storeSlug 
}: FeaturedArticlesSectionProps) {
  const router = useRouter();
  
  // Use props or fallback
  const articles = (featured && featured.length > 0) ? featured : fallbackArticles;

  const basePath = `/${storeSlug}/article`;

  return (
    <section id="articles" className="relative py-24 bg-white dark:bg-gray-950 overflow-hidden">
      
      {/* Subtle Grid Background (Consistent Theme) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* --- Section Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 mb-4"
              >
                <BookOpenIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm">
                    Editorial Insights
                </span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight"
              >
                {sectionTitle || "Expert Perspectives on Better Health"}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-lg text-gray-600 dark:text-gray-400"
              >
                {sectionSubtitle || "Dive into our latest research, clinical trials, and thought leadership articles."}
              </motion.p>
          </div>

          <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onClick={() => router.push(`/${storeSlug}/blog`)}
              className="hidden md:inline-flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group py-2 px-4 rounded-full border border-indigo-200 dark:border-indigo-900"
          >
              View All Articles
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        {/* --- Articles Grid --- */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {articles.map((art) => (
            <motion.article
              key={art.id}
              variants={cardVariants}
              // Card Styling Updated for Indigo theme and MediaSection consistency
              className="group flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all duration-300 cursor-pointer"
            >
                <Link href={`${basePath}/${art.slug}`} passHref className='flex flex-col h-full'>
                    {/* Image Container */}
                    <div className="relative w-full h-64 overflow-hidden">
                        <Image
                            src={art.imageUrl}
                            alt={art.name || 'Article Image'}
                            fill
                            loader={loader}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        
                        {/* Category Badge - Unified Style */}
                        {art.category && (
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-200 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full shadow-sm">
                                    {art.category}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Body */}
                    <div className="flex flex-col flex-grow p-6 md:p-8">
                        
                        {/* Meta Data */}
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                            {art.publishDate && (
                            <div className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-4 h-4 text-indigo-500" />
                                <span>{art.publishDate}</span>
                            </div>
                            )}
                            {/* Reading Time Estimate (Mock) */}
                            <div className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                <span>5 min read</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
                            {art.name || art.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                            {art.subtitle}
                        </p>

                        {/* Footer: Author & CTA */}
                        <div className="pt-6 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {art.authorAvatar ? (
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                        <Image
                                            src={art.authorAvatar}
                                            alt={art.author || 'Author'}
                                            fill
                                            loader={loader}
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                        <UserCircleIcon className="w-6 h-6" />
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {art.author || "Editorial Team"}
                                </span>
                            </div>

                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <ArrowRightIcon className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.article>
          ))}
        </motion.div>
        
        {/* Unified Footer CTA */}
        <div className="mt-16 text-center">
            <motion.a 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                onClick={() => router.push(`/${storeSlug}/blog`)}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-300 cursor-pointer"
            >
                View All Articles
                <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.a>
        </div>

      </div>
    </section>
  );
}