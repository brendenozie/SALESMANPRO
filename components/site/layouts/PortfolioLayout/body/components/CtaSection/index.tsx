'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 16,
    },
  },
};

interface CtaSectionProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
  imageUrl?: string;
}

export default function CtaSection({
  title: propTitle,
  subtitle: propSubtitle,
  buttonLabel: propButtonLabel,
  buttonHref: propButtonHref,
  imageUrl: propImageUrl,
}: CtaSectionProps) {
  const { storeFormData } = useStoreContext() || {};
  
  const ctaSection: Record<string, string> = {};
  const { themeSettings = {}, slug } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#000000';

  const title =
    ctaSection.title ||
    propTitle ||
    `Experience Relaxation Like Never Before`;
  const subtitle =
    ctaSection.subtitle ||
    propSubtitle ||
    'Join us today to book your perfect session and enjoy premium service.';
  
  const buttonLabel = ctaSection.buttonLabel || propButtonLabel || 'Get Started';
  
  let buttonHref =
    ctaSection.buttonHref || propButtonHref || (slug ? `/${slug}/contact` : '#');

  if ((!buttonHref || buttonHref === '#') && storeFormData?.contactEmail) {
    buttonHref = `mailto:${storeFormData.contactEmail}`;
  }

  const imageUrl =
    ctaSection.imageUrl ||
    propImageUrl ||
    storeFormData?.bannerUrl ||
    storeFormData?.heroSlides?.[0]?.imageUrl ||
    storeFormData?.logoUrl ||
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80';

  return (
    <AnimatePresence>
      <section className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100">
        
        {/* Minimal Wire Grid Background Sync */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Structural Framework Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 lg:p-16 overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            
            {/* Text Node Matrix Column */}
            <div className="flex flex-col items-start lg:col-span-7 text-left">
              
              {/* Minimal Tagline Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white border border-slate-200 mb-6"
                variants={itemVariants}
              >
                <SparklesIcon className="w-4 h-4 text-slate-600" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                  Engagement Vector
                </p>
              </motion.div>

              <motion.h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]"
                variants={itemVariants}
              >
                {title.split('{accent}').length > 1 ? (
                  title.split('{accent}').map((part, idx) =>
                    idx % 2 === 1 ? (
                      <span key={idx} style={{ color: primaryColor }}>
                        {part}
                      </span>
                    ) : (
                      <React.Fragment key={idx}>{part}</React.Fragment>
                    )
                  )
                ) : (
                  title
                )}
              </motion.h2>

              {subtitle && (
                <motion.p 
                  className="mt-6 text-slate-500 text-base sm:text-lg font-normal leading-relaxed max-w-xl"
                  variants={itemVariants}
                >
                  {subtitle}
                </motion.p>
              )}

              {/* Action Matrix Link Container */}
              <motion.div className="mt-8 w-full sm:w-auto" variants={itemVariants}>
                <Link
                  href={buttonHref}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-xl text-white bg-slate-900 border border-slate-900 transition-all duration-200 hover:bg-slate-800 active:scale-95 shadow-sm group"
                >
                  {buttonLabel}
                  <ArrowRightIcon className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
                </Link>
              </motion.div>
            </div>

            {/* Structured Wire Media Grid Column */}
            <motion.div 
              className="lg:col-span-5 w-full aspect-[4/3] lg:aspect-square relative rounded-xl overflow-hidden border border-slate-200 bg-white p-2"
              variants={itemVariants}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image decoding="async"
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="(max-w-7xl) 40vw, 90vw"
                  className="object-cover object-center"
                  priority={false}
                />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}