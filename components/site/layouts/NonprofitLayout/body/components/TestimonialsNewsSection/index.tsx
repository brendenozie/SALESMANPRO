"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// --- MOCK DATA & CONFIGURATION ---

const mockTestimonials = [
  {
    id: 'test-1',
    authorName: 'Alex Johnson',
    quote: "This organization truly changed the lives of many in my community. Their dedication is inspiring and their impact is undeniable!",
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    role: 'Community Volunteer',
    order: 1,
  },
  {
    id: 'test-2',
    authorName: 'Emily Carter',
    quote: "The support provided by this non-profit has been invaluable to countless families in desperate need. Their programs are well-managed and incredibly transparent.",
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    role: 'Beneficiary Parent',
    order: 2,
  },
  {
    id: 'test-3',
    authorName: 'David Lee',
    quote: "I've seen firsthand the positive change they bring. Every donation makes a real difference in the lives of children. Proud to be a dedicated supporter!",
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    role: 'Corporate Partner',
    order: 3,
  },
];

const mockStoreFormData = {
  slug: 'childrens-hope-foundation',
  testimonials: mockTestimonials,
  themeSettings: { primaryColor: '#FF5722', secondaryColor: '#FFFFFF' },
};

const useStoreContext = () => ({ storeFormData: mockStoreFormData });

// --- FRAMER MOTION VARIANTS ---

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
};

// --- TESTIMONIAL CARD COMPONENT ---

const TestimonialCard = ({ test }: { test: typeof mockTestimonials[0] }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="p-8 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between h-full hover:border-slate-300 transition-colors group shadow-sm"
    >
      {/* Quote Body */}
      <div className="mb-8">
        <p className="text-slate-700 text-base md:text-lg font-medium leading-relaxed tracking-tight">
          “{test.quote}”
        </p>
      </div>

      {/* Author Metadata Group */}
      <div className="flex items-center pt-5 border-t border-slate-100">
        <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 mr-3.5 border border-slate-200">
          <img
            src={test.avatarUrl}
            alt={test.authorName || 'Profile Identity'}
            className="object-cover w-full h-full filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`;
            }}
          />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm tracking-tight">{test.authorName}</h4>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{test.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION COMPONENT ---

export default function TestimonialsSection({storeFormData}: {storeFormData: any}) {
  // const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const organizationSlug = storeFormData?.slug || 'non-profit';
  const testimonialsToRender = storeFormData?.testimonials || mockTestimonials;

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-white border-b border-slate-200 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Asynchronous Layout Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-16 md:mb-20">
          <div className="lg:col-span-7 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-3">
              Proof of Trust
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Voices From The Field.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm text-slate-600 leading-relaxed">
              Authentic performance accounts and validation records generated directly by our ecosystem partners, field volunteers, and primary community beneficiaries.
            </p>
          </div>
        </div>

        {/* Testimonials Display Grid */}
        <div className="relative">
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {testimonialsToRender.slice(0, 3).map((test) => (
              <TestimonialCard key={test.id} test={test} />
            ))}
          </motion.div>
        </div>

        {/* Streamlined Call-to-Action Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="p-8 md:p-12 rounded-2xl bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-16 text-left"
        >
          <div className="max-w-xl">
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
              Inspired by their journey? Transform your intent into localized runtime support.
            </h3>
          </div>
          
          <button
            onClick={() => mockRouterPush(`/${organizationSlug}/donate`)}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-colors hover:bg-slate-100 flex-shrink-0 w-full md:w-auto justify-center shadow-sm"
          >
            <span>Join The Movement</span>
            <ArrowRightIcon className="w-3.5 h-3.5 text-slate-900" strokeWidth={2.5} />
          </button>
        </motion.div>

      </div>
    </section>
  );
}

function mockRouterPush(path: string) {
  console.log(`Navigating to: ${path}`);
}