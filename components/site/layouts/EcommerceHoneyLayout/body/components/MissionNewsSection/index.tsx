'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRightIcon,
  GlobeAltIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { IBlog } from '@/types/typings';

const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// ----------------------------------------------
// Helpers
// ----------------------------------------------
const hexToRgba = (hex: string, opacity = 1) => {
  const sanitized = hex.replace('#', '');

  const bigint = parseInt(
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((x) => x + x)
          .join('')
      : sanitized,
    16
  );

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// ----------------------------------------------
// Fallback Blogs
// ----------------------------------------------
const fallbackNews: Partial<IBlog>[] = [
  {
    id: '1',
    title: 'Building Stronger Communities Through Shared Purpose',
    createdAt: new Date(),
    slug: 'building-stronger-communities',
    excerpt:
      'Discover how purpose-driven communities create lasting transformation and inspire collective growth.',
    coverImage:
      'https://placehold.co/600x400/F59E0B/FFFFFF?text=Community',
    categories: ['Community'],
    author: {
      name: 'Guest Author',
      profileImage: '',
    } as any,
  },
  {
    id: '2',
    title: 'Why Human Flourishing Matters More Than Ever',
    createdAt: new Date(),
    slug: 'human-flourishing-matters',
    excerpt:
      'Human flourishing goes beyond success — it creates healthier families, stronger societies, and meaningful lives.',
    coverImage:
      'https://placehold.co/600x400/FB923C/FFFFFF?text=Flourishing',
    categories: ['Growth'],
    author: {
      name: 'Editorial Team',
      profileImage: '',
    } as any,
  },
  {
    id: '3',
    title: 'Creating Impact Through Compassionate Leadership',
    createdAt: new Date(),
    slug: 'compassionate-leadership',
    excerpt:
      'Leadership rooted in empathy and vision creates transformational impact across organizations and communities.',
    coverImage:
      'https://placehold.co/600x400/F97316/FFFFFF?text=Leadership',
    categories: ['Leadership'],
    author: {
      name: 'Community Writer',
      profileImage: '',
    } as any,
  },
];

export default function MissionNewsSection({ storeFormData } : {storeFormData: any}) {

  // ----------------------------------------------
  // Extract Store Data
  // ----------------------------------------------
  const {
    name = 'FlourisHub',
    description,
    missionStatement,
    founderName,
    founderQuote,
    blogs = [],
    heroSlides = [],
    bannerUrl,
    themeSettings = {},
  }: any = storeFormData || {};

  // ----------------------------------------------
  // Theme
  // ----------------------------------------------
  const primaryColor = themeSettings?.primaryColor || '#c2a472';
  const secondaryColor = themeSettings?.secondaryColor || '#f59e0b';

  // ----------------------------------------------
  // Hero / Mission Image
  // ----------------------------------------------
  const missionImage = useMemo(() => {
    return (
      heroSlides?.[0]?.productImageUrl ||
      heroSlides?.[0]?.imageUrl ||
      bannerUrl ||
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80'
    );
  }, [heroSlides, bannerUrl]);

  // ----------------------------------------------
  // Process News
  // ----------------------------------------------
  const newsItems = useMemo(() => {
    if (Array.isArray(blogs) && blogs.length > 0) {
      return blogs.slice(0, 3);
    }

    return fallbackNews;
  }, [blogs]);

  // ----------------------------------------------
  // Date Formatter
  // ----------------------------------------------
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'RECENT ARTICLE';

    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="bg-[#fdf8f1] py-20 lg:py-32 relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{
          background: `radial-gradient(circle, ${primaryColor}, transparent 70%)`,
        }}
      />

      {/* Decorative Floating Element */}
      <div className="absolute top-10 left-10 opacity-50">
        <div
          className="w-12 h-12 rounded-full border"
          style={{
            borderColor: hexToRgba(primaryColor, 0.4),
            backgroundColor: hexToRgba(primaryColor, 0.08),
          }}
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* ========================================= */}
          {/* MISSION CONTENT */}
          {/* ========================================= */}
          <div className="lg:col-span-2 space-y-10">
            {/* Mission Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[16/9] w-full overflow-hidden shadow-2xl rounded-2xl"
            >
              <Image
                src={missionImage}
                alt={`${name} mission`}
                fill
                className="object-cover"
                loader={loader}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />

              {/* Floating Badge */}
              <div
                className="absolute top-6 left-6 px-4 py-2 rounded-full backdrop-blur-md border text-white text-xs uppercase tracking-[0.2em] font-bold flex items-center gap-2"
                style={{
                  backgroundColor: hexToRgba(primaryColor, 0.18),
                  borderColor: hexToRgba(primaryColor, 0.3),
                }}
              >
                <GlobeAltIcon className="w-4 h-4" />
                Our Mission
              </div>
            </motion.div>

            {/* Mission Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl space-y-6"
            >
              <div className="space-y-3">
                <span
                  className="uppercase tracking-[0.3em] text-xs font-black"
                  style={{ color: primaryColor }}
                >
                  Purpose Driven Impact
                </span>

                <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-black leading-tight">
                  Our Mission
                </h2>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                {missionStatement ||
                  description ||
                  `${name} exists to empower individuals, communities, and organizations through meaningful transformation, human flourishing, and purpose-driven growth.`}
              </p>

              <p className="text-gray-600 leading-relaxed italic">
                {founderQuote ||
                  `“We believe real transformation happens when people are supported, inspired, and connected through authentic community and shared purpose.”`}
              </p>

              {/* Founder */}
              <div className="pt-4 flex items-center gap-3">
                <div
                  className="p-3 rounded-full"
                  style={{
                    backgroundColor: hexToRgba(primaryColor, 0.12),
                  }}
                >
                  <HeartIcon
                    className="w-5 h-5"
                    style={{ color: primaryColor }}
                  />
                </div>

                <div>
                  <p
                    className="text-2xl font-light italic"
                    style={{ color: primaryColor }}
                  >
                    {founderName || 'Founder'}
                  </p>

                  <p className="text-sm text-gray-500 uppercase tracking-wider">
                    Founder of {name}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ========================================= */}
          {/* NEWS SECTION */}
          {/* ========================================= */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 shadow-sm border border-orange-50/50 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <span
                  className="uppercase text-xs tracking-[0.3em] font-black"
                  style={{ color: primaryColor }}
                >
                  Latest Updates
                </span>

                <h3 className="text-2xl font-bold tracking-tight uppercase mt-2 text-black">
                  News & Insights
                </h3>
              </div>
            </div>

            <div className="space-y-10">
              {newsItems.map((item: any, index: number) => {
                const articleUrl = item.slug
                  ? `/blogs/${item.slug}`
                  : '#';

                return (
                  <Link
                    href={articleUrl}
                    key={index}
                    className="block group"
                  >
                    <article className="space-y-3">
                      {/* Date */}
                      <span
                        className="text-xs font-black tracking-[0.25em] uppercase"
                        style={{ color: primaryColor }}
                      >
                        {formatDate(
                          item.createdAt || item.publishedAt
                        )}
                      </span>

                      {/* Title */}
                      <h4
                        className="text-sm md:text-base font-black leading-snug uppercase transition-colors duration-300"
                        style={{
                          color: '#111827',
                        }}
                      >
                        <span className="group-hover:text-opacity-80">
                          {item.title}
                        </span>
                      </h4>

                      {/* Excerpt */}
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                        {item.excerpt ||
                          item.description ||
                          'Read more insights and updates from our latest stories and community initiatives.'}
                      </p>

                      {/* Hover line */}
                      <div
                        className="h-[2px] w-0 group-hover:w-20 transition-all duration-500"
                        style={{
                          backgroundColor: primaryColor,
                        }}
                      />
                    </article>
                  </Link>
                );
              })}
            </div>

            {/* CTA */}
            <Link
              href="/blogs"
              className="inline-flex items-center mt-12 text-[10px] font-black uppercase tracking-[0.3em] transition-colors group"
              style={{ color: '#111827' }}
            >
              Show More News

              <ChevronRightIcon
                className="h-3 w-3 ml-2 transition-transform group-hover:translate-x-1"
                style={{ color: primaryColor }}
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}