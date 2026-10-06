'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';

// Define the structure of a single AppPromo as it might come from StoreForm
export type AppPromo = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  // You might add other fields here if your AppPromo model has them,
  // e.g., 'imagePosition': 'left' | 'right', 'backgroundColor', etc.
};

// Define the relevant parts of StoreForm that HeroCtaSection uses
export type StoreForm = {
  name?: string; // For fallback title
  tagline?: string; // For fallback subtitle
  appPromos?: AppPromo[]; // Array of AppPromo objects
  themeSettings?: {
    primaryColor?: string; // For button color or other accents
    // Add other theme settings if needed
  };
};



// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

interface HeroCtaSectionProps {
  // These props can now be overridden by dynamic data from StoreForm
  // or used as local defaults if StoreForm data is not available/desired.
  variant?: 'left' | 'right'; // Image position
  bgColor?: string; // Custom background color/gradient for flexibility
  textColor?: string; // Custom text color
}

export default function HeroCtaSection({
  variant = 'right', // Default image on the right
  bgColor = 'bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900', // Vibrant gradient
  textColor = 'text-white',
}: HeroCtaSectionProps) {
  // Destructure storeFormData from context
  const { storeFormData } = useStoreContext() || {};
  const { appPromos, name: storeName, tagline: storeTagline, themeSettings } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#2563EB'; // Default to Tailwind blue-600 if not set
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  // Select the first AppPromo if available, or use a default structure
  const mainAppPromo = (Array.isArray(appPromos) && appPromos.length > 0)
    ? appPromos[0] // Taking the first promo
    : null;

  // Use dynamic data with fallbacks
  const finalTitle = mainAppPromo?.title || storeName || 'Unlock a World of Local Services';
  const finalSubtitle = mainAppPromo?.description || storeTagline || 'Discover top-rated businesses, book appointments, and connect with professionals in your community—all in one place.';
  const finalButtonLabel = mainAppPromo?.ctaText || 'Explore Services';
  const finalButtonHref = mainAppPromo?.ctaLink || '/explore';
  const finalImageUrl = mainAppPromo?.imageUrl || 'https://images.unsplash.com/photo-1556740738-b6154637d57a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Generic placeholder
  const finalImageAlt = mainAppPromo?.title || 'Person using a mobile app to find local services';

  // Use primary color from theme settings for the button background if available
  const buttonBgColor = themeSettings?.primaryColor || '#2563EB'; // Default to blue-600

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: 'easeOut' } },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = 'https://images.unsplash.com/photo-1556740738-b6154637d57a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Generic placeholder
  };


         const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setIsSubmitting(true);
                const formattedContent = `NEW INQUIRY\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
        
                try {
                    const res = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ companyId: storeFormData?.id, content: formattedContent }),
                    });
                    if (!res.ok) throw new Error("API Error");
                    setSubmitStatus('success');
                    setFormData({ name: '', email: '', message: '' });
                } catch (error) {
                    setSubmitStatus('error');
                } finally {
                    setIsSubmitting(false);
                }
            };

  return (
    <motion.section
      className={`relative ${bgColor} ${textColor} py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-3xl shadow-xl mx-auto max-w-7xl`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div
        className={`flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 ${
          variant === 'left' ? 'md:flex-row-reverse' : ''
        }`}
      >
        {/* Content Section */}
        <div className="md:w-1/2 text-center md:text-left z-10">
          <motion.h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4" variants={itemVariants}>
            {finalTitle}
          </motion.h2>
          <motion.p className="text-lg sm:text-xl opacity-90 mb-8 max-w-prose mx-auto md:mx-0" variants={itemVariants}>
            {finalSubtitle}
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link
              href={finalButtonHref}
              className="inline-flex items-center px-8 py-4 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              style={{ backgroundColor: buttonBgColor, color: '#FFFFFF' }} // Dynamic background, fixed white text
            >
              {finalButtonLabel}
              <svg
                className="ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Image Section */}
        <motion.div className="md:w-1/2 relative h-64 sm:h-80 md:h-96 w-full max-w-md mx-auto md:mx-0 rounded-3xl overflow-hidden shadow-2xl z-0" variants={imageVariants}>
          <Image decoding="async"
            src={finalImageUrl}
            alt={finalImageAlt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority // Prioritize loading for a hero section image
            onError={handleImageError} // Image error fallback
          />
          {/* Subtle gradient overlay on image for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </motion.div>
      </div>
      {/* Optional: Abstract shapes for visual interest */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
    </motion.section>
  );
}
