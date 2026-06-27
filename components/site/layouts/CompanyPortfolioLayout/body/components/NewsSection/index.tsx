"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, EyeIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useStoreContext } from '@/contexts/StoreContext';
import { IBlog } from '@/types/typings';

// Optimized institutional asset image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Clean financial intelligence date parsing engine
const formatIntelDate = (isoString: string | null | undefined) => {
  if (!isoString) return "June 2026";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (error) {
    return "Intel Active";
  }
};

const mockRouterPush = (path: string) => {
  console.log(`Navigating to intelligence hub: ${path}`);
};

const fallbackIntelBriefs: IBlog[] = [
  {
    id: 'gt-intel-1',
    title: 'Macro Physical Execution & Corridor Security: Q2 Trade Ledger Analytics',
    excerpt: 'An deep-dive inspection of logistics insulation protocols across active deepwater shipping hubs, detailing risk mitigation frameworks against cross-border structural volatility.',
    coverImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2670&auto=format&fit=crop',
    companyId: '',
    slug: 'q2-macro-execution-report',
    content: '',
    isFeature: true,
    categories: [],
    tags: [],
    authorName: 'Risk & Strategy Division',
    status: 'PUBLISHED',
    publishedAt: '2026-06-15T08:00:00.000Z',
    views: 1420,
    likes: 89,
    description: null,
    contentUrl: null,
    thumbnailUrl: null,
    contentType: 'ARTICLE',
    category: 'Market Intelligence',
    duration: null,
    location: null,
    published: true,
    type: null,
    publishDate: '2026-06-15',
    authorId: null,
    photoAlbumId: null,
    videoAlbumId: null,
    createdAt: null,
    updatedAt: null
  },
  {
    id: 'gt-intel-2',
    title: 'Downstream Infrastructure Nodes: Multi-Berth Refining Facility Expansion Completed',
    excerpt: 'Technical brief detailing the calibration and full validation of our newest logistics terminal terminals, amplifying refined metal handling velocity by 34%.',
    coverImage: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=2670&auto=format&fit=crop',
    companyId: '',
    slug: 'refine-facility-node-expansion',
    content: '',
    isFeature: false,
    categories: [],
    tags: [],
    authorName: 'Operations Directorate',
    status: 'PUBLISHED',
    publishedAt: '2026-05-28T10:15:00.000Z',
    views: 980,
    likes: 54,
    description: null,
    contentUrl: null,
    thumbnailUrl: null,
    contentType: 'ARTICLE',
    category: 'Infrastructure',
    duration: null,
    location: null,
    published: true,
    type: null,
    publishDate: '2026-05-28',
    authorId: null,
    photoAlbumId: null,
    videoAlbumId: null,
    createdAt: null,
    updatedAt: null
  },
  {
    id: 'gt-intel-3',
    title: 'Risk Hedging Architectures: Insulating Assets via Multi-Sovereign Clearings',
    excerpt: 'Examining the performance matrix of Tier-1 compliance-locked clearings and how automated physical validation shields liquidity pools from supply side anomalies.',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop',
    companyId: '',
    slug: 'risk-hedging-clearings-architecture',
    content: '',
    isFeature: false,
    categories: [],
    tags: [],
    authorName: 'Compliance & Audit Board',
    status: 'PUBLISHED',
    publishedAt: '2026-05-11T14:30:00.000Z',
    views: 2110,
    likes: 132,
    description: null,
    contentUrl: null,
    thumbnailUrl: null,
    contentType: 'ARTICLE',
    category: 'Regulatory Matrix',
    duration: null,
    location: null,
    published: true,
    type: null,
    publishDate: '2026-05-11',
    authorId: null,
    photoAlbumId: null,
    videoAlbumId: null,
    createdAt: null,
    updatedAt: null
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function NewsSection({pagedata}: {pagedata: any}) {
  // const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const intelToRender = pagedata?.blogs && Array.isArray(pagedata?.blogs) && pagedata.blogs.length > 0
    ? pagedata.blogs
    : fallbackIntelBriefs;
  const organizationSlug = pagedata?.slug || 'grey-trading';

  return (
    <section id="news" className="py-24 md:py-36 bg-zinc-950 text-white font-sans relative overflow-hidden">
      
      {/* Structural Accent Top-Line Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-zinc-900" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Upper Dashboard Tracking Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 pb-8 border-b border-zinc-900">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">Operational Intelligence</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase">
              Market Updates & Analysis
            </h2>
            <p className="mt-4 text-sm text-zinc-400 font-light leading-relaxed">
              Real-time dispatches, asset performance adjustments, and regulatory audits compiled straight from our global node terminals.
            </p>
          </div>
          <div className="mt-6 md:mt-0 font-mono text-[10px] tracking-widest text-zinc-600 hidden sm:block">
            // LIVE_LEDGER_FEED_ENGAGED
          </div>
        </div>

        {/* Intelligence Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {intelToRender.slice(0, 3).map((brief) => (
            <motion.div
              key={brief.id}
              variants={itemVariants}
              className="bg-zinc-900/10 border border-zinc-900 rounded-xl overflow-hidden group flex flex-col justify-between transition-all duration-500 hover:bg-zinc-900/30 hover:border-zinc-800 shadow-xl"
            >
              <div>
                {/* Image Window Architecture */}
                <div className="relative h-52 w-full overflow-hidden bg-zinc-950 border-b border-zinc-900">
                  <Image
                    src={brief.coverImage || "https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=128"}
                    alt={brief.title || 'INTEL REPORT COVER'}
                    loader={loader}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover opacity-60 transition-transform duration-700 ease-out group-hover:scale-102 group-hover:opacity-75"
                  />
                  {/* Category Micro Tag */}
                  <div className="absolute top-4 left-4 z-10 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] font-mono tracking-wider uppercase text-zinc-400 px-2.5 py-1 rounded-md">
                    {brief.category || "General Brief"}
                  </div>
                </div>

                {/* Content Field Plates */}
                <div className="p-6 md:p-8 space-y-4">
                  
                  {/* Meta Information Bar */}
                  <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 select-none">
                    <span className="flex items-center gap-1.5">
                      <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-600" />
                      {formatIntelDate(brief.publishDate || brief.publishedAt)}
                    </span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <span className="flex items-center gap-1.5">
                      <EyeIcon className="w-3.5 h-3.5 text-zinc-600" />
                      {brief.views || 240} views
                    </span>
                  </div>

                  {/* Clean Non-Overlapping Heading Scale */}
                  <h3 className="font-extrabold text-lg sm:text-xl text-zinc-100 tracking-tight leading-snug line-clamp-2 group-hover:text-amber-500 transition-colors duration-300">
                    {brief.title}
                  </h3>
                  
                  {/* Text Body Block */}
                  <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed line-clamp-3 text-justify">
                    {brief.excerpt || 'No supplementary abstract available for selected terminal logs.'}
                  </p>
                </div>
              </div>

              {/* Action Vector Footers */}
              <div className="px-6 md:px-8 pb-6 pt-2">
                <Link 
                  href={`/companyprofile/blog/${brief.slug}`} 
                  // onClick={(e) => { 
                  //   e.preventDefault(); 
                  //   mockRouterPush(`/${organizationSlug}/blog/${brief.slug}`); 
                  // }} 
                  className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-zinc-300 hover:text-white transition-colors group/link"
                >
                  Access Intelligence
                  <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-500 group-hover/link:translate-x-1 group-hover/link:text-amber-500 transition-all" />
                </Link>
              </div>

            </motion.div>
          ))}
        </motion.div>

        {/* Centered Institutional Core CTA */}
        <div className="mt-16 flex justify-center">
          <Link 
            href={`/companyprofile/blog`} 
            className="inline-flex items-center gap-3 border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-zinc-700 text-zinc-200 hover:text-white font-bold py-3.5 px-8 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-lg"
          >
            Review Full Intelligence Hub
            <ArrowRightIcon className="w-4 h-4 text-zinc-500" />
          </Link>
        </div>

      </div>
    </section>
  );
}