"use client";

import React from "react";
import { motion } from "framer-motion";
import { StarIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  title: string;
  image?: string;
  rating: number;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// 🌟 Sample Data (for when no props are passed)
const sampleTestimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "Brenden’s coaching helped me rediscover my confidence and align my personal goals with my career. I feel more in control and fulfilled than ever.",
    author: "Sarah W.",
    title: "Marketing Executive, Nairobi",
    image: "/images/testimonial1.jpg",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "After just three sessions, I gained the clarity and tools I needed to take action on my dreams. Highly recommended for anyone feeling stuck.",
    author: "James O.",
    title: "Entrepreneur, Mombasa",
    image: "/images/testimonial2.jpg",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "Brenden’s approach is powerful yet compassionate. He doesn’t just coach — he transforms your mindset and helps you see your true potential.",
    author: "Anita K.",
    title: "Life Coach, Kisumu",
    image: "/images/testimonial3.jpg",
    rating: 5,
  },
];

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const data = testimonials && testimonials.length > 0 ? testimonials : sampleTestimonials;

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-orange-600 via-red-500 to-pink-500">
      {/* Background Glow Overlay */}
      <div className="absolute inset-0 bg-[url('/textures/soft-waves.svg')] bg-cover bg-center opacity-10"></div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-extrabold text-white mb-6"
        >
          What Clients Are Saying
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto mb-16"
        >
          Real stories of transformation, growth, and empowerment from individuals who’ve worked with Brenden.
        </motion.p>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 text-gray-800 flex flex-col items-center text-center"
            >
              {/* Avatar */}
              <div className="relative w-24 h-24 mb-5">
                <Image decoding="async"
                  src={item.image || "/images/default-avatar.jpg"}
                  alt={item.author}
                  fill
                  className="rounded-full object-cover border-4 border-orange-200"
                />
              </div>

              {/* Rating */}
              <div className="flex mb-4 justify-center">
                {[...Array(item.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-6 w-6 text-yellow-400 drop-shadow-md" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg italic leading-relaxed text-gray-700 mb-6">
                “{item.quote}”
              </p>

              {/* Author */}
              <div>
                <p className="font-bold text-gray-900 text-lg">{item.author}</p>
                <p className="text-sm text-gray-500">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Link
            href="/reviews"
            className="inline-flex items-center px-10 py-5 bg-white text-orange-700 font-semibold text-lg rounded-full shadow-lg hover:bg-orange-50 hover:scale-105 transform transition-all duration-300"
          >
            Read More Testimonials
            <ArrowRightIcon className="ml-3 h-6 w-6" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
