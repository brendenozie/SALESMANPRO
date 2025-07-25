"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type HeroSlide = {
  id: string;
  imageUrl: string;
  headline: string;
  subline: string;
  ctaText: string;
  ctaLink: string;
  order: number;
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  id?: string;
  name?: string; // For the organization's name
  tagline?: string; // For a catchy phrase
  description?: string; // For a longer description
  bannerUrl?: string; // General banner image
  heroSlides?: HeroSlide[]; // Array of hero slides, if multiple are supported
  themeSettings?: ThemeSettings;
  // Add other relevant StoreForm fields if needed for this section
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     id: 'nonprofit-org-id',
//     name: 'Children\'s Hope Foundation', // Example organization name
//     tagline: 'Lend Your Heart To Change A Child\'s Story', // Catchy tagline
//     description: 'Join us in providing hope and support to children in need around the world.', // Longer description
//     bannerUrl: 'https://images.unsplash.com/photo-1576765974026-6113b2e7c3e1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // High-quality image of children
//     heroSlides: [
//       {
//         id: 'hero-slide-1',
//         imageUrl: 'https://images.unsplash.com/photo-1576765974026-6113b2e7c3e1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         headline: 'Lend Your Heart To Change A Child\'s Story',
//         subline: 'Join us in providing hope and support to children in need around the world.',
//         ctaText: 'Learn About Our Causes',
//         ctaLink: '/causes',
//         order: 1,
//       },
//     ],
//     themeSettings: {
//       primaryColor: "#FF5722", // Orange for primary actions
//       secondaryColor: "#FFFFFF", // White for secondary actions/text
//     },
//   } as StoreForm,
// });

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function HeroSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722'; // Default Orange
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#FFFFFF'; // Default White

  // Determine the active hero slide or use defaults
  const activeHeroSlide = storeFormData?.heroSlides?.[0];

  const headline = activeHeroSlide?.headline || storeFormData?.tagline || 'Lend Your Heart To Change A Child\'s Story';
  const subtitle = activeHeroSlide?.subline || storeFormData?.description || 'Join us in providing hope and support to children in need around the world.';
  const ctaButton1Label = activeHeroSlide?.ctaText || 'Learn More';
  const ctaButton1Link = activeHeroSlide?.ctaLink || '#causes';
  const heroImage = activeHeroSlide?.imageUrl || storeFormData?.bannerUrl || "/hero-photo.jpg";

  // Mock router for demonstration (replace with actual useRouter in a Next.js app)
  const mockRouterPush = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // window.location.href = path; // Uncomment for actual redirection
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/1920x1080/CCCCCC/333333?text=Hero+Image+Not+Found";
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Children smiling and playing"
          fill
          className="object-cover brightness-[0.6]" // Slightly dim image for text readability
          loader={loader}
          priority
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto py-20 px-6 mt-20 text-center" // Centered text
      >
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
          {headline.split(' ').map((word, index) => (
            <span key={index}>
              {word === "Change" || word === "Child's" || word === "Story" ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }} // Staggered reveal for highlighted words
                  style={{ color: primaryColor }}
                >
                  {word}{' '}
                </motion.span>
              ) : (
                `${word} `
              )}
            </span>
          ))}
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            href={ctaButton1Link}
            className="px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: primaryColor, color: secondaryColor }}
          >
            {ctaButton1Label}
          </Link>
          <button
            onClick={() => mockRouterPush('/donate')}
            className="border-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-xl"
            style={{ borderColor: secondaryColor, color: secondaryColor, backgroundColor: 'transparent', '--tw-hover-bg': secondaryColor, '--tw-hover-text': primaryColor } as React.CSSProperties}
          >
            Make a Donation
          </button>
        </div>
      </motion.div>
    </section>
  );
}
