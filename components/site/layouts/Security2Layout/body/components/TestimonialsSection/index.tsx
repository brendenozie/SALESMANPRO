'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Testimonial } from '@/types/typings';

const securityTestimonials: any[] = [
  {
    authorName: "Dr. Evelyn Reed",
    text: "“Since partnering with CyberShield, we've achieved 100% regulatory compliance and zero significant incidents. Their continuous threat monitoring is the reason we can sleep at night. Truly the best in cyber defense!”",
    rating: 5,
    company: "CTO, BioPharma Labs",
  },
  {
    authorName: "Robert Hsu",
    text: "“Their incident response time is unmatched. A potential breach was neutralized in minutes, not hours. The expertise and strategic planning provided by [Company Name] turned a crisis into a non-event.”",
    rating: 5,
    company: "Head of Infrastructure, FinTech Secure",
  },
  {
    authorName: "Maria Chavez",
    text: "“We needed a Zero Trust Architecture implemented fast. [Company Name] delivered with precision and deep technical mastery. Their team is a true partner in securing our remote workforce.”",
    rating: 5,
    company: "VP of Digital Transformation, Global Logistics",
  },
  {
    authorName: "Alex Turner",
    text: "“The clarity and direction I gained from their security audit were invaluable. They empowered our in-house team to be more aligned and productive in our defensive strategies.”",
    rating: 4,
    company: "IT Security Manager, Mid-Market Retail",
  },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

interface TestimonialsSectionProps {
  themeSettings: Record<string, any> | undefined | null;
  testimonials: Testimonial[] | undefined | null;
  name: string | undefined | null;
}

export default function TestimonialsSectionSecurityLight({ themeSettings, testimonials, name }: TestimonialsSectionProps) {

  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const firmName = name || 'CyberShield';

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
    <section id="security-success" className="relative py-28 md:py-36 bg-white text-gray-900 overflow-hidden border-b border-gray-100">
      
      {/* STRUCTURAL BACKGROUND TELEMETRY MESHGRID */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-r border-gray-900 h-full" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* HEADER SECTION BLOCK */}
        <div className="mb-20 text-left">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
              LOGS // CASE_STUDIES
            </p>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1] mb-6">
            PROVEN SECURITY SUCCESS STORIES
          </h2>

          <p className="text-xs font-mono text-gray-500 leading-relaxed uppercase max-w-2xl">
            Direct diagnostic verification from enterprise operators who have fortified their systems and sustained optimized infrastructure performance.
          </p>
        </div>

        {/* FLAT TELEMETRY GRID MODULE */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {testimonialsData.slice(0, 6).map((t, index) => {
            const hexIndex = `0${index + 1}`.slice(-2);
            return (
              <div
                key={index}
                className="bg-white p-6 md:p-8 flex flex-col justify-between min-h-[340px] transition-colors duration-200 hover:bg-gray-50/60"
              >
                {/* CARD TOP BAR ANCHORS */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6 text-[9px] font-mono font-bold text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <ChatBubbleLeftRightIcon className="w-3 h-3 text-gray-300" />
                    [REC_ID_{hexIndex}]
                  </span>
                  <span style={{ color: primaryColor }}>
                    VAL_STATUS // 100_PASS
                  </span>
                </div>

                {/* TESTIMONIAL MAIN DISPATCH */}
                <div className="flex-grow mb-8">
                  <p className="text-xs font-mono text-gray-600 leading-relaxed uppercase">
                    {t.text}
                  </p>
                </div>

                {/* STRUCTURAL OPERATOR DETAILS */}
                <div className="border-t border-gray-100 pt-6 flex flex-col space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-black tracking-tight uppercase text-gray-900">
                      {t.authorName}
                    </p>
                    <span className="text-[9px] font-mono text-gray-300 font-bold">
                      INT_SIG_{t.rating}.0
                    </span>
                  </div>
                  
                  <p className="text-[10px] font-mono uppercase tracking-tight text-gray-400">
                    {t.company}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
        
        {/* LOWER GRID COUNTER DIAGNOSTIC BAR */}
        <div className="mt-4 flex items-center justify-between px-1 text-[9px] font-mono text-gray-400 font-bold uppercase tracking-wider">
          <span>[SYSTEM_VERIFIED_COUNT // {testimonialsData.length}]</span>
          <span>REF_STREAM_SYS_A</span>
        </div>

      </div>
    </section>
  );
}