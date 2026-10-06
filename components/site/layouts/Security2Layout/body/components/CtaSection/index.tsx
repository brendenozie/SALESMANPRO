'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const defaultPrimary = '#00A880'; // Teal

export default function SecurityCtaSection({
  title: propTitle,
  subtitle: propSubtitle,
  buttonLabel: propButtonLabel,
  buttonHref: propButtonHref,
  imageUrl: propImageUrl,
}: {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
  imageUrl?: string | undefined | null;
}) {
  const { storeFormData } = useStoreContext() as { storeFormData?: any }; 
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || defaultPrimary;

  const defaultTitle = 'Ready to Fortify Your {accent}Digital Perimeter{/accent}?';
  const defaultSubtitle =
    "Don't wait for an incident. Partner with our experts to deploy next-gen defense strategies tailored to your enterprise.";
  const defaultButtonLabel = 'Begin Your Security Assessment';

  const title = propTitle || defaultTitle;
  const subtitle = propSubtitle || defaultSubtitle;
  const buttonLabel = propButtonLabel || defaultButtonLabel;
  
  let buttonHref = propButtonHref || (storeFormData?.slug ? `/${storeFormData.slug}/contact` : '/contact');

  if ((!buttonHref || buttonHref === '#') && storeFormData?.contactEmail) {
    buttonHref = `mailto:${storeFormData.contactEmail}`;
  }

  const imageUrl =
    propImageUrl ||
    'https://images.unsplash.com/photo-1541701490263-8822ab1a09d3?q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1400&h=700&fit=crop';

  const renderTitle = (fullTitle: string, highlightColor: string) => {
    // Standardize syntax for replacement keys
    const cleanTitle = fullTitle.replace('{accent}', '{accent}').replace('{/accent}', '{accent}');
    if (cleanTitle.includes('{accent}')) {
      const parts = cleanTitle.split(/\{accent\}/g);
      return parts.map((part, idx) => (
        idx % 2 === 1 ? (
          <span key={idx} style={{ color: highlightColor }}>{part}</span>
        ) : (
          <React.Fragment key={idx}>{part}</React.Fragment>
        )
      ));
    }
    return fullTitle;
  };

  return (
    <section id="perimeter-hardening" className="relative py-28 md:py-36 bg-white text-gray-900 overflow-hidden border-b border-gray-100">
      
      {/* STRUCTURAL BACKGROUND TELEMETRY MESHGRID */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-r border-gray-900 h-full" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'linear' }}
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 bg-white"
        >
          
          {/* LEFT TELEMETRY COLUMN: CRITICAL SYSTEMS LOGS */}
          <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200">
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                  DISPATCH // DEFENSIVE_STAND
                </p>
              </div>

              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1] mb-6">
                {renderTitle(title, primaryColor)}
              </h2>

              {subtitle && (
                <p className="text-xs font-mono text-gray-500 leading-relaxed uppercase border-l border-gray-200 pl-4 mb-10 max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>

            {/* FLAT HIGH-CONTRAST TRIGGER ROUTINE */}
            <div className="pt-4">
              <Link
                href={buttonHref}
                className="inline-flex items-center gap-4 text-xs font-mono font-black uppercase tracking-wider text-white bg-gray-950 hover:bg-gray-900 transition-colors py-4 px-6 border border-transparent hover:border-gray-950"
              >
                <LockClosedIcon className="w-4 h-4 text-gray-400" />
                {buttonLabel}
                <ArrowRightIcon className="w-4 h-4" style={{ color: primaryColor }} />
              </Link>
            </div>
          </div>

          {/* RIGHT COL: VISUAL PERIMETER TELEMETRY IMAGE GRID */}
          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-gray-50 p-2">
            <div className="relative w-full h-full min-h-[284px] bg-gray-100 border border-gray-200 overflow-hidden">
              <Image decoding="async"
                src={imageUrl}
                alt="Digital security blueprint architecture grid matrix"
                layout="fill"
                objectFit="cover"
                className="mix-blend-multiply opacity-85 transition-transform duration-700 hover:scale-102"
                priority={false}
              />
              
              {/* TOP ANCHOR SYSTEM LABEL */}
              <div className="absolute top-3 left-3 bg-gray-950 text-[9px] font-mono font-black text-white px-2 py-0.5 uppercase tracking-widest">
                SYS_VISUAL_PRMT_V04
              </div>

              {/* BOTTOM STATUS METRIC OVERLAY */}
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-gray-200 text-[8px] font-mono font-bold text-gray-500 px-2 py-1 uppercase tracking-tight">
                ACTIVE_MATRIX // STATUS_OK
              </div>
            </div>
          </div>

        </motion.div>

        {/* COMPONENT OUTLINE TELEMETRY BOUNDS */}
        <div className="mt-4 flex items-center justify-between px-1 text-[9px] font-mono text-gray-300 font-bold uppercase tracking-wider">
          <span>[PERIMETER_SECURE_INITIATIVE_ROUTINE]</span>
          <span>REF_NODE_0X449</span>
        </div>
      </div>
    </section>
  );
}