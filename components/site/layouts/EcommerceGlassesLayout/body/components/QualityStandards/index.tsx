'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function QualityStandards() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Top Row: Story & Image */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="relative h-80 w-full overflow-hidden rounded-sm">
              <Image 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" 
                alt="Our Sourcing" 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                loader={({ src }) => src} // Use default loader for local images
              />
            </div>
            <div className="max-w-md">
              <h2 className="text-3xl font-black text-gray-900 uppercase">Sustainable Sourcing</h2>
              <p className="text-gray-600 mt-4 leading-relaxed">
                We are committed to delivering tailored solutions that align with your specific goals and tastes. 
                Our collaborative approach ensures that our peanut butter is crafted with local knowledge.
              </p>
              <button className="mt-6 border-b-2 border-black pb-1 font-bold text-xs uppercase tracking-tighter hover:opacity-50 transition-opacity">
                Read More
              </button>
            </div>
          </div>

          {/* Bottom Row: Image & Standards */}
          <div className="order-1 lg:order-2 space-y-8 lg:translate-y-20">
            <div className="max-w-md ml-auto text-right">
              <h2 className="text-3xl font-black text-gray-900 uppercase">Quality Standards</h2>
              <p className="text-gray-600 mt-4 leading-relaxed">
                Every jar undergoes rigorous testing to ensure it meets our "100% Peanuts" promise. 
                No additives, no palm oil, just pure excellence.
              </p>
              <button className="mt-6 border-b-2 border-black pb-1 font-bold text-xs uppercase tracking-tighter hover:opacity-50 transition-opacity">
                Our Process
              </button>
            </div>
            <div className="relative h-96 w-full overflow-hidden rounded-sm bg-gray-50 p-12">
               <Image 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" 
                alt="Product Lineup" 
                fill 
                className="object-contain p-8"
                loader={({ src }) => src} // Use default loader for local images
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}