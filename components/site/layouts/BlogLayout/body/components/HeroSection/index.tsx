import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Define the structure of a single hero slide as it comes from StoreForm
export type HeroSlide = {
  id: string;
  imageUrl: string;
  headline: string;
  subline: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  // If you decide to add a specific 'badgeText' field to your Prisma HeroSlide model,
  // you would add it here:
  badgeText?: string; 
};

// Define the relevant parts of StoreForm that HeroSection uses
export type StoreForm = {
  name?: string;
  tagline?: string;
  themeSettings?: {
    primaryColor?: string;
    // Add other theme settings if needed
  };
  heroSlides?: HeroSlide[]; // Array of HeroSlide objects
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import and ensure
// your StoreContext provides data conforming to the StoreForm type.

// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'GLOBAL INSIGHTS',
//     tagline: 'Your Daily Dose of Knowledge and Inspiration',
//     themeSettings: { primaryColor: '#EF4444' }, // Tailwind 'red-500'
//     heroSlides: [
//       {
//         id: 'hero1',
//         imageUrl: 'https://placehold.co/1200x800/22C55E/FFFFFF?text=AI+Future', // Example placeholder
//         headline: 'The Future of AI: Innovations Shaping Our World',
//         subline: 'Explore the cutting-edge advancements in artificial intelligence.',
//         ctaText: 'Read More',
//         ctaLink: '#',
//         order: 1,
//         badgeText: 'TECHNOLOGY', // Example: if you add this to your HeroSlide model
//       },
//       {
//         id: 'hero2',
//         imageUrl: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Mindful+Living', // Example placeholder
//         headline: 'Mindful Living: A Guide to Wellness and Balance',
//         subline: 'Discover practices for a healthier and more balanced life.',
//         ctaText: 'Discover',
//         ctaLink: '#',
//         order: 2,
//         badgeText: 'HEALTH',
//       },
//       {
//         id: 'hero3',
//         imageUrl: 'https://placehold.co/600x400/EC4899/FFFFFF?text=Travel+Adventure', // Example placeholder
//         headline: 'Exploring Hidden Gems: Your Next Adventure Awaits',
//         subline: 'Uncover breathtaking destinations and travel tips.',
//         ctaText: 'Plan Trip',
//         ctaLink: '#',
//         order: 3,
//         badgeText: 'TRAVEL',
//       },
//     ],
//   } as StoreForm, // Cast to StoreForm for type safety in mock
// });


// Static fallback data - used if dynamic data from useStoreContext is not available or empty
const heroItems = {
  main: {
    label: 'ECONOMY',
    title: 'Exploring the Intricacies of Markets, Money, and Global Economies',
    img: 'https://placehold.co/1200x800/F97316/FFFFFF?text=Economy+Insights', // Placeholder image
    cta: {
      text: 'Learn More',
      link: '#',
    },
  },
  side: [
    {
      label: 'STYLE',
      title: 'A Journey Through Colors, Textures, and Trends',
      img: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Fashion+Trends', // Placeholder image
      cta: {
        text: 'Explore Style',
        link: '#',
      },
    },
    {
      label: 'ART',
      title: 'Inspiring Creativity and Fostering Artistic Expression',
      img: 'https://placehold.co/600x400/10B981/FFFFFF?text=Artistic+Expression', // Placeholder image
      cta: {
        text: 'View Art',
        link: '#',
      },
    },
  ],
};

function HeroSection() {
  // Destructure storeFormData from context, providing a fallback for when context is not available
  const { storeFormData } = useStoreContext() || {};
  const {
    name = 'NEWS 24', // Default blog name
    tagline = 'Your source for daily news and insights.', // Default tagline
    themeSettings: { primaryColor = '#EF4444' } = {}, // Default primary color (Tailwind red-500)
    heroSlides, // Dynamic hero slide data from transformed data
  } = storeFormData || {};

  // Determine whether to use dynamic data or static fallback data
  // Dynamic data is used if heroSlides is an array and has at least one item.
  const hasDynamicSlides = Array.isArray(heroSlides) && heroSlides.length > 0;

  // Structure the data for rendering, prioritizing dynamic data
  const contentToRender = hasDynamicSlides
    ? {
        // Main hero card data (first slide from dynamic data)
        main: {
          label: heroSlides[0].badgeText || heroSlides[0].headline || name, // Prioritize badgeText, then headline, then blog name
          title: heroSlides[0].headline || tagline,
          img: heroSlides[0].imageUrl,
          cta: {
            text: heroSlides[0].ctaText,
            link: heroSlides[0].ctaLink,
          },
        },
        // Side hero cards data (remaining slides from dynamic data)
        side: heroSlides.slice(1).map((slide) => ({
          label: slide.badgeText || slide.headline || name, // Prioritize badgeText, then headline, then blog name
          title: slide.headline || tagline,
          img: slide.imageUrl,
          cta: {
            text: slide.ctaText,
            link: slide.ctaLink,
          },
        })),
      }
    : heroItems; // Fallback to static data if no dynamic slides are provided

  // Function to handle image loading errors, replacing with a generic placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found'; // Generic placeholder
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 md:py-20 font-inter">
      {/* Main Title and Tagline */}
      <motion.h1
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center mb-4 text-gray-900 leading-tight"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {name}
      </motion.h1>
      {tagline && (
        <motion.p
          className="text-lg sm:text-xl text-center mb-12 text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {tagline}
        </motion.p>
      )}

      {/* Hero Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2">
        {/* Main hero card */}
        <motion.div
          className="relative md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        >
          {/* Image with fallback */}
          <img
            src={contentToRender.main.img}
            alt={contentToRender.main.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />
          
          {/* Content for the main card */}
          <div className="absolute bottom-6 left-6 right-6 text-white p-4">
            {/* Label/Badge */}
            <span
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide"
              style={{ backgroundColor: primaryColor }}
            >
              {contentToRender.main.label}
            </span>
            {/* Title */}
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight max-w-xl text-shadow-lg">
              {contentToRender.main.title}
            </h2>
            {/* Call to Action Button */}
            {contentToRender.main.cta?.text && (
              <a
                href={contentToRender.main.cta.link || '#'}
                className="inline-block mt-5 px-6 py-3 bg-white text-gray-900 rounded-full font-semibold text-base shadow-md hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
              >
                {contentToRender.main.cta.text}
              </a>
            )}
          </div>
        </motion.div>

        {/* Side cards */}
        {(contentToRender.side || []).map((item, idx) => (
          <motion.div
            key={idx}
            className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + idx * 0.15 }}
            whileHover={{ scale: 1.03, boxShadow: '0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 8px -4px rgba(0, 0, 0, 0.04)' }}
          >
            {/* Image with fallback */}
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
            
            {/* Content for side card */}
            <div className="absolute bottom-4 left-4 right-4 text-white p-3">
              {/* Label/Badge */}
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: primaryColor }}
              >
                {item.label}
              </span>
              {/* Title */}
              <h3 className="mt-2 text-lg sm:text-xl font-bold leading-snug max-w-xs text-shadow-md">
                {item.title}
              </h3>
              {/* Call to Action Button */}
              {item.cta?.text && (
                <a
                  href={item.cta.link || '#'}
                  className="inline-block mt-3 px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-medium shadow-sm hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
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
