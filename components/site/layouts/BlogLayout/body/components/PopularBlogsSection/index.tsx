"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarIcon } from "@heroicons/react/24/solid";
import { useStoreContext } from '@/contexts/StoreContext';

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data
const fallbackBlogs = [
  { title: 'How to build a scalable design system from scratch', readTime: '2 min read', date: 'April 20, 2023', img: '/images/blog1.jpg', link: '#' },
  { title: 'The art of balancing creativity and user experience in design', readTime: '2 min read', date: 'April 19, 2023', img: '/images/blog2.jpg', link: '#' },
  { title: 'The science behind effective call-to-action buttons', readTime: '2 min read', date: 'April 18, 2023', img: '/images/blog3.jpg', link: '#' },
  { title: '10 must-have features for a modern portfolio website', readTime: '2 min read', date: 'April 17, 2023', img: '/images/blog4.jpg', link: '#' },
  { title: 'How to create a seamless user journey on your website', readTime: '2 min read', date: 'April 16, 2023', img: '/images/blog5.jpg', link: '#' },
  { title: 'Why mobile-first design is no longer optional', readTime: '2 min read', date: 'April 15, 2023', img: '/images/blog6.jpg', link: '#' },
];

export default function PopularBlogsSection() {
  const { storeFormData } = useStoreContext() || {};
  const { Blog: dynamicBlogs, themeSettings: { primaryColor = 'blue' } = {} } = storeFormData || {};

  // Map dynamic blog posts to our blog item shape
  const blogItems = Array.isArray(dynamicBlogs) && dynamicBlogs.length > 0
    ? dynamicBlogs
        .sort((a, b) => (b.views || 0) - (a.views || 0)) // sort by views descending
        .slice(0, 6)
        .map(post => ({
          title: post.title,
          date: post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'Unknown date',
          readTime: post.content ? `${Math.ceil(post.content.length / 200)} min read` : '',
          img: post.coverImage || '/images/placeholder-blog.jpg',
          link: `/blogs/${post.slug}`,
        }))
    : fallbackBlogs;

  return (
    <section className="container mx-auto px-6 py-12">
      {/* Popular Blogs */}
      <h2 className="text-2xl font-semibold mb-6">Popular Blogs</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogItems.map((blog, idx) => (
          <motion.article
            key={idx}
            className="bg-white rounded-2xl overflow-hidden shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Image
              loader={loader}
              src={blog.img}
              alt={blog.title}
              width={400}
              height={240}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
              <div className="flex justify-between items-center text-gray-500 text-sm">
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" style={{ color: primaryColor }} /> {blog.date}
                </span>
                <span>{blog.readTime}</span>
              </div>
              {blog.link && (
                <a
                  href={blog.link}
                  className="inline-block mt-4 text-sm font-medium"
                  style={{ color: primaryColor }}
                >
                  Read more →
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
