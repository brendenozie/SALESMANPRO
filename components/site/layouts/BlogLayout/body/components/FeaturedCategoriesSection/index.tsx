import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Mock data for blog categories to make the component runnable
const categories = [
  {
    name: 'Technology',
    count: 125,
    icon: (
      <svg className="w-12 h-12 text-blue-400 mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
      </svg>
    ),
  },
  {
    name: 'Lifestyle',
    count: 89,
    icon: (
      <svg className="w-12 h-12 text-pink-400 mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    ),
  },
  {
    name: 'Travel',
    count: 67,
    icon: (
      <svg className="w-12 h-12 text-green-400 mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 6h-6V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H2v15h20V6zm-8 0h-4V4h4v2z" />
      </svg>
    ),
  },
  {
    name: 'Science',
    count: 45,
    icon: (
      <svg className="w-12 h-12 text-purple-400 mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h-2V7zm0 6h2v2h-2v-2z" />
      </svg>
    ),
  },
  {
    name: 'Finance',
    count: 98,
    icon: (
      <svg className="w-12 h-12 text-yellow-400 mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12z" />
      </svg>
    ),
  },
  {
    name: 'Health',
    count: 76,
    icon: (
      <svg className="w-12 h-12 text-red-400 mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h-2V7zm0 6h2v2h-2v-2z" />
      </svg>
    ),
  },
];

const FeaturedCategoriesSection = () => {
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const { storeFormData } = useStoreContext() || {};
  const { StoreCategory } = storeFormData || {};
  
  // Use dynamic data if available, otherwise use the static fallback
  const storecategories = (Array.isArray(StoreCategory) && StoreCategory.length > 0)
    ? [...StoreCategory]
    : categories;

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
            Browse Our Categories
          </h2>
          <p className="text-lg sm:text-xl text-center text-slate-400 max-w-2xl mx-auto mb-12">
            Find the topics that interest you most and dive deeper into our content.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ staggerChildren: 0.2, duration: 0.6 }}
        >
          {categories.map((category, idx) => (
            <motion.div
              key={idx}
              className="bg-slate-800 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col items-center"
              variants={variants}
            >
              {category.icon}
              <h4 className="mt-2 font-bold text-lg text-white">{category.name}</h4>
              <p className="text-slate-400 text-sm mt-1">{category.count} articles</p>
            </motion.div>
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
            href="/categories"
            className="inline-block px-8 py-4 rounded-full font-bold text-lg shadow-md transition-all duration-300 transform hover:scale-105"
            style={{
              background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
              color: 'white',
            }}
          >
            Explore All Categories &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCategoriesSection;
