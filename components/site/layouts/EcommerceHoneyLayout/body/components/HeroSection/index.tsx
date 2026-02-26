import React from 'react';
import { CalendarIcon, ClipboardDocumentListIcon, HandRaisedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Hero section data
const heroItems = {
  main: {
    label: 'ECONOMY',
    title: 'Exploring the Intricacies of Markets, Money, and Global Economies',
    img: '/images/hero-main.jpg',
  },
  side: [
    {
      label: 'STYLE',
      title: 'A Journey Through Colors, Textures, and Trends',
      img: '/images/hero-style.jpg',
    },
    {
      label: 'ART',
      title: 'Inspiring Creativity and Fostering Artistic Expression',
      img: '/images/hero-art.jpg',
    },
  ],
};

function HeroSection() {
  return (
    <section className="container mx-auto px-6 py-12">
      <motion.h1
        className="text-5xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        NEWS 24
      </motion.h1>

      <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2">
        {/* Main hero card spanning two rows */}
        <motion.div
          className="relative md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <img
            src={heroItems.main.img}
            alt={heroItems.main.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
          <div className="absolute bottom-6 left-6 text-white">
            <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-semibold">
              {heroItems.main.label}
            </span>
            <h2 className="mt-2 text-2xl font-semibold max-w-md">
              {heroItems.main.title}
            </h2>
          </div>
        </motion.div>

        {/* Side cards */}
        {heroItems.side.map((item, idx) => (
          <motion.div
            key={idx}
            className="relative rounded-2xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <img src={item.img} alt={item.title} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
            <div className="absolute bottom-4 left-4 text-white">
              <span className="bg-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
                {item.label}
              </span>
              <h3 className="mt-1 text-lg font-medium max-w-xs">
                {item.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default HeroSection;
