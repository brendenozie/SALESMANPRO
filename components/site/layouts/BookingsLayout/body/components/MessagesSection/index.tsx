'use client';

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Image loader for Next.js
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const features = [
  {
    title: "Swedish Massage for Ultimate Relaxation",
    description: "Experience soothing strokes that relieve tension and promote relaxation.",
    image: "/images/swedish.jpg",
    button: true,
  },
  {
    title: "Deep Tissue Massage for Pain Relief",
    description: "Target deep muscle layers to reduce chronic pain and stiffness.",
    image: "/images/deep-tissue.jpg",
  },
  {
    title: "Hot Stone Massage for Enhanced Comfort",
    description: "Warm stones placed on key points to relax muscles and improve circulation.",
    image: "/images/hot-stone.jpg",
  },
  {
    title: "Aromatherapy for a Sensory Experience",
    description: "Combine essential oils with massage techniques for a calming effect.",
    image: "/images/aromatherapy.jpg",
  },
];

export default function MassageFeatures() {
  return (
    <section className="relative bg-gray-950 py-24 overflow-hidden text-white">
      {/* Background gradient glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-black to-gray-950" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <motion.span
            className="inline-block bg-emerald-400/10 text-emerald-300 text-sm font-semibold px-4 py-1.5 rounded-full"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Services
          </motion.span>
          <motion.h2
            className="mt-6 text-4xl sm:text-5xl font-bold text-white tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Explore Our Signature Massage Experiences
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            From deep muscle relief to calming aromatherapy, our offerings cater to your every wellness need.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ title, description, image, button }, i) => (
            <motion.div
              key={i}
              className="relative rounded-3xl overflow-hidden backdrop-blur-md border border-white/10 bg-white/5 shadow-lg hover:shadow-xl transition-all flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              {/* Image */}
              <div className="relative w-full h-56 overflow-hidden">
                <Image
                  src={image}
                  loader={loader}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-300 flex-grow">{description}</p>
                {button && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-5 self-start bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full font-medium transition-all shadow-md"
                  >
                    Explore More →
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
