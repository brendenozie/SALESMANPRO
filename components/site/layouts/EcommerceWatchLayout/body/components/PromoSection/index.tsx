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

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#1a1a1a';

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: Luxury Hero Feature
  if (promotions.length === 1) {
    const promo = promotions[0];
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
                  targetId="home.promo-section.promotions.0.badgeText"
                  componentKey="PromoSection"
                  elementKey="badgeText"
                  label="Promotion Badge"
                  defaultValue="Exclusive Release"
                  inline
                >
                  <span className="text-xs font-bold tracking-[0.3em] uppercase">Exclusive Release</span>
                </EditableElement>
              </div>
              <EditableElement
                targetId="home.promo-section.promotions.0.title"
                componentKey="PromoSection"
                elementKey="title"
                label="Promotion Title"
                defaultValue={promo.title}
              >
                {(val) => (
                  <h2 className="text-5xl md:text-7xl font-serif leading-tight text-gray-900">
                    {val}
                  </h2>
                )}
              </EditableElement>

              <EditableElement
                targetId="home.promo-section.promotions.0.description"
                componentKey="PromoSection"
                elementKey="description"
                label="Promotion Description"
                type="textarea"
                defaultValue={promo.description}
              >
                {(val) => (
                  <p className="text-lg text-gray-600 font-light leading-relaxed max-w-lg">
                    {val}
                  </p>
                )}
              </EditableElement>

              <EditableElement
                targetId="home.promo-section.promotions.0.ctaText"
                componentKey="PromoSection"
                elementKey="ctaText"
                label="Button Text"
                defaultValue={promo.ctaText || 'Discover Collection'}
                inline
              >
                {(val) => (
                  <a
                    href={promo.ctaLink || '/watchecommerce/products'}
                    className="group inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest pt-4"
                  >
                    <span className="relative">
                      {val}
                      <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-black scale-x-100 group-hover:scale-x-50 transition-transform origin-left" />
                    </span>
                    <div className="p-3 border border-gray-200 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                      <ArrowUpRightIcon className="w-4 h-4" />
                    </div>
                  </a>
                )}
              </EditableElement>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="flex-1 relative w-full aspect-[4/5] md:aspect-square lg:aspect-auto lg:h-[600px]"
            >
              <div className="absolute inset-0 border-[12px] border-gray-100 translate-x-6 translate-y-6" />
              <EditableElement
                targetId="home.promo-section.promotions.0.bannerUrl"
                componentKey="PromoSection"
                elementKey="bannerUrl"
                label="Banner Image"
                type="image"
                defaultValue={promo.bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'}
              >
                {(val) => (
                  <img
                    src={val}
                    alt={promo.title}
                    className="relative w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700 shadow-2xl"
                  />
                )}
              </EditableElement>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: Editorial "Mosaic" Grid
  const items = promotions.slice(0, 3);
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
              targetId="home.promo-section.promotions.0.bannerUrl"
              componentKey="PromoSection"
              elementKey="bannerUrl"
              label="Lead Promo Image"
              type="image"
              defaultValue={items[0].bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'}
            >
              {(val) => (
                <img src={val} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="" />
              )}
            </EditableElement>
            <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <EditableElement
                targetId="home.promo-section.promotions.0.badgeText"
                componentKey="PromoSection"
                elementKey="badgeText"
                label="Lead Promo Badge"
                defaultValue="Feature"
                inline
              >
                <span className="text-amber-500 text-xs font-bold tracking-widest mb-2 uppercase">Feature</span>
              </EditableElement>
              <EditableElement
                targetId="home.promo-section.promotions.0.title"
                componentKey="PromoSection"
                elementKey="title"
                label="Lead Promo Title"
                defaultValue={items[0].title}
              >
                {(val) => (
                  <h3 className="text-4xl font-serif mb-4">{val}</h3>
                )}
              </EditableElement>
              <EditableElement
                targetId="home.promo-section.promotions.0.ctaText"
                componentKey="PromoSection"
                elementKey="ctaText"
                label="Lead Promo CTA"
                defaultValue="Explore"
                inline
              >
                <a href={items[0].ctaLink || '/watchecommerce/products'} className="text-sm font-bold tracking-widest uppercase border-b border-white w-fit pb-1 group-hover:text-amber-500 group-hover:border-amber-500 transition-colors">
                  Explore
                </a>
              </EditableElement>
            </div>
          </motion.div>

          {/* Right Column Grid */}
          <div className="md:col-span-5 grid grid-rows-2 gap-8">
            {items.slice(1).map((item, idx) => {
              const promoIdx = idx + 1;
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="relative group overflow-hidden rounded-sm"
                >
                  <EditableElement
                    targetId={`home.promo-section.promotions.${promoIdx}.bannerUrl`}
                    componentKey="PromoSection"
                    elementKey="bannerUrl"
                    label={`Promo #${promoIdx + 1} Image`}
                    type="image"
                    defaultValue={item.bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'}
                  >
                    {(val) => (
                      <img src={val} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" alt="" />
                    )}
                  </EditableElement>
                  <div className="absolute inset-0 p-8 flex flex-col justify-end bg-black/40 group-hover:bg-black/20 transition-all">
                    <EditableElement
                      targetId={`home.promo-section.promotions.${promoIdx}.title`}
                      componentKey="PromoSection"
                      elementKey="title"
                      label={`Promo #${promoIdx + 1} Title`}
                      defaultValue={item.title}
                    >
                      {(val) => (
                        <h3 className="text-2xl font-serif mb-2">{val}</h3>
                      )}
                    </EditableElement>

                    <EditableElement
                      targetId={`home.promo-section.promotions.${promoIdx}.description`}
                      componentKey="PromoSection"
                      elementKey="description"
                      label={`Promo #${promoIdx + 1} Description`}
                      type="textarea"
                      defaultValue={item.description}
                    >
                      {(val) => (
                        <p className="text-xs text-gray-300 font-light tracking-wide line-clamp-2 mb-4">
                          {val}
                        </p>
                      )}
                    </EditableElement>

                    <EditableElement
                      targetId={`home.promo-section.promotions.${promoIdx}.ctaText`}
                      componentKey="PromoSection"
                      elementKey="ctaText"
                      label={`Promo #${promoIdx + 1} CTA`}
                      defaultValue="View"
                      inline
                    >
                      <a href={item.ctaLink || '/watchecommerce/products'} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                        View <ArrowUpRightIcon className="w-3 h-3" />
                      </a>
                    </EditableElement>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}