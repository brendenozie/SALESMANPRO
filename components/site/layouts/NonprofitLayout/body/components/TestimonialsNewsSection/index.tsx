"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
// import { useStoreContext } from '@/contexts/StoreContext';
// import { Blog } from '@/types/typings';

// Placeholder for useStoreContext
const useStoreContext = () => ({
  storeFormData: {
    name: 'Children\'s Hope Foundation',
    slug: 'childrens-hope-foundation',
    testimonials: [
      {
        id: 'test-1',
        author: 'Alex Johnson',
        quote: 'This organization truly changed the lives of many in my community. Their dedication is inspiring and their impact is undeniable!',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a86e927f643?q=80&w=2670&auto=format&fit=crop',
        order: 1,
      },
      {
        id: 'test-2',
        author: 'Emily Carter',
        quote: 'The support provided by this non-profit has been invaluable to countless families in desperate need. Their programs are well-managed and transparent. Highly recommended.',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2670&auto=format&fit=crop',
        order: 2,
      },
      {
        id: 'test-3',
        author: 'David Lee',
        quote: 'I\'ve seen firsthand the positive change they bring. Every donation makes a real difference in the lives of children. Proud to be a supporter!',
        avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2670&auto=format&fit=crop',
        order: 3,
      },
    ],
    blogs: [
      {
        id: 'blog-1',
        title: 'New Education Program Launched in Rural Areas',
        excerpt: 'Our latest initiative aims to provide quality education to underserved communities, focusing on digital literacy and STEM skills.',
        imageUrl: 'https://images.unsplash.com/photo-1523050854805-9a84a9235777?q=80&w=2670&auto=format&fit=crop',
        publishedAt: '2024-07-20T10:00:00Z',
        link: '#blog-post-1',
        order: 1,
      },
      {
        id: 'blog-2',
        title: 'Success Story: How Clean Water Transformed a Village',
        excerpt: 'Read about the incredible impact of our recent clean water project on the health and livelihood of a remote village.',
        imageUrl: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=2670&auto=format&fit=crop',
        publishedAt: '2024-07-15T14:30:00Z',
        link: '#blog-post-2',
        order: 2,
      },
      {
        id: 'blog-3',
        title: 'Volunteers Spotlight: Meet Our Heroes',
        excerpt: 'We shine a light on the incredible individuals dedicating their time and effort to our cause.',
        imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b160292723?q=80&w=2670&auto=format&fit=crop',
        publishedAt: '2024-07-10T11:00:00Z',
        link: '#blog-post-3',
        order: 3,
      },
    ],
    themeSettings: {
      primaryColor: "#FF5722",
      secondaryColor: "#FFFFFF",
    },
  },
});

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const formatDate = (isoString: string) => {
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

export default function TestimonialsNewsSection() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#FFFFFF';

  const testimonialsToRender = Array.isArray(storeFormData?.testimonials) && storeFormData.testimonials.length > 0
    ? storeFormData.testimonials.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [
      { id: 'fb-test-1', author: 'Alex Johnson', quote: 'This organization truly changed the lives of many in my community. Their dedication is inspiring!', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a86e927f643?q=80&w=2670&auto=format&fit=crop', order: 1 },
      { id: 'fb-test-2', author: 'Emily Carter', quote: 'The support provided by this non-profit has been invaluable to countless families in desperate need. Highly recommended.', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2670&auto=format&fit=crop', order: 2 },
      { id: 'fb-test-3', author: 'David Lee', quote: 'I\'ve seen firsthand the positive change they bring. Every donation makes a real difference in the lives of children. Proud to be a supporter!', avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2670&auto=format&fit=crop', order: 3 },
    ];

  const blogsToRender = Array.isArray(storeFormData?.blogs) && storeFormData.blogs.length > 0
    ? storeFormData.blogs.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [
      { id: 'fb-blog-1', title: 'Our Latest Community Outreach', excerpt: 'Details about our recent efforts to support local families.', imageUrl: 'https://images.unsplash.com/photo-1523050854805-9a84a9235777?q=80&w=2670&auto=format&fit=crop', publishedAt: '2024-07-22T09:00:00Z', link: '#', order: 1 },
      { id: 'fb-blog-2', title: 'Volunteer Spotlight: Making a Difference', excerpt: 'Highlighting the incredible work of our dedicated volunteers.', imageUrl: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=2670&auto=format&fit=crop', publishedAt: '2024-07-18T11:00:00Z', link: '#', order: 2 },
      { id: 'fb-blog-3', title: 'The Power of a Single Donation', excerpt: 'Hear a compelling story about how one donation made a profound difference.', imageUrl: 'https://images.unsplash.com/photo-1526367790952-0925e3170e7a?q=80&w=2670&auto=format&fit=crop', publishedAt: '2024-07-01T15:00:00Z', link: '#', order: 3 },
    ];

  const organizationSlug = storeFormData?.slug || 'non-profit';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/60x60/CCCCCC/333333?text=Avatar";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section id="testimonials-news" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        {/* Unified Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold mb-2" style={{ color: primaryColor }}>
            Stories of Impact
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            What Our Community Says & Latest News
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our mission is powered by the voices of those we serve and the stories we create.
          </p>
        </motion.div>

        {/* Main Grid: Testimonials & News */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-8">
          {/* Testimonials Section */}
          <div className="flex flex-col">
            <motion.h3
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
              className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 border-l-4 pl-4"
              style={{ borderColor: primaryColor }}
            >
              Voices Sharing Our Mission Success
            </motion.h3>
            <motion.div variants={containerVariants} initial="hidden" animate={inView ? "show" : "hidden"}>
              {testimonialsToRender.slice(0, 2).map((test) => (
                <motion.div
                  key={test.id}
                  variants={itemVariants}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative mb-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <blockquote className="italic text-gray-800 text-lg leading-relaxed pl-10 relative">
                    <span className="absolute top-0 left-0 text-5xl font-serif text-gray-300 transform -translate-y-2">“</span>
                    {test.quote}
                  </blockquote>
                  <div className="flex items-center space-x-4 mt-6">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden">
                      <Image
                        src={test.avatarUrl || `https://placehold.co/56x56/A0A0A0/FFFFFF?text=${test.author?.split(' ').map(n => n[0]).join('')}`}
                        alt={test.author}
                        fill
                        sizes="56px"
                        className="object-cover"
                        loader={loader}
                        onError={handleImageError}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{test.author}</h4>
                      <p className="text-sm text-gray-500">Community Supporter</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Latest News / Blog Posts Section */}
          <div className="flex flex-col">
            <motion.h3
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
              className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 border-l-4 pl-4"
              style={{ borderColor: primaryColor }}
            >
              Latest News & Updates
            </motion.h3>
            <motion.div variants={containerVariants} initial="hidden" animate={inView ? "show" : "hidden"}>
              {blogsToRender.slice(0, 2).map((blog) => (
                <motion.div
                  key={blog.id}
                  variants={itemVariants}
                  className="flex flex-col md:flex-row items-start mb-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-transform duration-300 cursor-pointer group"
                  onClick={() => mockRouterPush(blog.link)}
                >
                  <div className="relative w-full md:w-1/3 h-40 md:h-auto rounded-t-2xl md:rounded-l-2xl md:rounded-t-none overflow-hidden">
                    <Image
                      src={blog.imageUrl || "https://placehold.co/400x250/D1D5DB/4B5563?text=News+Image"}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      loader={loader}
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-500">{formatDate(blog.publishedAt)}</span>
                      <h4 className="text-xl font-semibold text-gray-900 mt-1 mb-2 leading-tight group-hover:text-blue-600 transition-colors" style={{ '--tw-hover-text-color': primaryColor }}>
                        {blog.title}
                      </h4>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {blog.excerpt || 'No excerpt available.'}
                      </p>
                    </div>
                    <Link
                      href={blog.link}
                      className="inline-flex items-center font-semibold text-blue-600 hover:underline transition-colors"
                      style={{ color: primaryColor }}
                    >
                      Read More <ArrowRightIcon className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-8 text-center md:text-left">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link
                  href={`/${organizationSlug}/blog`}
                  className="px-8 py-3 rounded-full font-semibold text-white shadow-lg transition duration-300"
                  style={{ backgroundColor: primaryColor }}
                >
                  View All News
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Dynamic CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="p-10 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between mt-16 text-center md:text-left"
          style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColor}E0)`, color: secondaryColor }}
        >
          <h3 className="text-3xl font-bold mb-6 md:mb-0 max-w-2xl leading-tight">
            Your Donation Is A Gift To Them. Donate Today!
          </h3>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link
              href={`/${organizationSlug}/donate`}
              className="inline-flex items-center px-8 py-3 rounded-full font-semibold hover:shadow-lg transition duration-300"
              style={{ backgroundColor: secondaryColor, color: primaryColor }}
            >
              Donate Now <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}