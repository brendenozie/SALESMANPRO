'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useEditableContent, EditableElement } from '@/contexts/EditableContentContext';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

const defaultPromos: IPromotion[] = [
  {
    id: 'promo-1',
    title: 'The Haute Trench',
    description: 'Impeccable bespoke wool draping reimagined for contemporary winter silhouettes.',
    badgeText: 'Seasonal Focus',
    bannerUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80',
    ctaText: 'Explore Story',
    ctaLink: '/fashionecommerce/products'
  },
  {
    id: 'promo-2',
    title: 'Minimalist Cashmere',
    description: 'Featherlight pure Mongolian yarns woven with artisan precision for daily comfort.',
    badgeText: 'Limited Release',
    bannerUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80',
    ctaText: 'Shop Cashmere',
    ctaLink: '/fashionecommerce/products'
  },
  {
    id: 'promo-3',
    title: 'Silk Evening Drapes',
    description: 'Fluid architectural cutlines inspired by vintage couture archives.',
    badgeText: 'Runway Exclusive',
    bannerUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80',
    ctaText: 'View Runway',
    ctaLink: '/fashionecommerce/products'
  }
];

const loader = ({ src, width }: any) => `${src}?w=${width}&q=80`;

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { isEditorMode } = useEditableContent();
  const primary = storeFormData?.themeSettings?.primaryColor || '#18181b';

  const displayPromos = useMemo(() => {
    if (promotions && promotions.length > 0) return promotions;
    if (isEditorMode) return defaultPromos;
    return [];
  }, [promotions, isEditorMode]);

  if (displayPromos.length === 0) return null;

  // Single Feature Promotion - The "Editorial" Layout
  if (displayPromos.length === 1) {
    const promo = displayPromos[0];
    return (
      <section className="relative w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[80vh]">
          
          {/* Left: Content Stage */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-24 z-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-md space-y-8"
            >
              {promo.badgeText && (
                <EditableElement
                  targetId="home.promo-section.promotions.0.badgeText"
                  label="Promotion Badge"
                  inline
                  className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block"
                >
                  <span>// {promo.badgeText}</span>
                </EditableElement>
              )}
              
              <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-none italic">
                <EditableElement
                  targetId="home.promo-section.promotions.0.title"
                  label="Promotion Title"
                  inline
                >
                  <span>
                    {promo.title.split(' ').map((word, i) => (
                      <span key={i} className={i % 2 === 1 ? 'font-serif lowercase italic text-zinc-400 block' : 'block'}>
                        {word}
                      </span>
                    ))}
                  </span>
                </EditableElement>
              </h2>

              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                <EditableElement
                  targetId="home.promo-section.promotions.0.description"
                  label="Promotion Description"
                  type="textarea"
                  inline
                >
                  <span>{promo.description}</span>
                </EditableElement>
              </p>

              <motion.a
                href={promo.ctaLink || '/fashionecommerce/products'}
                whileHover={{ gap: '1.5rem' }}
                className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white group"
              >
                <EditableElement
                  targetId="home.promo-section.promotions.0.ctaText"
                  label="Button Text"
                  inline
                >
                  <span>{promo.ctaText || 'Explore Story'}</span>
                </EditableElement>
                <div className="w-12 h-px bg-current transition-all group-hover:w-20" />
                <ArrowUpRightIcon className="w-4 h-4" />
              </motion.a>
            </motion.div>
          </div>

          {/* Right: Visual Stage with Parallax feel */}
          <div className="w-full md:w-1/2 relative h-[60vh] md:h-auto overflow-hidden">
            <motion.div 
              initial={{ scale: 1.2 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <EditableElement
                targetId="home.promo-section.promotions.0.bannerUrl"
                label="Promotion Banner"
                type="image"
                className="absolute inset-0 w-full h-full block"
              >
                <Image decoding="async"
                  src={promo.bannerUrl || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80'}
                  alt={promo.title}
                  fill
                  className="object-cover"
                />
              </EditableElement>
              <div className="absolute inset-0 bg-zinc-900/10 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple Promotions - The "Triptych" Layout
  return (
    <section className="py-32 bg-white dark:bg-zinc-950">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {displayPromos.slice(0, 3).map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-8">
                <EditableElement
                  targetId={`home.promo-section.promotions.${index}.bannerUrl`}
                  label={`Promo #${index + 1} Image`}
                  type="image"
                  className="w-full h-full block relative"
                >
                  <Image decoding="async"
                    src={item.bannerUrl || ''}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </EditableElement>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none" />
                
                {/* Floating Badge */}
                <div className="absolute top-6 left-6 overflow-hidden pointer-events-auto">
                  <motion.span 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="block bg-white text-zinc-900 text-[8px] font-black uppercase tracking-widest px-3 py-1"
                  >
                    <EditableElement
                      targetId={`home.promo-section.promotions.${index}.badgeText`}
                      label={`Promo #${index + 1} Badge`}
                      inline
                    >
                      <span>{item.badgeText || 'Limited'}</span>
                    </EditableElement>
                  </motion.span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-light uppercase tracking-widest text-zinc-900 dark:text-white">
                  <EditableElement
                    targetId={`home.promo-section.promotions.${index}.title`}
                    label={`Promo #${index + 1} Title`}
                    inline
                  >
                    <span>{item.title}</span>
                  </EditableElement>
                </h3>
                <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                  <EditableElement
                    targetId={`home.promo-section.promotions.${index}.description`}
                    label={`Promo #${index + 1} Description`}
                    type="textarea"
                    inline
                  >
                    <span>{item.description}</span>
                  </EditableElement>
                </p>
                <a 
                  href={item.ctaLink || '/fashionecommerce/products'} 
                  className="inline-block text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-900 dark:border-white pb-1 mt-4"
                >
                  <EditableElement
                    targetId={`home.promo-section.promotions.${index}.ctaText`}
                    label={`Promo #${index + 1} CTA`}
                    inline
                  >
                    <span>{item.ctaText || 'Learn More'}</span>
                  </EditableElement>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}