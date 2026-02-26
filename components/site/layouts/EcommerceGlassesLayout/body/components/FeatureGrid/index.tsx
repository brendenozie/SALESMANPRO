'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  LifebuoyIcon, 
  ArrowPathIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline'; // Using Hero Icons as requested

const features = [
  {
    title: 'Free Delivery',
    desc: 'We provide free shipping on all orders over $30 within the continental US.',
    icon: TruckIcon,
  },
  {
    title: 'Gourmet Quality',
    desc: 'Crafted in small batches to ensure the richest flavor and perfect texture.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Helpdesk Center',
    desc: 'Our dedicated support team is here to help with any peanut butter queries.',
    icon: LifebuoyIcon,
  },
  {
    title: '100% Satisfaction',
    desc: 'Not the best you’ve ever had? We offer a full refund on your first jar.',
    icon: ArrowPathIcon,
  },
];

export default function FeatureGrid() {
  const primaryColor = '#F3A852';
  const darkBg = '#004743'; // Dark teal from eyewear design

  return (
    <section className="flex flex-col md:flex-row min-h-[600px]">
      {/* Left Image Side */}
      <div className="w-full md:w-5/12 relative bg-[#E29A5B] flex items-center justify-center p-12">
        <motion.div 
          initial={{ rotate: -10, opacity: 0 }}
          whileInView={{ rotate: 0, opacity: 1 }}
          className="relative w-full max-w-sm aspect-square"
        >
          <Image
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" 
            alt="Peanut Butter Jar Perspective"
            fill
            className="object-contain drop-shadow-2xl"
            loader={({ src }) => src} // Use default loader for local images
          />
        </motion.div>
      </div>

      {/* Right Content Side */}
      <div className="w-full md:w-7/12 p-12 md:p-24 flex flex-col justify-center" style={{ backgroundColor: darkBg }}>
        <div className="text-center md:text-left mb-12">
          <h2 className="text-white text-4xl font-black uppercase tracking-tight">Our Gourmet Service</h2>
          <p className="text-gray-300 mt-2">The highest standards from farm to jar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
          {features.map((f, i) => (
            <div key={i} className="space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-400/20">
                <f.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-xl">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        
        <button className="mt-16 self-start px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors">
          See All Services
        </button>
      </div>
    </section>
  );
}