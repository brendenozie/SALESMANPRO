"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, ClipboardDocumentListIcon, AcademicCapIcon, BanknotesIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from "@/contexts/StoreContext";
import { HeroSlide } from '@/types/typings';

// Define the shape of the hero slide data, exactly matching your provided sample
// export type HeroSlide = {
//   id: string;
//   headline: string;
//   subline: string;
//   imageUrl: string;
//   ctaText?: string;
//   ctaLink?: string;
//   badgeText?: string;
// };
// New type definition based on the Prisma Banner model
// export type Banner = {
//   id: string;
//   imageUrl: string;
//   headline?: string | null;
//   subline?: string | null;
//   ctaText?: string | null;
//   ctaLink?: string | null;
//   videoLink?: string | null;
//   badgeText?: string | null;
//   price?: string | null;
//   endsAt?: Date | null;
//   order?: number;
//   iconKey?: string | null;
//   backgroundColor?: string | null;
//   textColor?: string | null;
// };

// Next.js Image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => `${src}?w=${width}&q=${quality || 75}`;

// Animation variants for a staggered, clean entrance
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function HealthcareHero() {
  const { storeFormData } = useStoreContext();

  // Access the heroSlides array from the context
  const heroSlides = storeFormData?.heroSlides;

  // Use the first slide's data, or fall back to a default value with the correct keys
  const primarySlide = heroSlides?.[0] || {
    id: "default-slide",
    headline: "Your Health, Our Passion",
    subline: "Providing compassionate, comprehensive care for you and your family.",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ctaText: "Book an Appointment",
    ctaLink: `/${storeFormData?.slug || 'unbite-healthcare'}/book`,
    badgeText: "A Step Towards Wellness",
  };

  const { headline, subline, imageUrl, ctaText, ctaLink, badgeText } = primarySlide;
  const slug = storeFormData?.slug || 'unbite-healthcare';
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#008080";
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || "#00b3b3";
  const router = useRouter();

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <Image
        src={imageUrl || "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
        alt={headline || "Healthcare Hero Image"}
        fill
        className="object-cover object-center"
        loader={loader}
        priority
      />

      {/* Dark Overlay and Dynamic Gradient */}
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-teal-700 via-blue-600 to-indigo-600 opacity-75 mix-blend-multiply"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0.95 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Content Container */}
      <motion.div
        className="relative z-10 px-6 py-20 mt-20 text-center max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        {badgeText && (
          <motion.p
            className="inline-block uppercase text-sm font-semibold tracking-widest rounded-full px-5 py-2 mb-4 drop-shadow-md"
            style={{ backgroundColor: secondaryColor, color: "white" }}
            variants={itemVariants}
          >
            {badgeText}
          </motion.p>
        )}

        {/* Main Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 drop-shadow-2xl"
          variants={itemVariants}
        >
          {headline}
        </motion.h1>

        {/* Subline */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-gray-100/95 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-lg"
          variants={itemVariants}
        >
          {subline}
        </motion.p>

        {/* CTA Button */}
        <motion.div className="flex flex-col sm:flex-row justify-center gap-6" variants={itemVariants}>
          {ctaLink && (
            <Link
              href={ctaLink}
              className="flex items-center justify-center font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              style={{ backgroundColor: primaryColor, color: "white" }}
            >
              <ClipboardDocumentListIcon className="w-6 h-6 mr-3" />
              {ctaText || "Learn More"}
            </Link>
          )}

          {/* Optional: Secondary CTA, using a fallback for the sake of the original design */}
          <Link
            href={`/${slug}/contact`}
            className="flex items-center justify-center border-2 border-white text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            style={{ borderColor: primaryColor, color: primaryColor }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = primaryColor; }}
          >
            <HeartIcon className="w-6 h-6 mr-3" />
            Find a Doctor
          </Link>
        </motion.div>

        {/* Value Proposition Icons */}
        <div className="mt-20 flex justify-center gap-10 opacity-80">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col items-center"
          >
            <AcademicCapIcon className="w-10 h-10 text-white mb-2" />
            <span className="text-sm font-medium">Expert Doctors</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center"
          >
            <BanknotesIcon className="w-10 h-10 text-white mb-2" />
            <span className="text-sm font-medium">Affordable Care</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex flex-col items-center"
          >
            <PlayCircleIcon className="w-10 h-10 text-white mb-2" />
            <span className="text-sm font-medium">Patient-Centered</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}