"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext'; // Keep this import for actual use

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
  accentColor?: string; // Added for more design flexibility
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

// --- START: Placeholder for useStoreContext (for independent running/demonstration) ---
// In a real application, you would remove this placeholder and use the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     id: 'nonprofit-org-id',
//     name: 'Global Impact Initiative', // More impactful organization name
//     tagline: 'Empowering Communities, Transforming Futures', // Stronger tagline
//     description: 'Join us in our mission to create sustainable change and uplift lives across the globe.', // More inspiring description
//     bannerUrl: 'https://images.unsplash.com/photo-1579762635293-9c869911e3b5?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Diverse group of people collaborating
//     heroSlides: [
//       {
//         id: 'hero-slide-1',
//         imageUrl: 'https://images.unsplash.com/photo-1579762635293-9c869911e3b5?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         headline: 'Empowering Communities, Transforming Futures Together', // Enhanced headline
//         subline: 'Your support enables us to provide education, healthcare, and sustainable development to those who need it most.', // More specific subline
//         ctaText: 'Discover Our Initiatives',
//         ctaLink: '/initiatives',
//         order: 1,
//       },
//       // You can add more hero slides here if your design supports a carousel
//     ],
//     themeSettings: {
//       primaryColor: "#3B82F6", // A vibrant blue for primary actions
//       secondaryColor: "#FFFFFF", // White for secondary actions/text
//       accentColor: "#FCD34D", // A warm yellow for highlights
//     },
//   } as StoreForm,
// });
// --- END: Placeholder ---

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger children elements by 0.1 seconds
      delayChildren: 0.3,   // Start animating children after 0.3 seconds
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function HeroSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#3B82F6'; // Default Vibrant Blue
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#FFFFFF'; // Default White
  const accentColor = storeFormData?.themeSettings?.accentColor || '#FCD34D'; // Default Warm Yellow

  // Determine the active hero slide or use defaults
  const activeHeroSlide = storeFormData?.heroSlides?.[0];

  const headline = activeHeroSlide?.headline || storeFormData?.tagline || 'Empowering Communities, Transforming Futures Together';
  const subtitle = activeHeroSlide?.subline || storeFormData?.description || 'Your support enables us to provide education, healthcare, and sustainable development to those who need it most.';
  const ctaButton1Label = activeHeroSlide?.ctaText || 'Discover Our Initiatives';
  const ctaButton1Link = activeHeroSlide?.ctaLink || '/initiatives';
  const heroImage = activeHeroSlide?.imageUrl || storeFormData?.bannerUrl || "/default-hero.jpg"; // Updated default image name

  // Mock router for demonstration (replace with actual useRouter in a Next.js app)
  const mockRouterPush = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // window.location.href = path; // Uncomment for actual redirection
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/1920x1080/4F46E5/FFFFFF?text=Hero+Image+Unavailable"; // Brighter placeholder
  };

  return (
    <section id="home" className="relative h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden font-sans">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Diverse group of people collaborating on a community project"
          fill
          className="object-cover brightness-[0.5] contrast-[0.9] saturate-[1.1]" // More nuanced image adjustments
          loader={loader}
          priority
          onError={handleImageError}
        />
        {/* Dynamic gradient overlay for better text contrast and visual depth */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/30 to-transparent"
          style={{
            // Optionally, you can make the gradient dynamic based on primary color
            // backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)`
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-5xl mx-auto py-16 px-6 sm:px-8 lg:px-12 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight drop-shadow-lg" variants={itemVariants}>
          {headline.split(' ').map((word, index) => (
            <motion.span key={index} className="inline-block mr-2" variants={wordVariants}>
              {word === "Empowering" || word === "Transforming" || word === "Together" ? (
                <span style={{ color: accentColor }}>{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p className="mt-4 text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90 drop-shadow-md" variants={itemVariants}>
          {subtitle}
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-6 justify-center"
          variants={itemVariants} // Animate the button container
        >
          <Link
            href={ctaButton1Link}
            className="px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            style={{ backgroundColor: primaryColor, color: secondaryColor }}
          >
            {ctaButton1Label}
          </Link>
          <motion.button
            onClick={() => mockRouterPush('/donate')}
            className="border-2 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            style={{ borderColor: secondaryColor, color: secondaryColor, backgroundColor: 'transparent' }}
            // Apply hover styles directly with motion for smoother transitions
            whileHover={{
              backgroundColor: secondaryColor,
              color: primaryColor,
              borderColor: secondaryColor,
            }}
          >
            Make a Donation
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}