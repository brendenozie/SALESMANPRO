'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon } from '@heroicons/react/24/solid';
import { EditableElement } from '@/contexts/EditableContentContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, skewX: -5 },
  visible: { 
    opacity: 1, 
    y: 0, 
    skewX: 0,
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const accent = '#FF003C'; // Empire Red

  // Gaming-themed fallback data
  const defaultAwards = [
    { iconUrl: 'https://images.unsplash.com/photo-1542838686-37a5027588b3', name: 'Digital Innovator 2026' },
    { iconUrl: 'https://images.unsplash.com/photo-1629910419355-6b2257321598', name: 'E-commerce Excellence' },
    { iconUrl: 'https://images.unsplash.com/photo-1579201529431-a4773221b033', name: 'Elite Choice Award' },
    { iconUrl: 'https://images.unsplash.com/photo-1563729571343-98282367c00e', name: 'Industry Vanguard' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-24 bg-zinc-950 overflow-hidden">
      {/* Background HUD Graphics */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px] bg-red-600" />
              <EditableElement
                targetId="home.awards.badgeText"
                label="Badge Text"
                inline
                className="font-mono text-xs tracking-[0.5em] text-red-500 uppercase font-black"
              >
                <span>Achievements_Unlocked</span>
              </EditableElement>
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none">
              <EditableElement
                targetId="home.awards.title"
                label="Section Title"
                inline
              >
                <span>RECOGNIZED FOR <span className="text-red-600">DOMINANCE</span></span>
              </EditableElement>
            </h2>
          </div>
          <p className="text-zinc-500 font-mono text-[10px] uppercase max-w-[200px] text-right hidden md:block">
            <EditableElement
              targetId="home.awards.panelText"
              label="Verification Panel Text"
              inline
            >
              <span>Verified by global industry leaders // High performance standards met.</span>
            </EditableElement>
          </p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? '';
            const label = award?.name;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative bg-zinc-900/50 border border-white/5 hover:border-red-600/50 transition-all duration-500 p-8 flex flex-col items-center justify-center min-h-[220px] overflow-hidden"
              >
                {/* Tactical Card Decorations */}
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-600/20" />
                <div className="absolute bottom-2 left-2 font-mono text-[8px] text-white/5 tracking-widest">
                  SECTOR_{idx + 101}
                </div>

                {/* Main Content */}
                <div className="relative z-10 w-full h-full flex flex-col items-center">
                  <div className="relative w-20 h-20 mb-6">
                    {src ? (
                      <EditableElement
                        targetId={`home.awards.awards.${idx}.imageUrl`}
                        label={`Award #${idx + 1} Image`}
                        type="image"
                        className="w-full h-full block relative"
                      >
                        <Image decoding="async"
                          src={src}
                          alt={label}
                          fill
                          className="object-contain grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                        />
                      </EditableElement>
                    ) : (
                      <TrophyIcon className="w-full h-full text-zinc-800 group-hover:text-red-600 transition-colors" />
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-sm font-black italic text-zinc-400 group-hover:text-white uppercase tracking-widest transition-colors leading-tight">
                      <EditableElement
                        targetId={`home.awards.awards.${idx}.name`}
                        label={`Award #${idx + 1} Name`}
                        inline
                      >
                        <span>{label}</span>
                      </EditableElement>
                    </h3>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5 group-hover:bg-red-600 transition-all duration-500" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Ticker/Status Line */}
        <div className="mt-12 flex items-center justify-center gap-4 py-4 border-y border-white/5">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-red-600" />)}
          </div>
          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.3em]">
            <EditableElement
              targetId="home.awards.tickerText"
              label="Ticker Text"
              inline
            >
              <span>Elite Tier Certification Active</span>
            </EditableElement>
          </span>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-red-600" />)}
          </div>
      </div>
    </section>
  );
}