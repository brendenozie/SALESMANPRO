"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Keeping these just in case, though not directly used here
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'; // Changed to a more suitable icon for testimonials
import { useStoreContext } from '@/contexts/StoreContext'; // Keeping this as it might be used elsewhere in the component

// Mocking the image loader since Next.js Image is not available (kept for context)
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Framer Motion variants for cards
const testimonialCardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export default function TestimonialsSection({
  testimonials,
}: {
  testimonials: Array<{ quote: string; author: string }>;
}) {
  return (
    <section className="relative bg-gray-950 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      {/* Decorative Background Elements - matching HowItWorksSection */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          What People Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Saying</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-lg text-gray-300 mb-20 max-w-2xl mx-auto"
        >
          Real stories from attendees and organizers who’ve used our platform to create memorable experiences.
        </motion.p>

        <div className="grid gap-10 md:grid-cols-2 text-left">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={testimonialCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 relative group p-8"
            >
              <ChatBubbleLeftRightIcon className="text-purple-400 w-10 h-10 mb-6 group-hover:text-pink-400 transition-colors duration-300" />
              <p className="text-gray-300 text-lg italic leading-relaxed mb-6">
                “{testimonial.quote}”
              </p>
              <footer className="font-semibold text-white text-right">
                — {testimonial.author}
              </footer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}