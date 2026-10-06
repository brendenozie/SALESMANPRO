'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'; // Using Hero Icons

const blogPosts = [
  {
    date: 'Jul 20, 2026',
    category: 'Style / Vision',
    title: 'Frames That Suit You',
    excerpt: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    link: '/blog/frames-that-suit-you',
  },
  {
    date: 'Jul 22, 2026',
    category: 'Style / Vision',
    title: "Trendy Men's Eyeglasses",
    excerpt: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    imageUrl: 'https://images.unsplash.com/photo-1511499767350-a159402e5bf1?auto=format&fit=crop&w=800&q=80',
    link: '/blog/trendy-mens-eyeglasses',
  },
  {
    date: 'Jul 25, 2026',
    category: 'Style / Vision',
    title: 'Style Your Own Glasses',
    excerpt: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80',
    link: '/blog/style-your-own',
  },
];

export default function LatestUpdates() {
  const darkBg = '#004743'; // Matching the teal from the eyewear design reference

  return (
    <section className="py-24" style={{ backgroundColor: darkBg }}>
      <div className="container mx-auto px-4 md:px-12 lg:px-20">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tight">
            Latest Updates
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            Stay informed with our latest collections, vision tips, and style guides tailored for your lifestyle.
          </p>
        </div>

        {/* Three-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-6">
                <Image decoding="async"
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110" // Use default loader for local images
                />
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                <span>{post.date}</span>
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span>{post.category}</span>
              </div>

              {/* Content */}
              <h3 className="text-white text-2xl font-black mb-4 group-hover:text-amber-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                {post.excerpt}
              </p>

              {/* Read More Button */}
              <Link
                href={post.link}
                className="inline-flex items-center gap-2 self-start px-6 py-2 border border-gray-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Read More
                <ArrowLongRightIcon className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}