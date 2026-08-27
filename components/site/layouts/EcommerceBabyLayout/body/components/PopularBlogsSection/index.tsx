"use client";

import React from "react";
import Image from "next/image";
import {
  CheckIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const popularBlogs = [
  { title: 'How to build a scalable design system from scratch', readTime: '2 min read', date: 'April 20, 2023', img: '/images/blog1.jpg' },
  { title: 'The art of balancing creativity and user experience in design', readTime: '2 min read', date: 'April 19, 2023', img: '/images/blog2.jpg' },
  { title: 'The science behind effective call-to-action buttons', readTime: '2 min read', date: 'April 18, 2023', img: '/images/blog3.jpg' },
  { title: '10 must-have features for a modern portfolio website', readTime: '2 min read', date: 'April 17, 2023', img: '/images/blog4.jpg' },
  { title: 'How to create a seamless user journey on your website', readTime: '2 min read', date: 'April 16, 2023', img: '/images/blog5.jpg' },
  { title: 'Why mobile-first design is no longer optional', readTime: '2 min read', date: 'April 15, 2023', img: '/images/blog6.jpg' },
];

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function PopularBlogsSection() {
  return (
    <section>
      {/* Popular Blogs */}
      <h2 className="text-2xl font-semibold mb-6">Popular Blogs</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularBlogs.map((blog, idx) => (
          <motion.article
            key={idx}
            className="bg-white rounded-2xl overflow-hidden shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <img src={blog.img} alt={blog.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
              <div className="flex justify-between items-center text-gray-500 text-sm">
                <span className="flex items-center"><CalendarIcon className="h-4 w-4 mr-1" /> {blog.date}</span>
                <span>{blog.readTime}</span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
