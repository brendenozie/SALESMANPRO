"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useStoreContext } from '@/contexts/StoreContext';
import { IBlog } from '@/types/typings';

// Optimized image loader template
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Clean historical presentation formatter
const formatBlogDate = (isoString: string | Date | null) => {
  if (!isoString) return "Editorial News";
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (error) {
    return "Editorial News";
  }
};

const mockRouterPush = (path: string) => {
  console.log(`Navigating to: ${path}`);
};

const fallbackBlogs: IBlog[] = [
  {
    id: 'fb-blog-1',
    title: 'Impact Report 2024: A Year of Change',
    excerpt: 'Discover the significant milestones and lives touched in our latest annual impact report, highlighting our work in education and healthcare.',
    coverImage: 'https://images.unsplash.com/photo-1523050854805-9a84a9235777?q=80&w=600&auto=format&fit=crop',
    companyId: '', slug: '', content: '', isFeature: false, categories: [], tags: [], authorName: null, status: 'DRAFT', publishedAt: new Date(), views: 0, likes: 0, description: null, contentUrl: null, thumbnailUrl: null, contentType: 'VIDEO', category: null, duration: null, location: null, published: true, type: null, publishDate: null, authorId: null, photoAlbumId: null, videoAlbumId: null, createdAt: null, updatedAt: null
  },
  {
    id: 'fb-blog-2',
    title: 'Building Brighter Futures: Our School Projects',
    excerpt: 'An in-depth look at how our school construction projects are transforming communities and providing better learning environments for children.',
    coverImage: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=600&auto=format&fit=crop',
    companyId: '', slug: '', content: '', isFeature: false, categories: [], tags: [], authorName: null, status: 'DRAFT', publishedAt: new Date(), views: 0, likes: 0, description: null, contentUrl: null, thumbnailUrl: null, contentType: 'VIDEO', category: null, duration: null, location: null, published: true, type: null, publishDate: null, authorId: null, photoAlbumId: null, videoAlbumId: null, createdAt: null, updatedAt: null
  },
  {
    id: 'fb-blog-3',
    title: 'The Power of a Single Donation',
    excerpt: 'Hear a compelling story about how one donation made a profound difference in the life of a family, illustrating the impact of every contribution.',
    coverImage: 'https://images.unsplash.com/photo-1526367790952-0925e3170e7a?q=80&w=600&auto=format&fit=crop',
    companyId: '', slug: '', content: '', isFeature: false, categories: [], tags: [], authorName: null, status: 'DRAFT', publishedAt: new Date(), views: 0, likes: 0, description: null, contentUrl: null, thumbnailUrl: null, contentType: 'VIDEO', category: null, duration: null, location: null, published: true, type: null, publishDate: null, authorId: null, photoAlbumId: null, videoAlbumId: null, createdAt: null, updatedAt: null
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export default function NewsSection({storeFormData}: {storeFormData: any}) {
  // const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const blogsToRender = storeFormData?.blogs && Array.isArray(storeFormData?.blogs) && storeFormData.blogs.length > 0
    ? storeFormData.blogs
    : fallbackBlogs;
    
  const organizationSlug = storeFormData?.slug || 'non-profit';

  return (
    <section id="news" className="py-24 md:py-32 bg-white border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Asynchronous Layout Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-16 md:mb-20">
          <div className="lg:col-span-7 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-3">
              Stay Informed
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Latest News & Stories.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm text-slate-600 leading-relaxed">
              Read our latest longform releases, strategic field updates, and narrative journals mapping localized milestones direct from our execution zones.
            </p>
          </div>
        </div>

        {/* Unified Display Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {blogsToRender.slice(0, 3).map((newsItem) => {
            const displayDate = formatBlogDate(newsItem.publishedAt || newsItem.createdAt);
            
            return (
              <motion.div
                key={newsItem.id}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-colors group flex flex-col justify-between"
              >
                {/* Visual Cover Wrapper */}
                <div 
                  className="relative aspect-[16/10] bg-slate-50 border-b border-slate-100 cursor-pointer overflow-hidden"
                  onClick={() => mockRouterPush(`/${organizationSlug}/blog/${newsItem.id}`)}
                >
                  <Image
                    src={newsItem.coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600"}
                    alt={newsItem.title || 'News Cover Artwork'}
                    loader={loader}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                </div>

                {/* Editorial Context Block */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Timestamp Tagline */}
                    <div className="text-xs font-bold text-slate-400 mb-2.5 uppercase tracking-wider">
                      {displayDate}
                    </div>

                    <h3 
                      className="font-bold text-lg text-slate-900 mb-2 tracking-tight line-clamp-2 cursor-pointer transition-colors hover:text-slate-800"
                      onClick={() => mockRouterPush(`/${organizationSlug}/blog/${newsItem.id}`)}
                    >
                      {newsItem.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-6">
                      {newsItem.excerpt || 'No excerpt available for this release.'}
                    </p>
                  </div>

                  {/* Operational Action Row */}
                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => mockRouterPush(`/${organizationSlug}/blog/${newsItem.id}`)} 
                      className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-slate-900 group/btn transition-colors hover:text-slate-700 w-fit"
                    >
                      <span>Read Full Story</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400 transition-transform duration-300 group-hover/btn:translate-x-1" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Section Navigation Footer */}
        <div className="flex justify-center md:justify-start">
          <button
            onClick={() => mockRouterPush(`/${organizationSlug}/blog`)}
            className="px-6 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-98"
          >
            Explore All Journal Entries
          </button>
        </div>

      </div>
    </section>
  );
}