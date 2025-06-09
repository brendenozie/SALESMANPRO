// File: components/site/layouts/BlogLayout/BlogSite.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreContext } from '../../../../../contexts/StoreContext';
import HeroSection from './components/HeroSection';
import LatestPodcastSection from './components/LatestPodcastSection';
import PopularBlogsSection from './components/PopularBlogsSection';
import StaffWritersSection from './components/StaffWritersSection';
import LatestNewsSection from './components/LatestNewsSection';
import CtaSection from './components/CtaSection';

// Dynamic loader for optimized images
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Dummy posts (replace with real API data)
const samplePosts = [
  {
    id: 'p1',
    title: '5 Ways to Boost Your Productivity',
    excerpt: 'Tactical tips backed by science to maximize focus.',
    image: '/posts/productivity.jpg',
  },
  {
    id: 'p2',
    title: 'Design Thinking in Action',
    excerpt: 'A deep dive into creative problem solving techniques.',
    image: '/posts/design.jpg',
  },
  {
    id: 'p3',
    title: 'Mastering Mindfulness',
    excerpt: 'Simple practices to calm your mind and increase awareness.',
    image: '/posts/mindfulness.jpg',
  },
  {
    id: 'p4',
    title: 'The Art of Storytelling',
    excerpt: 'Craft compelling narratives that resonate.',
    image: '/posts/storytelling.jpg',
  },
  {
    id: 'p5',
    title: 'Building Resilience',
    excerpt: 'Strategies to bounce back stronger.',
    image: '/posts/resilience.jpg',
  },
  {
    id: 'p6',
    title: 'Leadership Essentials',
    excerpt: 'Key attributes of impactful leaders.',
    image: '/posts/leadership.jpg',
  },
];

export default function BlogSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const { name, bannerUrl } = storeFormData;

  const [posts, setPosts] = useState(samplePosts);

  // If you fetch real posts, do so here and update `posts`
  useEffect(() => {
    setPosts(samplePosts);
  }, []);

  return (
    <main className="container mx-auto flex-1 px-6 py-8 space-y-16">

      <HeroSection />

      <LatestNewsSection />

      <StaffWritersSection />

      <PopularBlogsSection />

      <LatestPodcastSection />

      <CtaSection/>
      
      {/* Hero Section */}
      <BlogHero siteName={name} bannerUrl={bannerUrl} />

      {/* Main Content */}
      <BlogInsights posts={posts} loader={loader} />

      {/* Newsletter Section */}
      <section className="bg-indigo-600 py-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="container mx-auto text-center px-4 max-w-lg text-white"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Stay Informed</h3>
          <p className="mb-6">Subscribe for weekly tips, exclusive content, and more.</p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:shadow-2xl transition">
              Subscribe
            </button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}

interface BlogHeroProps {
  siteName: string;
  bannerUrl?: string;
}

const BlogHero: React.FC<BlogHeroProps> = ({ siteName, bannerUrl }) => {
  const router = useRouter();

  return (
    <section className="relative h-[90vh] overflow-hidden">
      {/* Background Image */}
      {bannerUrl && (
        <div className="absolute inset-0">
          <Image
            src={bannerUrl}
            alt="Hero"
            loader={loader}
            fill
            className="object-cover brightness-[0.6]"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"
        >
          {siteName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl"
        >
          Deep insights, actionable tips, and inspiration to elevate your journey.
        </motion.p>

        <motion.button
          onClick={() => router.push('/blog')}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-semibold rounded-full shadow-xl hover:bg-white/20 hover:shadow-2xl transition-all duration-300"
        >
          Explore Now
        </motion.button>
      </div>
    </section>
  );
};

interface BlogInsightsProps {
  posts: Array<{ id: string; title: string; excerpt: string; image: string }>;
  loader: (_: any) => string;
}

const BlogInsights: React.FC<BlogInsightsProps> = ({ posts, loader }) => {
  const router = useRouter();

  return (
    <>
      {/* Search & Category Filter */}
      <section className="bg-white py-10 shadow-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-6">
          <input
            type="search"
            placeholder="Search articles..."
            className="flex-1 px-6 py-3 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <select className="px-6 py-3 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
            <option>All Categories</option>
            <option>Productivity</option>
            <option>Design</option>
            <option>Mindfulness</option>
            <option>Leadership</option>
          </select>
        </div>
      </section>

      {/* Latest Insights Grid */}
      <section className="container mx-auto px-6 py-20">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-12"
        >
          Latest Insights
        </motion.h3>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <motion.article
              key={post.id}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 30px rgba(0,0,0,0.1)' }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer"
              onClick={() => router.push(`/blog/${post.id}`)}
            >
              <div className="relative h-64">
                <Image src={post.image} alt={post.title} fill className="object-cover" loader={loader} />
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2 text-gray-800">{post.title}</h4>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.id}`}
                  className="text-indigo-600 font-medium hover:underline transition-all"
                >
                  Read More →
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
};
