// components/NewsSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useStoreContext } from '@/contexts/StoreContext';
import { IBlog } from '@/types/typings';

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper function for date formatting
const formatBlogDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    return "Date N/A";
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
    coverImage: 'https://images.unsplash.com/photo-1523050854805-9a84a9235777?q=80&w=2670&auto=format&fit=crop',
    companyId: '',
    slug: '',
    content: '',
    isFeature: false,
    categories: [],
    tags: [],
    authorName: null,
    status: 'DRAFT',
    publishedAt: null,
    views: 0,
    likes: 0,
    description: null,
    contentUrl: null,
    thumbnailUrl: null,
    contentType: 'VIDEO',
    category: null,
    duration: null,
    location: null,
    published: false,
    type: null,
    publishDate: null,
    authorId: null,
    photoAlbumId: null,
    videoAlbumId: null,
    createdAt: null,
    updatedAt: null
  },
  {
    id: 'fb-blog-2',
    title: 'Building Brighter Futures: Our School Projects',
    excerpt: 'An in-depth look at how our school construction projects are transforming communities and providing better learning environments for children.',
    coverImage: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=2670&auto=format&fit=crop',
    companyId: '',
    slug: '',
    content: '',
    isFeature: false,
    categories: [],
    tags: [],
    authorName: null,
    status: 'DRAFT',
    publishedAt: null,
    views: 0,
    likes: 0,
    description: null,
    contentUrl: null,
    thumbnailUrl: null,
    contentType: 'VIDEO',
    category: null,
    duration: null,
    location: null,
    published: false,
    type: null,
    publishDate: null,
    authorId: null,
    photoAlbumId: null,
    videoAlbumId: null,
    createdAt: null,
    updatedAt: null
  },
  {
    id: 'fb-blog-3',
    title: 'The Power of a Single Donation',
    excerpt: 'Hear a compelling story about how one donation made a profound difference in the life of a family, illustrating the impact of every contribution.',
    coverImage: 'https://images.unsplash.com/photo-1526367790952-0925e3170e7a?q=80&w=2670&auto=format&fit=crop',
    companyId: '',
    slug: '',
    content: '',
    isFeature: false,
    categories: [],
    tags: [],
    authorName: null,
    status: 'DRAFT',
    publishedAt: null,
    views: 0,
    likes: 0,
    description: null,
    contentUrl: null,
    thumbnailUrl: null,
    contentType: 'VIDEO',
    category: null,
    duration: null,
    location: null,
    published: false,
    type: null,
    publishDate: null,
    authorId: null,
    photoAlbumId: null,
    videoAlbumId: null,
    createdAt: null,
    updatedAt: null
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function NewsSection() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';
  const blogsToRender = Array.isArray(storeFormData?.blogs) && storeFormData.blogs.length > 0
    ? storeFormData.blogs//.sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackBlogs;
  const organizationSlug = storeFormData?.slug || 'non-profit';

  return (
    <section id="news" className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest font-semibold mb-2" style={{ color: primaryColor }}>Stay Informed</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Latest News & Stories
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Read our latest blog posts and stories to see the impact you're helping us create.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogsToRender.slice(0, 3).map((newsItem) => (
            <motion.div
              key={newsItem.id}
              variants={itemVariants}
              className="bg-gray-100 rounded-3xl overflow-hidden shadow-xl group transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={newsItem.coverImage || "https://placehold.co/128x128/D1D5DB/4B5563?text=News+Image"}
                  alt={newsItem.title || 'NEWS IMAGE'}
                  loader={loader}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6 md:p-8">
                <span className="text-sm font-medium text-gray-500">{ 'newsItem.publishDate' }</span>
                <h3 className="font-bold text-xl md:text-2xl my-2 text-gray-900 leading-snug group-hover:text-blue-600 transition-colors" 
                // style={{ '--tw-hover-text-color': primaryColor }}
                >
                  {newsItem.title}
                </h3>
                <p className="text-gray-700 text-sm md:text-base line-clamp-3 mb-4">{newsItem.excerpt || 'No excerpt available.'}</p>
                <Link href={'newsItem.link'} onClick={(e) => { e.preventDefault(); mockRouterPush('newsItem.link'); }} className="inline-flex items-center font-semibold transition-colors duration-300" style={{ color: primaryColor }}>
                  Read More
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 text-center">
          <Link href={`/${organizationSlug}/blog`} className="inline-flex items-center px-8 py-3 rounded-full font-semibold text-white shadow-lg transition duration-300 transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
            View All News
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}