import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Static fallback data
const heroItems = {
  main: {
    label: 'ECONOMY',
    title: 'Exploring the Intricacies of Markets, Money, and Global Economies',
    img: '/images/hero-main.jpg',
    cta: {
      text: undefined,
      link: undefined,
    },
  },
  side: [
    {
      label: 'STYLE',
      title: 'A Journey Through Colors, Textures, and Trends',
      img: '/images/hero-style.jpg',
      cta: {
        text: undefined,
        link: undefined,
      },
    },
    {
      label: 'ART',
      title: 'Inspiring Creativity and Fostering Artistic Expression',
      img: '/images/hero-art.jpg',
      cta: {
        text: undefined,
        link: undefined,
      },
    },
  ],
};

function HeroSection() {
  const { storeFormData } = useStoreContext() || {};
  const {
    name = 'NEWS 24',
    tagline = '',
    themeSettings: { primaryColor = 'red' } = {},
    heroSlides,
  } = storeFormData || {};

  // Decide which data to render
  const hasDynamic = Array.isArray(heroSlides) && heroSlides.length > 0;

  // Build a “main” + “side” layout from dynamic slides
  const dynamic = hasDynamic
    ? {
        main: {
          label: storeFormData?.heroSlides[0].badgeText || name,
          title: storeFormData?.heroSlides[0].headline || tagline,
          img: storeFormData?.heroSlides[0].imageUrl!,
          cta: {
            text: storeFormData?.heroSlides[0].ctaText,
            link: storeFormData?.heroSlides[0].ctaLink,
          },
        },
        side: storeFormData?.heroSlides.slice(1).map((slide) => ({
          label: slide.badgeText || name,
          title: slide.headline || tagline,
          img: slide.imageUrl!,
          cta: {
            text: slide.ctaText,
            link: slide.ctaLink,
          },
        })),
      }
    : heroItems;

  return (
    <section className="container mx-auto px-6 py-12">
      {/* Title */}
      <motion.h1
        className="text-5xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {name}
      </motion.h1>
      {tagline && (
        <motion.p
          className="text-center text-lg mb-12 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {tagline}
        </motion.p>
      )}

      <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2">
        {/* Main hero card */}
        <motion.div
          className="relative md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <img
            src={dynamic.main.img}
            alt={dynamic.main.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
          <div className="absolute bottom-6 left-6 text-white">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: primaryColor }}
            >
              {dynamic.main.label}
            </span>
            <h2 className="mt-2 text-2xl font-semibold max-w-md">
              {dynamic.main.title}
            </h2>
            {dynamic.main.cta?.text && (
              <a
                href={dynamic.main.cta.link}
                className="inline-block mt-4 px-4 py-2 bg-white text-black rounded-full font-medium"
              >
                {dynamic.main.cta.text}
              </a>
            )}
          </div>
        </motion.div>

        {/* Side cards */}
        {(dynamic.side || []).map((item, idx) => (
          <motion.div
            key={idx}
            className="relative rounded-2xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
            <div className="absolute bottom-4 left-4 text-white">
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                {item.label}
              </span>
              <h3 className="mt-1 text-lg font-medium max-w-xs">
                {item.title}
              </h3>
              {item.cta?.text && (
                <a
                  href={item.cta.link}
                  className="inline-block mt-2 px-3 py-1 bg-white text-black rounded-full text-xs font-medium"
                >
                  {item.cta.text}
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default HeroSection;
