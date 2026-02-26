'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function ProductShowcaseSection() {
  // Pulling from your theme settings logic
  const primaryColor = '#F3A852'; 
  const accentLight = '#C5F1F7'; // The light blue background from the image

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE: Product Jar + Color Block */}
          <div className="relative flex items-center justify-center h-[500px] md:h-[600px]">
            {/* The Light Blue Background Block */}
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="absolute inset-0 right-10 md:right-20 rounded-r-3xl z-0 origin-left"
              style={{ backgroundColor: accentLight }}
            />

            {/* Product Jar */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative z-10 w-full h-full flex justify-center py-10"
            >
              <Image
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" // Replace with your actual product image path
                alt="Crunchy Peanut Butter Jar"
                width={400}
                height={550}
                className="object-contain drop-shadow-2xl"
                priority
                loader={loader}
              />
            </motion.div>
          </div>

          {/* RIGHT SIDE: Floating Spoon + Info Card */}
          <div className="relative space-y-8">
            
            {/* Floating Spoon with Peanut Butter */}
            <motion.div
              initial={{ opacity: 0, y: -30, rotate: 5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="absolute -top-24 right-10 md:right-20 z-20"
            >
              <Image
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" // Replace with your spoon image path
                alt="Peanut Butter on Spoon"
                width={250}
                height={150}
                className="object-contain"
                loader={loader}
              />
            </motion.div>

            {/* Product Info Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white border-2 p-8 md:p-12 rounded-sm shadow-sm relative z-10 max-w-lg"
              style={{ borderColor: accentLight }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                Crunchy<br />Peanut Butter
              </h2>
              
              <p className="mt-6 text-gray-600 leading-relaxed font-medium">
                Our Peanut Butter only contains the best tasting American grown peanuts 
                to pack the biggest punch of peanut flavor.
              </p>

              <div className="mt-8 flex flex-col gap-4">
                <span className="text-2xl font-black text-gray-900">$3.99</span>
                
                <Link
                  href="/cart"
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-white font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg uppercase tracking-wider text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  Add to Cart
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}