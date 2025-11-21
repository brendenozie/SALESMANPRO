'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, StarIcon, SwatchIcon, TruckIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide, ICoreValue } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 0.8;
const autoAdvanceDelay = 5000;

export interface HeroSliderProps {
  coreValues: ICoreValue[] | null;
  themeSettings: any;
}

const defaultCoreValues: ICoreValue[] = [
  {
    title: 'White Glove Delivery',
    description: 'We assemble and place your items.',
    icon: 'TruckIcon',
  },
  {
    title: 'Sustainable Materials',
    description: 'FSC certified wood and organic fabrics.',
    icon: 'SwatchIcon'
  },
  {
    title: '5-Year Warranty',
    description: 'Quality guaranteed on all structural frames.',
    icon: 'StarIcon'
  }
];

export default function USPSlider({ coreValues , themeSettings }: HeroSliderProps) {
  const coreValuesToShow: ICoreValue[] = (coreValues && coreValues.length > 0 ? coreValues : defaultCoreValues);

  const defaultPrimaryColor = '#6B46C1';
  const defaultSecondaryColor = '#D53F8C';
  const primary = themeSettings?.primaryColor || defaultPrimaryColor;
  const secondary = themeSettings?.secondaryColor || defaultSecondaryColor;

  return (
    <section className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: TruckIcon, title: "White Glove Delivery", desc: "We assemble and place your items." },
          { icon: SwatchIcon, title: "Sustainable Materials", desc: "FSC certified wood and organic fabrics." },
          { icon: StarIcon, title: "5-Year Warranty", desc: "Quality guaranteed on all structural frames." }
        ].map((feature, i) => (
          <div key={i} className="flex gap-4 items-start group">
              <div className="p-4 bg-stone-50 rounded-full text-stone-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                <feature.icon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-stone-900 mb-2">{feature.title}</h4>
                <p className="text-stone-500 leading-relaxed">{feature.desc}</p>
              </div>
          </div>
        ))}
      </div>
    </section>
  );
}
