'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademicCapIcon } from '@heroicons/react/24/outline'; // Outline line-art icon
import { useStoreContext } from '@/contexts/StoreContext';
import { Testimonial } from '@/types/typings';

const securityTestimonials: any[] = [
  {
    authorName: "Dr. Evelyn Reed",
    text: "Since partnering with CyberShield, we've achieved 100% regulatory compliance and zero significant incidents. Their continuous threat monitoring is the reason we can sleep at night.",
    rating: 5,
    company: "CTO, BioPharma Labs",
  },
  {
    authorName: "Robert Hsu",
    text: "Their incident response time is unmatched. A potential breach was neutralized in minutes, not hours. The expertise and strategic planning turned a crisis into a non-event.",
    rating: 5,
    company: "Head of Infrastructure, FinTech Secure",
  },
  {
    authorName: "Maria Chavez",
    text: "We needed a Zero Trust Architecture implemented fast. They delivered with precision and deep technical mastery. Their team is a true partner in securing our remote workforce.",
    rating: 5,
    company: "VP of Digital Transformation, Global Logistics",
  },
  {
    authorName: "Alex Turner",
    text: "The clarity and direction I gained from their security audit were invaluable. They empowered our in-house team to be more aligned and productive in our defensive strategies.",
    rating: 4,
    company: "IT Security Manager, Mid-Market Retail",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 20,
    },
  },
};

interface TestimonialsSectionProps {
  themeSettings: Record<string, any> | undefined | null;
  testimonials: Testimonial[] | undefined | null;
  name: string | undefined | null;
}

export default function TestimonialsSectionSecurityLight({ themeSettings, testimonials, name }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext() || {};
  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const firmName = name || storeFormData?.name || 'CyberShield';

  const testimonialsData = Array.isArray(testimonials) && testimonials.length > 0
    ? testimonials.map((t) => ({
        authorName: t.authorName || 'Security Leader',
        text: t.quote || 'Exceptional security and reliability!',
        rating: typeof t.rating === 'number' ? Math.max(0, Math.min(5, t.rating)) : 5,
        company: (t as any).company || 'Security Director',
      }))
    : securityTestimonials.map(t => ({
        ...t,
        text: t.text.replace('[Company Name]', firmName).replace('[Your Company Name/Name]', firmName),
      }));

  return (
    <AnimatePresence>
      <section
        id="security-success"
        className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16 lg:gap-24 relative z-10">
          
          {/* CONTROL STICKY SIDEBAR AREA */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 text-left">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500">
                <AcademicCapIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                Validated Expertise
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
              Proven Security Case Success
            </h2>
            
            <p className="mt-6 text-xs text-gray-500 leading-relaxed max-w-sm">
              Verifiable integration documentation and deployment reviews from platform infrastructure leads who have completely hardened their defensive perimeter posture.
            </p>
          </div>

          {/* TELEMETRY CASE MATRIX GRID */}
          <motion.div
            className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {testimonialsData.slice(0, 6).map((t, idx) => (
              <motion.div
                key={idx}
                className="group relative flex flex-col items-start transition-all duration-300"
                variants={itemVariants}
              >
                {/* SYSTEM INTEGRITY OVERLAY DATA */}
                <div className="w-full flex items-center justify-between mb-4 pb-2 border-b border-gray-100 font-mono text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Log // 0{idx + 1}</span>
                  <span className="flex items-center gap-1">
                    Score: <span className="text-gray-900 font-bold">{t.rating}.0 / 5.0</span>
                  </span>
                </div>

                {/* TESTIMONIAL MAIN PROSE */}
                <p className="text-xs text-gray-600 leading-relaxed font-medium mb-5 transition-colors duration-200 group-hover:text-black">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* SIGNATURE INFRASTRUCTURE MATRIX */}
                <div className="mt-auto flex flex-col">
                  <span className="text-xs font-bold tracking-tight text-gray-900">
                    {t.authorName}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 mt-0.5">
                    {t.company}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
        </div>
      </section>
    </AnimatePresence>
  );
}