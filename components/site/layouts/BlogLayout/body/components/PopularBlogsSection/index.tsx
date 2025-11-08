import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { IBlog } from '@/types/typings';

// Mock data for blog posts to make the component runnable
const relatedBlogs = [
  {
    id: 'related1',
    title: 'How to build a sustainable home',
    category: 'Lifestyle',
    authorName: 'Sarah Johnson',
    img: 'https://placehold.co/600x400/1E40AF/FFFFFF?text=Sustainable+Home',
  },
  {
    id: 'related2',
    title: 'The future of artificial intelligence in design',
    category: 'Technology',
    authorName: 'David Chen',
    img: 'https://placehold.co/600x400/6D28D9/FFFFFF?text=AI+in+Design',
  },
  {
    id: 'related3',
    title: 'Exploring the hidden gems of the Amazon rainforest',
    category: 'Travel',
    authorName: 'Maria Garcia',
    img: 'https://placehold.co/600x400/059669/FFFFFF?text=Amazon+Rainforest',
  },
  {
    id: 'related4',
    title: 'Mastering the art of digital photography',
    category: 'Photography',
    authorName: 'Emily White',
    img: 'https://placehold.co/600x400/94A3B8/FFFFFF?text=Digital+Photography',
  },
];

interface PopularBlogsSectionProps { 
  blogs: IBlog[]; 
  themeSettings: Record<string, any> | null;
 }

const PopularBlogsSection = ({ blogs : dynamicNews, themeSettings }: PopularBlogsSectionProps) => {

  // Destructure storeFormData from context, providing a fallback
  // const { storeFormData } = useStoreContext() || {};
  // const { blogs: dynamicNews, themeSettings } = storeFormData || {};

  // Map dynamic blog posts to our news item shape, or use fallback data
  const newsItems = Array.isArray(dynamicNews) && dynamicNews.length > 0
    ? dynamicNews.slice(0, 6).map(post => ({
        title: post.title,
        date: post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'Unknown date',
        img: post.coverImage || 'https://placehold.co/600x400/CCCCCC/333333?text=No+Image',
        link: post.slug ? `/blogs/${post.slug}` : '#',
        authorName: post.authorName|| 'Guest Author',
        authorImage: post.coverImage || null,
        category: post.category || 'General',
        id: post.id || Math.random().toString(36).substr(2, 9),
      }))
    : relatedBlogs;
  

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found';
  };

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="bg-slate-950 py-20 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          variants={variants}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-500 mb-4">
            Blogs You Might Like
          </h2>
          <p className="text-lg sm:text-xl text-center text-slate-400 max-w-2xl mx-auto mb-12">
            Explore more great articles from our community of writers.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ staggerChildren: 0.2, duration: 0.6 }}
        >
          {newsItems.map((blog, idx) => (
            <motion.article
              key={blog.id}
              className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group"
              variants={variants}
            >
              <a href="#" className="block">
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={blog.img}
                    alt={blog.title}
                    width={400}
                    height={260}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={handleImageError}
                  />
                </div>
                <div className="p-5">
                  <div className="mb-2">
                    <span className="inline-block bg-slate-700 text-slate-300 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                      {blog.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl leading-snug text-white group-hover:text-violet-400 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">By {blog.authorName}</p>
                </div>
              </a>
            </motion.article>
          ))}
        </motion.div>
        
        <motion.div
          className="text-center mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          variants={variants}
        >
          <a
            href="/blogs"
            className="inline-block px-8 py-4 rounded-full font-bold text-lg shadow-md transition-all duration-300 transform hover:scale-105"
            style={{
              background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
              color: 'white',
            }}
          >
            Explore All Blogs &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularBlogsSection;
