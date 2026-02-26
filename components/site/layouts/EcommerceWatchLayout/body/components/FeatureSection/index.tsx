'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function FeatureSection() {
  // Data derived from reference image
  const sectionData = {
    title: "A Watch As Unique As You",
    description: "With more than 10 years experience in the field, Withings invents, designs, and new entry manufactures a range of award-winning.",
    subDescription: "Come clinically validated smart health devices and associated apps. Withings provides an the comfort of home, and can help anyone master long term health goals.",
    ctaText: "Shop Now",
    ctaLink: "/ecommerce/products",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", // Placeholder matching the watch style
  };

  return (
    <section className="bg-white py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* IMAGE PANEL - Left Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 relative aspect-[4/5] sm:aspect-square overflow-hidden"
          >
            <Image
              src={sectionData.imageUrl}
              alt="Lifestyle product shot"
              fill
              className="object-cover"
              loader={loader}
            />
          </motion.div>

          {/* CONTENT PANEL - Right Side */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight mb-8"
            >
              {sectionData.title}
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6 text-gray-700 text-lg leading-relaxed max-w-lg mb-12"
            >
              <p>
                {sectionData.description}
              </p>
              <p>
                {sectionData.subDescription}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href={sectionData.ctaLink}
                className="inline-block bg-[#bc9c64] hover:bg-[#a88a55] text-white font-bold uppercase tracking-widest px-10 py-4 transition-colors duration-300"
              >
                {sectionData.ctaText}
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}