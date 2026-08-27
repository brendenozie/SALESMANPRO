'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'; // Fine outline stroke vectors

interface SecurityCtaSectionProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
  imageUrl?: string | undefined | null;
}

const defaultPrimary = '#00A880'; 

export default function SecurityCtaSection({
  title: propTitle,
  subtitle: propSubtitle,
  buttonLabel: propButtonLabel,
  buttonHref: propButtonHref,
}: SecurityCtaSectionProps) {
  const { storeFormData } = useStoreContext() as { storeFormData?: any }; 
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || defaultPrimary;

  const defaultTitle = `Ready to Fortify Your Digital Perimeter?`;
  const defaultSubtitle =
    "Don't wait for an exploit incident. Partner with our architecture specialists to immediately deploy structured defense strategies optimized for your operational constraints.";
  const defaultButtonLabel = 'Initialize Security Assessment';

  const title = propTitle || defaultTitle;
  const subtitle = propSubtitle || defaultSubtitle;
  const buttonLabel = propButtonLabel || defaultButtonLabel;
  
  let buttonHref = propButtonHref || (storeFormData?.slug ? `/${storeFormData.slug}/contact` : '/contact');

  if ((!buttonHref || buttonHref === '#') && storeFormData?.contactEmail) {
    buttonHref = `mailto:${storeFormData.contactEmail}`;
  }

  const cleanTitleText = title
    .replace('{accent}', '')
    .replace('{/accent}', '')
    .replace('{accent}', '');

  return (
    <AnimatePresence>
      <section 
        id="security-gateway-cta"
        className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24 relative z-10">
          
          {/* LEFT HEADER PROSE COLUMN */}
          <div className="w-full lg:w-7/12 text-left">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500">
                <ShieldCheckIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                System Nexus Gateway
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1] mb-6">
              {cleanTitleText}
            </h2>

            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
              {subtitle}
            </p>
          </div>

          {/* RIGHT ACTION CONTROL HUB BLOCK */}
          <div className="w-full lg:w-5/12 flex flex-col items-start lg:items-end justify-center">
            <div className="w-full max-w-md border border-gray-100 p-8 bg-gray-50/50 rounded-2xl text-left relative font-mono">
              
              {/* Telemetry metadata block lines */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                <span>Node Connection Status</span>
                <span className="text-gray-900 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
                  [READY_STATE]
                </span>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed mb-6">
                Requesting an audit establishes an isolated sandbox assessment trace mapping external public-facing structural vectors.
              </p>

              {buttonHref ? (
                <Link
                  href={buttonHref}
                  className="w-full inline-flex items-center justify-between px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 rounded-xl hover:opacity-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>{buttonLabel}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              ) : (
                <span className="text-[10px] text-gray-400 block border border-dashed border-gray-200 p-3 rounded-lg text-center">
                  Interface route point omitted.
                </span>
              )}
            </div>
          </div>

        </div>
      </section>
    </AnimatePresence>
  );
}