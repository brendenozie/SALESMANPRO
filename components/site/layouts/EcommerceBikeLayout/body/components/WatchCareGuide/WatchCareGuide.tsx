'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  WrenchIcon, 
  SunIcon, 
  BoltIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface CareGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const careSteps = [
  {
    title: 'Manual Winding',
    description: 'For mechanical movements, wind the crown clockwise until you feel slight resistance. Do not force it.',
    Icon: WrenchIcon,
  },
  {
    title: 'Water Resistance',
    description: 'Ensure the crown is fully pushed in or screwed down before any contact with water. Rinse after salt exposure.',
    Icon: SparklesIcon,
  },
  {
    title: 'Magnetic Fields',
    description: 'Avoid placing your timepiece near speakers, refrigerators, or magnets, which can affect the hairspring.',
    Icon: BoltIcon,
  },
  {
    title: 'Extreme Heat',
    description: 'Avoid prolonged exposure to direct sunlight or temperatures above 60°C to protect the lubricants.',
    Icon: SunIcon,
  },
];

export default function WatchCareGuide({ isOpen, onClose }: CareGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950">
              <div>
                <span className="text-[10px] font-bold tracking-[0.4em] text-amber-600 uppercase block mb-1">
                  Owner's Manual
                </span>
                <h2 className="text-2xl font-serif text-white italic">Care & Maintenance</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-zinc-500" />
              </button>
            </div>

            {/* Content Grid */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0a0a0a]">
              {careSteps.map((step, idx) => (
                <div key={idx} className="space-y-3 group">
                  <div className="flex items-center gap-3">
                    <step.Icon className="w-5 h-5 text-amber-600 stroke-[1.5]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-amber-500 transition-colors">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-500 font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Visual Aid */}
            <div className="px-8 pb-8">
              <div className="bg-zinc-950 border border-white/5 p-6 rounded-sm flex flex-col items-center">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4">Internal Caliber Schematic</p>
                
                    {/* 
                    [Image of a mechanical watch movement diagram] */}
                    <Image
                      src="https://images.unsplash.com/photo-1585123334904-845d60e97b29" 
                      loader={({ src }) => src}
                      alt="Mechanical Watch Movement Diagram"
                      width={400}
                      height={300}
                      className="w-full h-auto rounded-sm border border-white/10"
                    />
                                    

                <p className="mt-4 text-[11px] italic text-zinc-500 text-center">
                  Recommended professional servicing every 3 to 5 years.
                </p>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 bg-zinc-950 border-t border-white/5 flex justify-center">
              <button 
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-colors"
              >
                Return to Gallery
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}