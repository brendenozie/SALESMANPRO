'use client';

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  SparklesIcon,
  PuzzlePieceIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { IPromotion } from "@/types/typings";
import { EditableElement } from "@/contexts/EditableContentContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 85}`;

const resolveIcon = (iconName?: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    SparklesIcon,
    PuzzlePieceIcon,
    CheckCircleIcon,
    RocketLaunchIcon,
    ChartBarIcon
  };
  return icons[iconName || ''] || SparklesIcon;
};

const defaultPerks = [
  { 
    id: "1", 
    title: "Premium Quality", 
    icon: 'SparklesIcon', 
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    description: "Every single pixel and interaction matters. We enforce uncompromising standards to ensure your digital experience resonates with absolute clarity." 
  },
  { 
    id: "2", 
    title: "Strategic Roadmap", 
    icon: 'PuzzlePieceIcon', 
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    description: "We do not rely on guesswork; we engineer. Your unique operations require a custom structural blueprint designed for measurable scale." 
  },
  { 
    id: "3", 
    title: "Reliable Execution", 
    icon: 'CheckCircleIcon', 
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    description: "Time is your most critical competitive advantage. We respect it by executing flawlessly on deadlines and project scope, every single time." 
  },
  { 
    id: "4", 
    title: "Continuous Innovation", 
    icon: 'RocketLaunchIcon', 
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    description: "Stagnation is market failure. We deploy iterative development cycles to keep your operational systems far ahead of the competition." 
  },
];

interface ExcellenceSectionProps {
  slug: string;
  themeSettings?: {
    primaryColor?: string;
  };
  promotions?: IPromotion[];
}

export default function ExcellenceHorizonLight({ slug, themeSettings, promotions }: ExcellenceSectionProps) {
  const [activeId, setActiveId] = useState<string>("1"); 
  const promotion = promotions && promotions.length > 0 ? promotions[0] : null;
  const primaryColor = themeSettings?.primaryColor || "#6366f1"; 

  const perks = promotion?.perks?.length && promotion?.perks.length > 0
    ? promotion.perks.map((p, i) => ({
        id: p.id || String(i + 1),
        title: p.label,
        icon: p.icon || defaultPerks[i]?.icon, 
        description: defaultPerks[i]?.description || "",
        image: defaultPerks[i]?.image || ""
      }))
    : defaultPerks;

  return (
    <section className="relative py-24 lg:py-32 bg-slate-50 text-slate-900 overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 w-full">
        
        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <EditableElement
              targetId="services.home.excellenceSection.ExcellenceSection.main.badgeText"
              componentKey="ExcellenceSection"
              elementKey="badgeText"
              label="Badge Text"
              defaultValue="Core Framework"
              inline
            >
              {(val) => (
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-3">
                  {val}
                </span>
              )}
            </EditableElement>

            <EditableElement
              targetId="services.home.excellenceSection.ExcellenceSection.main.title"
              componentKey="ExcellenceSection"
              elementKey="title"
              label="Section Title"
              defaultValue={promotion?.title || "The Pillars of Excellence"}
            >
              {(val) => (
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
                  {val}
                </h2>
              )}
            </EditableElement>
          </motion.div>
          
          <EditableElement
            targetId="services.home.excellenceSection.ExcellenceSection.main.description"
            componentKey="ExcellenceSection"
            elementKey="description"
            label="Section Narrative"
            defaultValue={promotion?.description || "True quality does not shout; it is engineered directly into execution. Here is how we uphold our elite operational standards."}
          >
            {(val) => (
              <motion.p 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-slate-600 text-base md:text-lg max-w-md font-medium leading-relaxed"
              >
                {val}
              </motion.p>
            )}
          </EditableElement>
        </div>

        {/* --- ACCORDION SYSTEM --- */}
        <div className="w-full flex flex-col md:flex-row gap-4 h-auto md:h-[540px] items-stretch">
          {perks.map((perk, index) => {
            const Icon = resolveIcon(perk.icon);
            const isActive = activeId === perk.id;
            const formattedIndex = String(index + 1).padStart(2, '0');
            const showDiagram = isActive && (perk.title.toLowerCase().includes('innovation') || perk.title.toLowerCase().includes('process'));

            return (
              <motion.div
                key={perk.id}
                layout
                onClick={() => setActiveId(perk.id)}
                onMouseEnter={() => setActiveId(perk.id)}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isActive 
                    ? 'flex-[3.5] bg-white border-slate-300 shadow-md p-8 md:p-10' 
                    : 'flex-[0.6] bg-slate-100/80 hover:bg-slate-200/50 border-slate-200/80 p-6 md:p-8 justify-center items-center cursor-pointer'
                }`}
              >
                {/* --- COLLAPSED VIEW LAYOUT --- */}
                {!isActive && (
                  <div className="flex md:flex-col items-center justify-between w-full h-full md:py-2">
                    <span className="text-sm font-bold tracking-wider text-slate-400">
                      {formattedIndex}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    {/* Reliable Vertical Typography Alignment */}
                    <span 
                      className="hidden md:block text-xs font-black uppercase tracking-widest text-slate-600 whitespace-nowrap selection:bg-transparent"
                      style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                    >
                      {perk.title}
                    </span>
                    <span className="block md:hidden text-sm font-bold text-slate-700 ml-4 flex-1 text-left">
                      {perk.title}
                    </span>
                  </div>
                )}

                {/* --- EXPANDED ACTIVE VIEW LAYOUT --- */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full h-full"
                    >
                      {/* Left Column: Typography Strategy */}
                      <div className="lg:col-span-6 flex flex-col justify-between h-full py-2">
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <span className="text-xs font-black tracking-widest px-2.5 py-1 rounded bg-slate-900 text-white">
                              {formattedIndex}
                            </span>
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center border"
                              style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}10` }}
                            >
                              <Icon className="w-4 h-4" style={{ color: primaryColor }} />
                            </div>
                          </div>
                          
                          <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                            {perk.title}
                          </h3>
                          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-medium">
                            {perk.description}
                          </p>
                        </div>

                        {/* Visualization Sub-component if flagged */}
                        {showDiagram && (
                          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-slate-400">
                              <ChartBarIcon className="w-4 h-4" />
                            </div>
                            <div className="text-xs">
                              <p className="font-bold text-slate-700">Analytical Workflow Active</p>
                              <p className="text-slate-400">Cyclical quality auditing layer applied</p>
                            </div>
                          </div>
                        )}

                        <div>
                          <Link 
                            href={promotion?.ctaLink || `#contact`}
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest group border-b-2 pb-1 transition-all duration-200"
                            style={{ borderBottomColor: primaryColor, color: '#0F172A' }}
                          >
                            Explore Parameters
                            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>

                      {/* Right Column: Premium Framed Media */}
                      <div className="hidden lg:block lg:col-span-6 relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                        <Image decoding="async" 
                          src={perk.image || defaultPerks[0].image}
                          alt={perk.title}
                          fill
                          sizes="(max-w-1024px) 100vw, 50vw"
                          priority
                          className="object-cover object-center grayscale contrast-[1.05] hover:grayscale-0 transition-all duration-700 ease-out"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}