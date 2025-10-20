// components/NewsSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/solid'; // Changed to solid for consistency
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

const fallbackBlogs= [
  {
    id: 'fb-blog-1',
    title: 'New Study on Heart Health: What You Need to Know',
    excerpt: 'An in-depth look at recent research findings on cardiovascular wellness and practical tips to protect your heart.',
    coverImage: 'https://images.unsplash.com/photo-1603512193164-9844f77c8e6b?q=80&w=2670&auto=format&fit=crop',
    slug: 'new-study-heart-health',
    publishedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'fb-blog-2',
    title: 'Navigating Your Prescriptions: A Quick Guide',
    excerpt: 'Simple steps to help you understand your medications, dosage, and when to consult your doctor for refills.',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop',
    slug: 'navigating-your-prescriptions',
    publishedAt: '2025-08-25T10:00:00Z',
  },
  {
    id: 'fb-blog-3',
    title: 'The Importance of Mental Health Check-ups',
    excerpt: 'Learn why regular mental health check-ins are just as vital as physical exams for your overall well-being.',
    coverImage: 'https://images.unsplash.com/photo-1516574163900-e791b8f041de?q=80&w=2670&auto=format&fit=crop',
    slug: 'mental-health-checkups',
    publishedAt: '2025-08-18T10:00:00Z',
  },
].map(blog => ({
  ...blog,
  // Add other required IBlog fields with mock/null data to match the type
  companyId: '', slug: blog.slug, content: '', isFeature: false, categories: [], tags: [], authorName: null, status: 'PUBLISHED', views: 0, likes: 0, description: null, contentUrl: null, thumbnailUrl: null, contentType: 'TEXT', category: null, duration: null, location: null, published: true, type: null, publishDate: new Date(blog.publishedAt!), authorId: null, photoAlbumId: null, videoAlbumId: null, createdAt: new Date(), updatedAt: new Date()
}));


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

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#008080';
  const blogsToRender = storeFormData?.blogs && Array.isArray(storeFormData?.blogs) && storeFormData.blogs.length > 0
    ? storeFormData.blogs.slice(0, 3)
    : fallbackBlogs;
  const organizationSlug = storeFormData?.slug || 'unbite-healthcare';

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
          <p className="text-sm uppercase tracking-widest font-semibold mb-2" style={{ color: primaryColor }}>Latest Insights</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Health News & Articles
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with our latest articles on health, wellness, and medical breakthroughs.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogsToRender.map((newsItem) => (
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
                <span className="text-sm font-medium text-gray-500">{formatBlogDate(newsItem.publishedAt! as unknown as string)}</span>
                <Link href={`/${organizationSlug}/blog/${newsItem.slug}`} className="block">
                  <h3 className="font-bold text-xl md:text-2xl my-2 text-gray-900 leading-snug group-hover:text-blue-600 transition-colors"
                    // style={{ '--tw-hover-text-color': primaryColor }}
                  >
                    {newsItem.title}
                  </h3>
                </Link>
                <p className="text-gray-700 text-sm md:text-base line-clamp-3 mb-4">{newsItem.excerpt || 'No excerpt available.'}</p>
                <Link href={`/${organizationSlug}/blog/${newsItem.slug}`} className="inline-flex items-center font-semibold transition-colors duration-300" style={{ color: primaryColor }}>
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