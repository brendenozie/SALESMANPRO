'use client';

import React from 'react';
import { motion } from 'framer-motion';
// Using Hero Icons as per saved preference
import {
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  FaceSmileIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

interface Props {
  primaryColor?: string;
  secondaryColor?: string;
}

export default function StoreFeatures({
  primaryColor = '#0EA5E9',
  secondaryColor = '#F43F5E',
}: Props) {
  
  const features = [
    {
      icon: TruckIcon,
      title: 'Lightning Delivery',
      description: 'Free city-wide shipping so your pet never has to wait for their favorite treats.',
      grid: 'md:col-span-2 md:row-span-1',
      bg: 'bg-blue-50/50',
      tag: 'Fast & Free',
    },
    {
      icon: HeartIcon,
      title: 'Pet First',
      description: 'Tested by our furry CEO and a team of picky testers.',
      grid: 'md:col-span-1 md:row-span-1',
      bg: 'bg-rose-50/50',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Paw-ments',
      description: '100% encrypted & pet-parent approved security.',
      grid: 'md:col-span-1 md:row-span-1',
      bg: 'bg-emerald-50/50',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: '24/7 Expert Advice',
      description: 'Real humans (and pet lovers) ready to help you choose the perfect fit for your companion.',
      grid: 'md:col-span-2 md:row-span-1',
      bg: 'bg-amber-50/50',
      tag: 'Always Here',
    },
    {
      icon: GiftIcon,
      title: 'Loyalty Treats',
      description: 'Earn points with every purchase for future surprises.',
      grid: 'md:col-span-2 md:row-span-1',
      bg: 'bg-purple-50/50',
    },
  ];

  return (
    <section className="relative bg-white py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header: Centered & Welcoming */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="h-px w-8 bg-slate-300" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Our Promise to You</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-slate-900 leading-tight"
            >
              Giving your pet the <br />
              <span className="italic font-serif font-light" style={{ color: primaryColor }}>best life possible.</span>
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-slate-500 font-medium max-w-xs text-left md:text-right"
          >
            We don&apos;t just sell products; we curate experiences that strengthen the bond between you and your best friend.
          </motion.p>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[240px]">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`group relative p-8 rounded-[2.5rem] overflow-hidden border border-slate-100 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 ${feature.grid} ${feature.bg}`}
              >
                {/* Decorative Pattern Background */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                   <FaceSmileIcon className="w-32 h-32" />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm"
                        style={{ color: primaryColor }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      {feature.tag && (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-slate-600 border border-white">
                          {feature.tag}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-[280px]">
                    {feature.description}
                  </p>
                </div>

                {/* Corner Sparkle */}
                <div className="absolute top-4 right-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SparklesIcon className="w-5 h-5 animate-pulse" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Subtle Floating Pet Icons in Background */}
      <div className="absolute top-20 right-10 opacity-[0.03] rotate-12 pointer-events-none">
        <HeartIcon className="w-64 h-64" />
      </div>
    </section>
  );
}