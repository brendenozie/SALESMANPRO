"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarIcon } from "@heroicons/react/24/solid";
import { useStoreContext } from '@/contexts/StoreContext';

// Local loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data
const fallbackNews = [
  { title: 'Global leaders unite to address climate crisis at COP26', date: 'April 21, 2023', img: '/images/cop26.jpg', link: '#' },
  { title: 'Cybersecurity experts warn of increased threats', date: 'April 20, 2023', img: '/images/cyber.jpg', link: '#' },
  { title: 'Athlete achieves historic win at world championships', date: 'April 19, 2023', img: '/images/athlete.jpg', link: '#' },
  { title: 'Chemical currents breaking news in chemistry and materials science', date: 'April 18, 2023', img: '/images/chemistry.jpg', link: '#' },
];

export default function LatestNewsSection() {
  const { storeFormData } = useStoreContext() || {};
  const { Blog: dynamicNews, themeSettings: { primaryColor = 'blue' } = {} } = storeFormData || {};

  // Map dynamic blog posts to our news item shape
  const newsItems = Array.isArray(dynamicNews) && dynamicNews.length > 0
    ? dynamicNews.slice(0, 6).map(post => ({
        title: post.title,
        date: post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'Unknown date',
        img: post.coverImage || '/images/placeholder-news.jpg',
        link: `/blogs/${post.slug}`,
      }))
    : fallbackNews;

  return (
    <section className="container mx-auto px-6 py-12">
      {/* Latest News */}
      <h2 className="text-2xl font-semibold mb-6">Latest News</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((item, idx) => (
          <motion.article
            key={idx}
            className="bg-white rounded-2xl overflow-hidden shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Image
              loader={loader}
              src={item.img}
              alt={item.title}
              width={400}
              height={240}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm flex items-center">
                <CalendarIcon className="h-5 w-5 mr-1" style={{ color: primaryColor }} /> {item.date}
              </p>
              {item.link && (
                <a
                  href={item.link}
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
