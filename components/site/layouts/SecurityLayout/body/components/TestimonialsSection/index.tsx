'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { Testimonial } from '@/types/typings';

// Static fallback testimonials with more detail
const staticTestimonials:any[] = [
  {
    authorName: "Sarah L.",
    text: "“Working with our team has been a game-changer for my business. Their insights and strategies are incredibly practical and have led to tangible growth. The service is seamless, and their dedication is truly inspiring!”",
    quote: "“Working with our team has been a game-changer for my business. Their insights and strategies are incredibly practical and have led to tangible growth. The service is seamless, and their dedication is truly inspiring!”",
    rating: 5,
    image: "https://placehold.co/128x128/9CA3AF/ffffff?text=SL",
    company: "Founder, InnovateCorp",
  },
  {
    authorName: "James K.",
    text: "“From the very first discovery call, I knew I was in capable hands. The personalized coaching sessions helped me overcome my biggest challenges and achieve goals I thought were out of reach. Absolutely top-tier support!”",
    quote: "“From the very first discovery call, I knew I was in capable hands. The personalized coaching sessions helped me overcome my biggest challenges and achieve goals I thought were out of reach. Absolutely top-tier support!”",
    rating: 5,
    image: "https://placehold.co/128x128/FBBF24/ffffff?text=JK",
    company: "CEO, GrowthPath Solutions",
  },
  {
    authorName: "Aisha R.",
    text: "“I was hesitant at first, but our team exceeded all my expectations. Their unique approach transformed my understanding of leadership, and the results speak for themselves. Highly recommend for anyone serious about growth.”",
    quote: "“I was hesitant at first, but our team exceeded all my expectations. Their unique approach transformed my understanding of leadership, and the results speak for themselves. Highly recommend for anyone serious about growth.”",
    rating: 5,
    image: "https://placehold.co/128x128/EC4899/ffffff?text=AR",
    company: "Director, FutureMakers Inc.",
  },
  {
    authorName: "Michael B.",
    text: "“The clarity and direction I gained from these sessions are invaluable. It’s not just about advice; it's about empowerment. My team and I are more aligned and productive than ever before.”",
    quote: "“The clarity and direction I gained from these sessions are invaluable. It’s not just about advice; it's about empowerment. My team and I are more aligned and productive than ever before.”",
    rating: 4,
    image: "https://placehold.co/128x128/8B5CF6/ffffff?text=MB",
    company: "Team Lead, Synergy Tech",
  },
  {
    authorName: "Emily C.",
    text: "“Exceptional guidance! Our team provided actionable strategies that directly impacted our bottom line. Truly a partner in success.”",
    quote: "“Exceptional guidance! Our team provided actionable strategies that directly impacted our bottom line. Truly a partner in success.”",
    rating: 5,
    image: "https://placehold.co/128x128/10B981/ffffff?text=EC",
    company: "Marketing Manager, BrightIdea Co.",
  },
];


// Framer Motion variants for staggered animations
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
  <div className="flex text-yellow-400 gap-0.5">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

interface TestimonialsSectionProps { 
  themeSettings: Record<string, any> | undefined | null;
  testimonials: Testimonial[] | undefined | null;
  name: string | undefined | null;
}

export default function TestimonialsSection({themeSettings, testimonials, name}:TestimonialsSectionProps) {

  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#10B981';
  const sectionBgColor = themeSettings?.backgroundColor || '#F3F4F6';
  const accentColor = primaryColor;
  const accentBgOpacity = `${primaryColor}15`;

  const testimonialsData = Array.isArray(testimonials) && testimonials.length > 0
    ? testimonials.map((t) => ({
        authorName: t.authorName || 'Anonymous',
        text: t.quote || '',
        rating: typeof t.rating === 'number' ? Math.max(0, Math.min(5, t.rating)) : 5,
        image: t.avatarUrl || `https://placehold.co/128x128/${Math.random().toString(16).substring(2, 8)}/ffffff?text=${t.authorName?.substring(0, 2).toUpperCase()}`,
        // company: t.company || '',
      }))
    : staticTestimonials.map(t => ({
        ...t,
        text: t.text.replace('[Your Company Name/Name]', name || 'our team'),
      }));

  return (
    <motion.section
      id="testimonials"
      className="relative py-20 md:py-32 px-6 lg:px-12 overflow-hidden"
      style={{ backgroundColor: sectionBgColor }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      {/* Background gradients for visual depth */}
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
          className="inline-block text-sm font-semibold px-4 py-1 rounded-full mb-4 shadow-sm"
          variants={itemVariants}
          style={{
            backgroundColor: accentBgOpacity,
            color: accentColor,
          }}
        >
          Client Stories
        </motion.span>

        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight drop-shadow-sm"
          variants={itemVariants}
        >
          What Our Clients <span style={{ color: primaryColor }}>Love</span> About {name || 'Us'}
        </motion.h2>

        <motion.p
          className="text-gray-700 max-w-2xl mx-auto text-lg md:text-xl mb-12"
          variants={itemVariants}
        >
          Don't just take our word for it. Hear directly from those who have experienced the difference.
        </motion.p>

        {/* Testimonials Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsData.map((t, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-full flex flex-col justify-between transform hover:scale-[1.01] transition-all duration-300"
              variants={itemVariants}
            >
              <div className="relative mb-6">
                <QuestionMarkCircleIcon className="absolute -top-4 -left-4 w-12 h-12 text-gray-200 opacity-80" />
                <p className="text-gray-800 text-lg md:text-xl leading-relaxed italic font-medium">
                  {t.text}
                </p>
                <QuestionMarkCircleIcon className="absolute -bottom-4 -right-4 w-12 h-12 text-gray-200 opacity-80" />
              </div>

              <div className="flex items-center mt-auto pt-6 border-t border-gray-100">
                <img
                  src={t.image || 'https://placehold.co/128x128/94A3B8/ffffff?text=Avatar'}
                  alt={t.text || 'Testimonial Avatar'}
                  width={64}
                  height={64}
                  className="rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="text-left ml-4">
                  <p className="font-bold text-lg text-gray-900">
                    {t.authorName}
                  </p>
                  
                    <p className="text-sm text-gray-600 mt-0.5">

                    </p>

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
