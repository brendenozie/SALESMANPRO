'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  PhoneIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { useEditableContent, EditableElement } from '@/contexts/EditableContentContext';

const dummyPromotionData = {
  title: 'Engineered for the Modern Athlete',
  subtitle: 'The Ultimate Comfort & Style',
  description:
    'Experience a breakthrough in footwear technology. Our shoes are designed to provide unparalleled kinetic support and cloud-like cushioning, ensuring you stay peak-performance all day long. Whether you’re hitting the track or the terminal, move with absolute confidence.',
  bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', 
  ctaText: 'Shop the Collection',
  ctaLink: '/ecommerceshoes/products',
  featureImage1: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=400&q=80',
  featureImage2: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80',
  perks: [
    { icon: TruckIcon, text: 'Fast Global Shipping', detail: 'Priority dispatch network' },
    { icon: ShieldCheckIcon, text: 'Authenticity Guarantee', detail: '100% verified silhouettes' },
    { icon: PhoneIcon, text: '24/7 Priority Concierge', detail: 'Direct specialist pipeline' },
  ],
};

interface ShoePromotionAdProps {
  promotions?: any;
  themeSettings?: any;
}

const contentVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 60, damping: 15 } }
};

export default function ShoePromotionAd({ promotions, themeSettings }: ShoePromotionAdProps) {
  const { buildUrl } = useEditableContent();
  const promotion = promotions?.length >= 2 ? promotions[1] : null;
  const adData = promotion || dummyPromotionData;

  const primary = themeSettings?.primaryColor || '#18181b';

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 border-b border-zinc-200/40 dark:border-zinc-900/40">
      
      {/* High-Tech Background Structural Telemetry Grid */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-40 dark:opacity-20">
        <div className="absolute top-12 right-12 w-96 h-96 bg-zinc-200/50 dark:bg-zinc-800/30 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-zinc-300/40 dark:bg-zinc-900/20 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* --- LEFT BLOCK: Asymmetric Multi-Layer Showcase Visual Deck --- */}
        <div className="lg:col-span-5 relative w-full flex items-center justify-center lg:justify-start">
          <div className="relative w-full max-w-[420px] sm:max-w-[450px] aspect-[4/5]">
            
            {/* Background Structural Vault Plate */}
            <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_24px_48px_-15px_rgba(0,0,0,0.03)] border border-zinc-100 dark:border-zinc-800" />
            
            {/* Overlapping Feature Layer 1 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 50, damping: 12, delay: 0.1 }}
              className="absolute -top-6 -left-6 w-36 h-36 rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-900 shadow-2xl hidden sm:block z-20"
            >
              <EditableElement
                targetId="home.sleep-tape-ad.featureImage1"
                componentKey="SleepTapeAd"
                elementKey="featureImage1"
                label="Thumbnail Image 1"
                type="image"
                defaultValue={adData.featureImage1}
                className="w-full h-full"
              >
                {(val) => (
                  <img 
                    src={val || adData.featureImage1} 
                    alt="Architecture Close-up" 
                    className="w-full h-full object-cover"
                  />
                )}
              </EditableElement>
            </motion.div>

            {/* Overlapping Feature Layer 2 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 12 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 8 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 50, damping: 12, delay: 0.2 }}
              className="absolute -bottom-6 -right-6 w-40 h-40 rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-900 shadow-2xl hidden sm:block z-20"
            >
              <EditableElement
                targetId="home.sleep-tape-ad.featureImage2"
                componentKey="SleepTapeAd"
                elementKey="featureImage2"
                label="Thumbnail Image 2"
                type="image"
                defaultValue={adData.featureImage2}
                className="w-full h-full"
              >
                {(val) => (
                  <img 
                    src={val || adData.featureImage2} 
                    alt="Heel Configuration Cushioning" 
                    className="w-full h-full object-cover"
                  />
                )}
              </EditableElement>
            </motion.div>

            {/* Primary Hero Display Plate Container */}
            <div className="absolute inset-4 rounded-[2rem] bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex items-center justify-center p-4 border border-zinc-100 dark:border-zinc-900">
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -15 }}
                whileInView={{ opacity: 1, y: 0, rotate: -10 }}
                viewport={{ once: true }}
                whileHover={{ rotate: -2, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="relative w-full h-full cursor-grab active:cursor-grabbing"
              >
                <EditableElement
                  targetId="home.sleep-tape-ad.bannerUrl"
                  componentKey="SleepTapeAd"
                  elementKey="bannerUrl"
                  label="Hero Product Image"
                  type="image"
                  defaultValue={adData.bannerUrl}
                  className="w-full h-full"
                >
                  {(val) => (
                    <img
                      src={val || adData.bannerUrl}
                      alt="Hero Campaign Silhouette"
                      className="w-full h-full object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_25px_30px_rgba(255,255,255,0.02)]"
                    />
                  )}
                </EditableElement>
              </motion.div>
            </div>

            {/* Floating Live Telemetry Statistics Badge */}
            <div className="absolute top-6 right-6 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <EditableElement
                targetId="home.sleep-tape-ad.badge"
                componentKey="SleepTapeAd"
                elementKey="badge"
                label="Campaign Badge"
                defaultValue="10k+ Deployed"
                inline
              >
                {(val) => (
                  <span className="text-[9px] font-black uppercase tracking-widest text-white dark:text-zinc-900">{val}</span>
                )}
              </EditableElement>
            </div>

          </div>
        </div>

        {/* --- RIGHT BLOCK: Technical Campaign Copy Frame --- */}
        <motion.div 
          variants={contentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="lg:col-span-7 flex flex-col justify-center space-y-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-[1px] w-6 bg-zinc-400" />
              <EditableElement
                targetId="home.sleep-tape-ad.subtitle"
                componentKey="SleepTapeAd"
                elementKey="subtitle"
                label="Campaign Subtitle"
                defaultValue={adData.subtitle}
                inline
              >
                {(val) => (
                  <span 
                    className="text-[10px] font-black uppercase tracking-[0.3em] block"
                    style={{ color: primary === '#18181b' ? undefined : primary }}
                  >
                    {val}
                  </span>
                )}
              </EditableElement>
            </div>
            
            <EditableElement
              targetId="home.sleep-tape-ad.title"
              componentKey="SleepTapeAd"
              elementKey="title"
              label="Campaign Title"
              defaultValue={adData.title}
            >
              {(val) => (
                <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white leading-[1.05] uppercase tracking-tight">
                  {val}
                </h2>
              )}
            </EditableElement>
            
            <EditableElement
              targetId="home.sleep-tape-ad.description"
              componentKey="SleepTapeAd"
              elementKey="description"
              label="Campaign Description"
              type="textarea"
              defaultValue={adData.description}
            >
              {(val) => (
                <p className="mt-6 text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed font-medium">
                  {val}
                </p>
              )}
            </EditableElement>
          </div>

          {/* Action Trigger Block Layout Frame */}
          <div className="pt-2">
            <Link href={buildUrl(adData.ctaLink || '/ecommerceshoes/products')} passHref>
              <button 
                className="group inline-flex items-center gap-4 text-white dark:text-zinc-900 font-black text-[11px] uppercase tracking-widest py-5 px-10 rounded-[1.75rem] bg-zinc-900 dark:bg-white transition-all hover:opacity-90 hover:shadow-xl hover:shadow-zinc-950/10 active:scale-98"
                style={{ backgroundColor: primary === '#18181b' ? undefined : primary }}
              >
                <EditableElement
                  targetId="home.sleep-tape-ad.ctaText"
                  componentKey="SleepTapeAd"
                  elementKey="ctaText"
                  label="Button Text"
                  defaultValue={adData.ctaText}
                  inline
                >
                  {(val) => <span>{val}</span>}
                </EditableElement>
                <div className="h-5 w-5 bg-white/10 dark:bg-zinc-900/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRightIcon className="w-3 h-3 stroke-[3]" />
                </div>
              </button>
            </Link>
          </div>

          {/* Perks Matrix Block System */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-zinc-200/60 dark:border-zinc-800/60">
            {adData.perks.map((perk: any, index: number) => {
              const Icon = typeof perk.icon === 'function' ? perk.icon : ShieldCheckIcon;
              return (
                <div key={index} className="flex gap-4 items-start group">
                  <div 
                    className="p-3 rounded-xl transition-all duration-300 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white group-hover:scale-105"
                    style={{ color: primary === '#18181b' ? undefined : primary }}
                  >
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <EditableElement
                      targetId={`home.sleep-tape-ad.perks.${index}.text`}
                      componentKey="SleepTapeAd"
                      elementKey="text"
                      label={`Perk ${index + 1} Title`}
                      defaultValue={perk.text}
                    >
                      {(val) => (
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                          {val}
                        </h4>
                      )}
                    </EditableElement>

                    <EditableElement
                      targetId={`home.sleep-tape-ad.perks.${index}.detail`}
                      componentKey="SleepTapeAd"
                      elementKey="detail"
                      label={`Perk ${index + 1} Detail`}
                      defaultValue={perk.detail || 'Verified enterprise spec'}
                    >
                      {(val) => (
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5 leading-tight">
                          {val}
                        </p>
                      )}
                    </EditableElement>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}