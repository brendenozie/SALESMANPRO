'use client';

import {
  CalendarIcon,
  ClipboardDocumentListIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: CalendarIcon,
    title: 'Schedule a Call',
    description:
      'Book a discovery session with our expert consultants to assess where you are and where you want to go.',
  },
  {
    icon: ClipboardDocumentListIcon,
    title: 'Pinpoint the Obstacles',
    description:
      'Identify roadblocks limiting your growth and collaboratively outline strategies to move forward.',
  },
  {
    icon: HandRaisedIcon,
    title: 'Grow Your Business',
    description:
      'With the right partner and mindset, achieve measurable results and sustainable success.',
  },
];

export default function GettingStartedSection() {
  return (
    <section className="relative bg-[#0d675c] text-white py-24 px-6 lg:px-16 overflow-hidden shadow-2xl">
      {/* Decorative Gradient Circle */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-teal-300/10 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl z-0" />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Getting Started is{' '}
          <span className="text-emerald-300">Simple & Seamless</span>
        </motion.h2>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center px-4"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className="bg-white/10 border border-white/10 p-4 rounded-full shadow-lg mb-6">
                <Icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{`Step ${index + 1}: ${title}`}</h3>
              <p className="text-sm text-white/80 max-w-xs">
                {description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="hidden md:flex justify-between items-center mt-16 px-4">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center w-full">
              {index !== 0 && (
                <div className="flex-1 h-1 border-t-2 border-dashed border-white/30" />
              )}
              <div className="w-4 h-4 bg-emerald-400 rounded-full shadow-md mx-2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
