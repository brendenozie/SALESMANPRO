'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Loader for next/image
const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function CtaSection({
  // Default props in case storeFormData has no overrides
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
  imageUrl?: string;
}) {
  const { storeFormData } = useStoreContext();
  let ctaSection: {
    title?: string;
    subtitle?: string;
    buttonLabel?: string;
    buttonHref?: string;
    imageUrl?: string;
  } = {};
  const {
    themeSettings = {},
    name,
    slug,
  } = storeFormData;

  // Theme colors
  const primaryColor = themeSettings.primaryColor || '#10b981'; // fallback green
  const buttonBg = primaryColor;
  const buttonHoverBg = themeSettings.secondaryColor || '#047857'; // fallback darker shade or secondary
  const overlayColor = 'rgba(0, 0, 0, 0.4)';

  // Pull from storeFormData.ctaSection if available, else props, else defaults
  const title =
    ctaSection.title ||
    propTitle ||
    `Experience Relaxation Like Never Before`;
  const subtitle =
    ctaSection.subtitle ||
    propSubtitle ||
    'Join us today to book your perfect session and enjoy premium service.';
  let buttonLabel =
    ctaSection.buttonLabel || propButtonLabel || 'Get Started';
  let buttonHref =
    ctaSection.buttonHref || propButtonHref || (slug ? `/${slug}/contact` : '#');

  // If the href is missing but contactEmail exists, use mailto
  if (
    (!buttonHref || buttonHref === '#') &&
    storeFormData.contactEmail
  ) {
    buttonHref = `mailto:${storeFormData.contactEmail}`;
  }

  // Image URL from dynamic data or prop or fallback banner/logo
  const imageUrl =
    ctaSection.imageUrl ||
    propImageUrl ||
    storeFormData.bannerUrl ||
    storeFormData.heroSlides?.[0]?.imageUrl ||
    storeFormData.logoUrl ||
    '/placeholder-cta.jpg';

  return (
    <section className="py-16 px-4 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-xl"
      >
        {/* Background Image */}
        <Image
          src={imageUrl}
          loader={loader}
          alt={title}
          fill
          objectFit="cover"
          className="z-0"
          priority={false}
        />

        {/* Overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{ backgroundColor: overlayColor }}
        />

        {/* Content */}
        <div className="relative z-20 px-8 py-12 sm:px-12 md:px-16 lg:px-20 text-white max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            {title.split('{accent}').length > 1
              ? title.split('{accent}').map((part, idx) =>
                  idx % 2 === 1 ? (
                    <span key={idx} style={{ color: primaryColor }}>
                      {part}
                    </span>
                  ) : (
                    <React.Fragment key={idx}>{part}</React.Fragment>
                  )
                )
              : title}
          </h2>
          {subtitle && (
            <p className="text-lg mb-6">{subtitle}</p>
          )}
          {buttonHref && (
            <Link href={buttonHref}
                className="inline-flex items-center font-medium py-3 px-6 rounded-full shadow-md transition-all duration-300"
                style={{ backgroundColor: buttonBg }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    buttonHoverBg;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    buttonBg;
                }}
              >
                {buttonLabel}
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
}
