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
  GlobeAltIcon
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
      description: 'Free city-wide shipping for all treats and toys.',
      size: 'large', 
    },
    {
      icon: HeartIcon,
      title: 'Pet First',
      description: 'Tested by our furry CEO.',
      size: 'small',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Paw-ments',
      description: '100% encrypted checkout.',
      size: 'small',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: '24/7 Pet Experts',
      description: 'Real humans (and pet lovers) ready to help you anytime.',
      size: 'large',
    },
  ];

  return (
    <section className="relative bg-[#FDFCFB] py-24 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-slate-900 tracking-tight mb-4"
          >
            Why Pet Owners <span style={{ color: primaryColor }}>Trust Us</span>
          </motion.h2>
          <p className="text-slate-500 font-medium">Providing more than just supplies—we provide peace of mind.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === 'large';

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -8 }}
                className={`
                  relative group p-8 rounded-[2.5rem] transition-all duration-500
                  ${isLarge ? 'md:col-span-2' : 'md:col-span-1'}
                  bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]
                  hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]
                `}
              >
                {/* Floating Decorative Elements */}
                <div 
                  className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ color: primaryColor }}
                >
                  <SparklesIcon className="w-6 h-6 animate-pulse" />
                </div>

                <div className="flex flex-col h-full">
                  {/* Icon Wrapper */}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    <Icon
                      className="h-8 w-8 transition-transform duration-500 group-hover:scale-110"
                      style={{ color: primaryColor }}
                    />
                  </motion.div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
                      {feature.title}
                      {isLarge && (
                        <span 
                          className="text-[10px] py-1 px-2 rounded-lg uppercase tracking-tighter"
                          style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
                        >
                          Popular
                        </span>
                      )}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Subtle Bottom Glow */}
                <div 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Brand Watermark Overlay */}
      <div className="absolute -bottom-10 -left-10 text-9xl font-black text-slate-50 opacity-[0.02] pointer-events-none select-none">
        QUALITY
      </div>
    </section>
  );
}