"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useStoreContext } from '@/contexts/StoreContext';
import { Blog, Event } from '@/types/typings'; // Assuming these types exist

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper functions for date formatting
const formatEventDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      year: date.toLocaleDateString('en-US', { year: 'numeric' }),
    };
  } catch (error) {
    return { month: 'N/A', day: 'N/A', year: 'N/A' };
  }
};

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

// Static fallback data
const fallbackEvents: Event[] = [
  {
    id: 'fb-event-1',
    title: 'Annual Charity Run',
    description: 'Join us for our annual charity run to support children\'s education programs.',
    eventDate: '2025-08-10T08:00:00Z',
    eventTime: '8:00 AM',
    imageUrl: 'https://images.unsplash.com/photo-1532629391091-c247900b1713?q=80&w=2670&auto=format&fit=crop',
    link: '#',
    order: 1,
  },
  {
    id: 'fb-event-2',
    title: 'Volunteer Appreciation Picnic',
    description: 'A day to celebrate and thank our incredible volunteers for their dedication.',
    eventDate: '2025-09-01T12:00:00Z',
    eventTime: '12:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b160292723?q=80&w=2670&auto=format&fit=crop',
    link: '#',
    order: 2,
  },
  {
    id: 'fb-event-3',
    title: 'Winter Coat Drive',
    description: 'Help us collect warm coats for children in need this winter season.',
    eventDate: '2025-10-20T09:00:00Z',
    eventTime: '9:00 AM - 4:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=2670&auto=format&fit=crop',
    link: '#',
    order: 3,
  },
];

const fallbackBlogs: Blog[] = [
  {
    id: 'fb-blog-1',
    title: 'Impact Report 2024: A Year of Change',
    excerpt: 'Discover the significant milestones and lives touched in our latest annual impact report.',
    imageUrl: 'https://images.unsplash.com/photo-1523050854805-9a84a9235777?q=80&w=2670&auto=format&fit=crop',
    publishedAt: '2024-07-25T09:00:00Z',
    link: '#',
    order: 1,
  },
  {
    id: 'fb-blog-2',
    title: 'Building Brighter Futures: Our School Projects',
    excerpt: 'An in-depth look at how our school construction projects are transforming communities.',
    imageUrl: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=2670&auto=format&fit=crop',
    publishedAt: '2024-07-10T11:00:00Z',
    link: '#',
    order: 2,
  },
  {
    id: 'fb-blog-3',
    title: 'The Power of a Single Donation',
    excerpt: 'Hear a compelling story about how one donation made a profound difference.',
    imageUrl: 'https://images.unsplash.com/photo-1526367790952-0925e3170e7a?q=80&w=2670&auto=format&fit=crop',
    publishedAt: '2024-07-01T15:00:00Z',
    link: '#',
    order: 3,
  },
];

export default function EventsUpdatesSection() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';
  const eventsToRender = Array.isArray(storeFormData?.events) && storeFormData.events.length > 0
    ? storeFormData.events.sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackEvents;
  const blogsToRender = Array.isArray(storeFormData?.blogs) && storeFormData.blogs.length > 0
    ? storeFormData.blogs.sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackBlogs;
  const organizationSlug = storeFormData?.slug || 'non-profit';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section id="events" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold mb-2" style={{ color: primaryColor }}>Get Involved & Stay Informed</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Upcoming Events & Latest News
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how you can participate in our mission and stay updated on the incredible stories of change we're creating together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16" ref={ref}>
          {/* Upcoming Events Section (Enhanced) */}
          <div className="flex flex-col">
            <h3 className="text-3xl font-bold mb-8 text-gray-900 border-l-4 pl-4" style={{ borderColor: primaryColor }}>
              Upcoming Events
            </h3>
            <motion.div variants={containerVariants} initial="hidden" animate={inView ? "show" : "hidden"}>
              {eventsToRender.slice(0, 3).map((evt, idx) => {
                const formattedDate = formatEventDate(evt.eventDate);
                return (
                  <motion.div
                    key={evt.id}
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-start mb-6 bg-gray-100 rounded-2xl shadow-md hover:shadow-lg p-6 transition-shadow duration-300 cursor-pointer group"
                    onClick={() => mockRouterPush(evt.link)}
                  >
                    <div className="flex-shrink-0 text-white p-4 rounded-xl mr-5 mb-4 sm:mb-0 text-center font-bold" style={{ backgroundColor: primaryColor }}>
                      <div className="text-xl">{formattedDate.month}</div>
                      <div className="text-3xl font-extrabold">{formattedDate.day}</div>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors" style={{ '--tw-hover-text-color': primaryColor }}>
                        {evt.title}
                      </h4>
                      <p className="text-gray-700 text-base leading-relaxed line-clamp-2">{evt.description}</p>
                      <Link href={evt.link} className="mt-3 inline-flex items-center font-semibold text-blue-600 hover:underline transition-colors group-hover:text-blue-800" style={{ color: primaryColor }}>
                        Learn More <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
            <div className="mt-8 text-center sm:text-left">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link href={`/${organizationSlug}/events`} className="px-8 py-3 rounded-full font-semibold text-white shadow-lg transition duration-300" style={{ backgroundColor: primaryColor }}>
                  View All Events
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Latest News & Blog Section (Enhanced) */}
          <div className="flex flex-col">
            <h3 className="text-3xl font-bold mb-8 text-gray-900 border-l-4 pl-4" style={{ borderColor: primaryColor }}>
              Latest News & Stories
            </h3>
            <motion.div variants={containerVariants} initial="hidden" animate={inView ? "show" : "hidden"}>
              {blogsToRender.slice(0, 3).map((newsItem, idx) => (
                <motion.div
                  key={newsItem.id}
                  variants={itemVariants}
                  className="flex items-center mb-6 bg-gray-100 rounded-2xl shadow-md hover:shadow-lg p-5 transition-shadow duration-300 cursor-pointer group"
                  onClick={() => mockRouterPush(newsItem.link)}
                >
                  <div className="flex-shrink-0 w-32 h-32 mr-5 rounded-xl overflow-hidden relative">
                    <Image
                      src={newsItem.imageUrl || newsItem.coverImage || "https://placehold.co/128x128/D1D5DB/4B5563?text=News+Image"}
                      alt={newsItem.title ||  'NEWS IMAGE'}
                      loader={loader}
                      fill
                      sizes="128px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">{formatBlogDate(newsItem.publishedAt)}</span>
                    <h4 className="font-bold text-xl my-1 text-gray-900 group-hover:text-blue-600 transition-colors" style={{ '--tw-hover-text-color': primaryColor }}>
                      {newsItem.title}
                    </h4>
                    <p className="text-gray-700 text-base leading-relaxed line-clamp-2">{newsItem.excerpt || 'No excerpt available.'}</p>
                    <Link href={newsItem.link} className="mt-3 inline-flex items-center font-semibold text-blue-600 hover:underline transition-colors group-hover:text-blue-800" style={{ color: primaryColor }}>
                      Read More <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-8 text-center sm:text-left">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link href={`/${organizationSlug}/blog`} className="px-8 py-3 rounded-full font-semibold text-white shadow-lg transition duration-300" style={{ backgroundColor: primaryColor }}>
                  View All News
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}