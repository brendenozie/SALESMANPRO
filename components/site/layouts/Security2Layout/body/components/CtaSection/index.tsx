'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Using solid icons

// Loader for next/image
const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Default security-focused colors
const defaultPrimary = '#00A880'; // Teal
const defaultSecondary = '#3B82F6'; // Blue

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
  const { storeFormData } = useStoreContext() as { storeFormData?: any }; // Ensure safe access
  
  // Theme colors
  const primaryColor = storeFormData?.themeSettings?.primaryColor || defaultPrimary;
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || defaultSecondary;
  const buttonBg = secondaryColor; // Use secondary for high-contrast button
  const buttonHoverBg = primaryColor; // Use primary for hover effect
  // Dark overlay for visibility on abstract backgrounds
  const overlayColor = 'rgba(0, 0, 0, 0.6)'; 

  // --- SECURITY-FOCUSED FALLBACK CONTENT ---
  const defaultTitle = `Ready to Fortify Your {accent}Digital Perimeter{/accent}?`;
  const defaultSubtitle =
    'Don\'t wait for an incident. Partner with our experts to deploy next-gen defense strategies tailored to your enterprise.';
  const defaultButtonLabel = 'Begin Your Security Assessment';

  // Pull from props or defaults
  const title = propTitle || defaultTitle;
  const subtitle = propSubtitle || defaultSubtitle;
  let buttonLabel = propButtonLabel || defaultButtonLabel;
  let buttonHref = propButtonHref || (storeFormData?.slug ? `/${storeFormData.slug}/contact` : '/contact');

  // Link fallback logic
  if (
    (!buttonHref || buttonHref === '#') &&
    storeFormData?.contactEmail
  ) {
    buttonHref = `mailto:${storeFormData.contactEmail}`;
  }

  // Image URL - using a dynamic tech/security fallback
  const imageUrl =
    propImageUrl ||
    'https://images.unsplash.com/photo-1541701490263-8822ab1a09d3?q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1400&h=700&fit=crop'; // Abstract digital network/circuitry

  // Render Title with {accent} replacement
  const renderTitle = (fullTitle: string, accentColor: string) => {
    const parts = fullTitle.split(/\{accent\}(.*?)\{accent}/g);
    return parts.map((part, idx) => (
        idx % 2 === 1 ? (
            <span key={idx} style={{ color: accentColor }}>{part}</span>
        ) : (
            <React.Fragment key={idx}>{part}</React.Fragment>
        )
    ));
  };


  return (
    <section className="py-20 md:py-32 px-4 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.3 }}
        className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl aspect-video md:aspect-[3/1]"
      >
        {/* Background Image: Abstract tech image for security */}
        <Image
          src={imageUrl}
          loader={loader}
          alt="Digital security network background"
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          objectFit="cover"
          className="z-0 transition-transform duration-1000 hover:scale-105"
          priority={false}
        /> 

        {/* Dynamic Gradient Overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{ 
            background: `linear-gradient(90deg, ${overlayColor} 0%, rgba(0, 0, 0, 0.3) 100%)`, 
          }}
        />

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-8 py-12 sm:px-12 md:px-16 lg:px-20 text-white">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-snug drop-shadow-md">
            {renderTitle(title.replace('{accent}', secondaryColor), secondaryColor)}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl max-w-3xl mb-8 font-light drop-shadow-sm">
              {subtitle}
            </p>
          )}
          {buttonHref && (
            <Link href={buttonHref}
              className="inline-flex items-center gap-3 font-bold text-lg py-4 px-10 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-[1.03] hover:ring-4 focus:ring-4 text-white"
              style={{
                  backgroundColor: buttonBg, // Secondary color for contrast
                  // Subtle glow effect
                  boxShadow: `0 0 20px ${buttonBg}55`,
                  ['--tw-ring-color']: `${buttonHoverBg}80`,
              } as React.CSSProperties & Record<string, string>}
              onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = buttonHoverBg; // Primary color on hover
              }}
              onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = buttonBg;
              }}
            >
              <LockClosedIcon className="w-6 h-6" />
              {buttonLabel}
              <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
}