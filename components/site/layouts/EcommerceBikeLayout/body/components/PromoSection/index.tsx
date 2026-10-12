'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useEditableContent, EditableElement } from '@/contexts/EditableContentContext';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

const defaultPromotions: IPromotion[] = [
  {
    id: 'default-promo-1',
    title: 'The Apex Carbon Frame',
    description: 'Precision engineered carbon fiber monocoque designed for pure power transfer, ultra-lightweight performance, and seamless aerodynamics.',
    ctaText: 'Discover Collection',
    ctaLink: '/bikeecommerce/collections',
    bannerUrl: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa',
  } as any,
  {
    id: 'default-promo-2',
    title: 'Electronic Shifting Groupset',
    description: 'Instant wireless gear transitions with Bluetooth telemetry and automated trimming.',
    ctaText: 'Explore',
    ctaLink: '/bikeecommerce/collections',
    bannerUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
  } as any,
];

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { isEditorMode } = useEditableContent();
  const primary = storeFormData?.themeSettings?.primaryColor || '#1a1a1a';

  const effectivePromotions = (promotions && promotions.length > 0) ? promotions : (isEditorMode ? defaultPromotions : []);
  if (!effectivePromotions || effectivePromotions.length === 0) return null;

  // Single Promotion: Luxury Hero Feature
  if (effectivePromotions.length === 1) {
    const promo = effectivePromotions[0];
    return (
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex-1 space-y-6 z-10"
            >
              <div className="flex items-center gap-2 text-amber-600">
                <SparklesIcon className="w-5 h-5" />
                <EditableElement
                  targetId="home.promo.badge"
                  label="Promo Badge"
                  type="text"
                  defaultValue="Exclusive Release"
                >
                  <span className="text-xs font-bold tracking-[0.3em] uppercase">Exclusive Release</span>
                </EditableElement>
              </div>
              <EditableElement
                targetId="home.promo.title"
                label="Promo Title"
                type="text"
                defaultValue={promo.title}
              >
                <h2 className="text-5xl md:text-7xl font-serif leading-tight text-gray-900">
                  {promo.title}
                </h2>
              </EditableElement>
              <EditableElement
                targetId="home.promo.description"
                label="Promo Description"
                type="textarea"
                defaultValue={promo.description}
              >
                <p className="text-lg text-gray-600 font-light leading-relaxed max-w-lg">
                  {promo.description}
                </p>
              </EditableElement>
              <EditableElement
                targetId="home.promo.ctaText"
                label="Promo CTA Button"
                type="button"
                defaultValue={promo.ctaText || 'Discover Collection'}
              >
                <a
                  href={promo.ctaLink || '/bikeecommerce/collections'}
                  className="group inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest pt-4"
                >
                  <span className="relative">
                    {promo.ctaText || 'Discover Collection'}
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-black scale-x-100 group-hover:scale-x-50 transition-transform origin-left" />
                  </span>
                  <div className="p-3 border border-gray-200 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </div>
                </a>
              </EditableElement>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="flex-1 relative w-full aspect-[4/5] md:aspect-square lg:aspect-auto lg:h-[600px]"
            >
              <div className="absolute inset-0 border-[12px] border-gray-100 translate-x-6 translate-y-6" />
              <EditableElement
                targetId="home.promo.bannerUrl"
                label="Promo Banner Image"
                type="image"
                defaultValue={promo.bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'}
              >
                <img
                  src={promo.bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'}
                  alt={promo.title}
                  className="relative w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700 shadow-2xl"
                />
              </EditableElement>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: Editorial "Mosaic" Grid
  const items = effectivePromotions.slice(0, 3);
  return (
    <section className="py-24 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:h-[700px]">
          {/* Main Large Promo */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="md:col-span-7 relative group overflow-hidden rounded-sm"
          >
            <EditableElement
              targetId="home.promo.items.0.bannerUrl"
              label="Promo Main Banner"
              type="image"
              defaultValue={items[0].bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'}
            >
              <img src={items[0].bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="" />
            </EditableElement>
            <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
              <span className="text-amber-500 text-xs font-bold tracking-widest mb-2 uppercase">Feature</span>
              <EditableElement
                targetId="home.promo.items.0.title"
                label="Promo Main Title"
                type="text"
                defaultValue={items[0].title}
              >
                <h3 className="text-4xl font-serif mb-4 pointer-events-auto">{items[0].title}</h3>
              </EditableElement>
              <EditableElement
                targetId="home.promo.items.0.ctaText"
                label="Promo Main CTA"
                type="button"
                defaultValue="Explore"
              >
                <a href={items[0].ctaLink || '/bikeecommerce/collections'} className="text-sm font-bold tracking-widest uppercase border-b border-white w-fit pb-1 group-hover:text-amber-500 group-hover:border-amber-500 transition-colors pointer-events-auto inline-block">
                  Explore
                </a>
              </EditableElement>
            </div>
          </motion.div>

          {/* Right Column Grid */}
          <div className="md:col-span-5 grid grid-rows-2 gap-8">
            {items.slice(1).map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="relative group overflow-hidden rounded-sm"
              >
                <EditableElement
                  targetId={`home.promo.items.${idx + 1}.bannerUrl`}
                  label="Promo Secondary Banner"
                  type="image"
                  defaultValue={item.bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'}
                >
                  <img src={item.bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" alt="" />
                </EditableElement>
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-black/40 group-hover:bg-black/20 transition-all pointer-events-none">
                  <EditableElement
                    targetId={`home.promo.items.${idx + 1}.title`}
                    label="Promo Secondary Title"
                    type="text"
                    defaultValue={item.title}
                  >
                    <h3 className="text-2xl font-serif mb-2 pointer-events-auto">{item.title}</h3>
                  </EditableElement>
                  <EditableElement
                    targetId={`home.promo.items.${idx + 1}.description`}
                    label="Promo Secondary Description"
                    type="textarea"
                    defaultValue={item.description}
                  >
                    <p className="text-xs text-gray-300 font-light tracking-wide line-clamp-2 mb-4 pointer-events-auto">
                      {item.description}
                    </p>
                  </EditableElement>
                  <a href={item.ctaLink || '/bikeecommerce/collections'} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white pointer-events-auto">
                    View <ArrowUpRightIcon className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}