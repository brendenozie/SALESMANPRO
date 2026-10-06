"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, TagIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const formatBlogDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
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
    publishedAt: '2026-05-12T10:00:00Z',
    category: 'Cardiology'
  },
  {
    id: 'fb-blog-2',
    title: 'Navigating Your Prescriptions: A Quick Guide',
    excerpt: 'Simple steps to help you understand your medications, dosage, and when to consult your doctor for refills.',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop',
    slug: 'navigating-your-prescriptions',
    publishedAt: '2026-06-02T10:00:00Z',
    category: 'Pharmacy'
  },
  {
    id: 'fb-blog-3',
    title: 'The Importance of Mental Health Check-ups',
    excerpt: 'Learn why regular mental health check-ins are just as vital as physical exams for your overall well-being.',
    coverImage: 'https://images.unsplash.com/photo-1516574163900-e791b8f041de?q=80&w=2670&auto=format&fit=crop',
    slug: 'mental-health-checkups',
    publishedAt: '2026-06-18T10:00:00Z',
    category: 'Wellness'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
  },
};

export default function NewsSection() {
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';
  
  const blogsToRender = storeFormData?.blogs && Array.isArray(storeFormData?.blogs) && storeFormData.blogs.length > 0
    ? storeFormData.blogs.slice(0, 3)
    : fallbackBlogs;
    
  const organizationSlug = storeFormData?.slug || 'care-clinic';

  return (
    <section id="news" className="relative py-24 lg:py-36 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* PREMIUM RADIAL AMBIENT FILLERS */}
      <div className="absolute top-0 right-0 -translate-y-12 w-[450px] h-[450px] bg-slate-200/40 dark:bg-slate-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 w-[400px] h-[400px] bg-teal-500/[0.03] dark:bg-teal-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      {/* CORE MESH DESIGN MATRIX */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.3] dark:opacity-[0.12] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.3) 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* --- SECTION HEADER ARCHITECTURE --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8"
        >
          <div className="max-w-2xl">
            <span 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-widest uppercase mb-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm"
              style={{ color: primaryColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
              Medical Journalism
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Latest Clinical <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400">Insights</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Stay fully informed with custom educational research, lifestyle adjustments, and professional notes from our resident medical board.
            </p>
          </div>

          <Link 
            href={`/${organizationSlug}/blog`} 
            className="hidden md:inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 font-bold text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(15,23,42,0.01)] hover:shadow-lg transition-all duration-300"
          >
            <span>Browse Full Library</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* --- PREMIUM ARTICLES GRID --- */}
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
                whileHover={{ y: -6 }}
                className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-[0_4px_25px_rgba(15,23,42,0.01)] border border-slate-200/50 dark:border-slate-800/60 hover:shadow-[0_20px_40px_rgba(15,23,42,0.04)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] transition-all duration-500"
              >
                {/* INTERACTIVE MEDIA CONTROLLER */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <Link href={`/${organizationSlug}/blog/${newsItem.slug}`} className="block h-full w-full">
                    <Image decoding="async"
                      src={newsItem.coverImage || "https://images.unsplash.com/photo-1603512193164-9844f77c8e6b?q=80&w=2670&auto=format&fit=crop"}
                      alt={newsItem.title || 'Medical Update'}
                      fill
                      className="object-cover transform transition-transform duration-700 ease-[0.16, 1, 0.3, 1] group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  </Link>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
                  
                  {/* FLOATING GLASS DATE INSIGNIA */}
                  <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl px-3.5 py-2.5 text-center shadow-sm border border-white/20 dark:border-slate-800/50 min-w-[64px]">
                    <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{dateObj.month}</span>
                    <span className="block text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{dateObj.day}</span>
                  </div>
                </div>

                {/* TEXTUAL BODY FRAMEWORK */}
                <div className="flex flex-col flex-grow p-7 lg:p-8">
                  {/* CATEGORY ACCESSORY LINE */}
                  <div className="flex items-center gap-2 mb-4 text-slate-400 dark:text-slate-500">
                    <TagIcon className="w-3.5 h-3.5 opacity-70" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {(newsItem as any).category || 'Clinical Advisory'}
                    </span>
                  </div>

                  <Link href={`/${organizationSlug}/blog/${newsItem.slug}`} className="block mb-3">
                    <h3 
                      className="text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight transition-colors duration-300"
                      style={{ transitionProperty: 'color' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                    >
                      {newsItem.title}
                    </h3>
                  </Link>

                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-3 mb-8 flex-grow">
                    {newsItem.excerpt || 'Access the full documentation and scientific breakdown of this public statement.'}
                  </p>

                  {/* ACTION TRIGGER BASELINE */}
                  <div className="pt-5 border-t border-slate-100 dark:border-slate-800/60">
                    <Link 
                      href={`/${organizationSlug}/blog/${newsItem.slug}`} 
                      className="inline-flex items-center font-bold text-sm tracking-tight transition-all group/link"
                      style={{ color: primaryColor }}
                    >
                      <span className="group-hover/link:underline decoration-2 underline-offset-4">Read Full Scientific Release</span>
                      <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* MOBILE FALLBACK BUTTON */}
        <div className="mt-14 text-center md:hidden">
          <Link 
            href={`/${organizationSlug}/blog`} 
            className="w-full inline-flex items-center justify-center py-4 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-[0.98]" 
            style={{ backgroundColor: primaryColor }}
          >
            <span>Browse Full Library</span>
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>

      </div>
    </section>
  );
}