"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { StoreForm, Testimonial } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";

// Framer Motion variants for cards
const testimonialCardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

// Two sample testimonials if none are provided
const fallbackTestimonials: Testimonial[] = [
  {
    id: "sample1",
    authorName: "Jane Doe",
    quote:
      "This platform made finding and booking events so effortless—I discovered amazing meetups I never knew existed!",
    // avatarUrl: null,
    rating: 5,
    order: 1,
  },
  {
    id: "sample2",
    authorName: "John Smith",
    quote:
      "As an organizer, the dashboard tools are intuitive and powerful. Our last event sold out in record time!",
    // avatarUrl: null,
    rating: 4,
    order: 2,
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  
  // Pull testimonials from store, sorted by order
  const raw = (testimonials ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const testimonialsToShow =
    raw.length > 0 ? raw : fallbackTestimonials;

  return (
    <section className="relative bg-gray-950 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          What People Are{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Saying
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-lg text-gray-300 mb-20 max-w-2xl mx-auto"
        >
          Real stories from attendees and organizers who’ve used our platform
          to create memorable experiences.
        </motion.p>

        <div className="grid gap-10 md:grid-cols-2 text-left">
          {testimonialsToShow.map((t, index) => (
            <motion.div
              key={t.id ?? index}
              variants={testimonialCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 relative group p-8"
            >
              <ChatBubbleLeftRightIcon className="text-purple-400 w-10 h-10 mb-6 group-hover:text-pink-400 transition-colors duration-300" />
              <p className="text-gray-300 text-lg italic leading-relaxed mb-6">
                “{t.quote}”
              </p>
              <footer className="font-semibold text-white text-right">
                — {t.authorName}
              </footer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
