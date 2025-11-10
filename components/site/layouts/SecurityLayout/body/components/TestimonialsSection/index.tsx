'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon, ShieldCheckIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { MegaphoneIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'; // Using quote icons
import { useStoreContext } from '@/contexts/StoreContext';
import { Testimonial } from '@/types/typings';

// --- SECURITY-FOCUSED STATIC FALLBACK TESTIMONIALS ---
const securityTestimonials: any[] = [
  {
    authorName: "Dr. Evelyn Reed",
    text: "“Since partnering with CyberShield, we've achieved 100% regulatory compliance and zero significant incidents. Their continuous threat monitoring is the reason we can sleep at night. Truly the best in cyber defense!”",
    rating: 5,
    image: "https://placehold.co/128x128/00A880/ffffff?text=ER",
    company: "CTO, BioPharma Labs", // Relevant title/industry
  },
  {
    authorName: "Robert Hsu",
    text: "“Their incident response time is unmatched. A potential breach was neutralized in minutes, not hours. The expertise and strategic planning provided by [Company Name] turned a crisis into a non-event.”",
    rating: 5,
    image: "https://placehold.co/128x128/3B82F6/ffffff?text=RH",
    company: "Head of Infrastructure, FinTech Secure",
  },
  {
    authorName: "Maria Chavez",
    text: "“We needed a Zero Trust Architecture implemented fast. [Company Name] delivered with precision and deep technical mastery. Their team is a true partner in securing our remote workforce.”",
    rating: 5,
    image: "https://placehold.co/128x128/9CA3AF/ffffff?text=MC",
    company: "VP of Digital Transformation, Global Logistics",
  },
  {
    authorName: "Alex Turner",
    text: "“The clarity and direction I gained from their security audit were invaluable. They empowered our in-house team to be more aligned and productive in our defensive strategies.”",
    rating: 4,
    image: "https://placehold.co/128x128/FFC107/ffffff?text=AT",
    company: "IT Security Manager, Mid-Market Retail",
  },
];


// Framer Motion variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const ratingStars = (rating: number) => (
  <div className="flex text-yellow-500 gap-0.5">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

interface TestimonialsSectionProps {
  themeSettings: Record<string, any> | undefined | null;
  testimonials: Testimonial[] | undefined | null;
  name: string | undefined | null;
}

export default function TestimonialsSectionSecurityLight({ themeSettings, testimonials, name }: TestimonialsSectionProps) {

  const primaryColor = themeSettings?.primaryColor || '#00A880'; // Teal
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6'; // Blue
  const sectionBgColor = themeSettings?.backgroundColor || '#F9FAFB'; // Very light gray for trust
  const accentColor = primaryColor;
  const accentBgOpacity = `${primaryColor}15`;
  const firmName = name || 'CyberShield';

  // Map incoming data or use security defaults
  const testimonialsData = Array.isArray(testimonials) && testimonials.length > 0
    ? testimonials.map((t) => ({
        authorName: t.authorName || 'Security Leader',
        text: t.quote || 'Exceptional security and reliability!',
        rating: typeof t.rating === 'number' ? Math.max(0, Math.min(5, t.rating)) : 5,
        image: t.avatarUrl || `https://placehold.co/128x128/94A3B8/ffffff?text=${t.authorName?.substring(0, 2).toUpperCase() || 'SL'}`,
        company: (t as any).company || 'Security Director', // Assume company is added by the user
      }))
    : securityTestimonials.map(t => ({
        ...t,
        text: t.text.replace('[Company Name]', firmName).replace('[Your Company Name/Name]', firmName),
      }));


  return (
    <motion.section
      id="security-success"
      className="relative py-20 md:py-32 px-6 lg:px-12 overflow-hidden"
      style={{ backgroundColor: sectionBgColor }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      {/* Background gradients for subtle depth */}
      <div
        className="absolute top-0 right-0 w-1/2 h-1/2 opacity-5"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${primaryColor}, transparent 50%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-5"
        style={{
          background: `radial-gradient(circle at 0% 100%, ${secondaryColor}, transparent 50%)`,
        }}
      />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.span
          className="inline-flex items-center text-sm font-bold px-4 py-2 rounded-full mb-4 shadow-sm uppercase tracking-widest"
          variants={itemVariants}
          style={{
            backgroundColor: accentBgOpacity,
            color: accentColor,
            border: `1px solid ${accentColor}40`,
          }}
        >
          <AcademicCapIcon className="w-4 h-4 mr-2" />
          Validated Expertise
        </motion.span>

        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight drop-shadow-sm"
          variants={itemVariants}
        >
          Proven <span style={{ color: primaryColor }}>Security Success</span> Stories
        </motion.h2>

        <motion.p
          className="text-gray-600 max-w-3xl mx-auto text-lg md:text-xl mb-16"
          variants={itemVariants}
        >
          Hear directly from business leaders who have transformed their cyber resilience and achieved zero downtime with our solutions.
        </motion.p>

        {/* Testimonials Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsData.slice(0, 6).map((t, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-full flex flex-col justify-between transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              variants={itemVariants}
              // Optional: Add a subtle border color hover for impact
              whileHover={{ 
                  boxShadow: `0 15px 35px ${primaryColor}15`, 
                  borderColor: `${primaryColor}60` 
              }}
            >
              <div className="relative mb-8 flex-grow">
                {/* Large, primary-colored quote icon for visual frame */}
                <ChatBubbleBottomCenterTextIcon 
                    className="absolute -top-4 -left-4 w-12 h-12 opacity-10" 
                    style={{ color: primaryColor }}
                />
                
                <p className="text-gray-800 text-lg md:text-xl leading-relaxed italic font-medium relative z-10">
                  {t.text}
                </p>
              </div>

              <div className="flex items-center mt-auto pt-6 border-t border-gray-100">
                {/* Avatar */}
                <img
                  src={t.image || 'https://placehold.co/128x128/94A3B8/ffffff?text=Avatar'}
                  alt={t.authorName || 'Client Avatar'}
                  width={64}
                  height={64}
                  className="rounded-full object-cover w-16 h-16 border-4 shadow-md"
                  style={{ borderColor: primaryColor }} // Border matches primary color
                />
                <div className="text-left ml-4">
                  <p className="font-bold text-lg text-gray-900">
                    {t.authorName}
                  </p>
                  
                  {/* Company Title/Role */}
                  <p className="text-sm text-gray-600 mt-0.5">
                    {t.company}
                  </p>

                  {/* Rating Stars */}
                  {ratingStars(t.rating)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}