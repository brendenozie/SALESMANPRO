'use client';

import React from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

export default function DiscoveryCallSection() {
  const { storeFormData } = useStoreContext();

  // TODO: Replace 'any' with a proper type/interface if available
  let discoveryCall: any = {};

  const {
    name,
    slug,
    themeSettings = {},
    contactEmail,
    contactPhone,
  } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#14B8A6'; // teal default
  const accentTextColor = themeSettings.secondaryColor || '#ffffff';

  // Fallbacks for content
  const title =
    discoveryCall.headline ||
    `Do You Want to Be an ${name ? `Exceptionally Successful ${name}` : 'Exceptionally Successful Business Owner'}?`;
  const subtitle =
    discoveryCall.description ||
    'Join our coaching program and learn valuable insights and strategies from experienced professionals who have achieved great success in their own businesses.';
  const ctaText = discoveryCall.ctaText || 'Schedule a Free Discovery Call Today';

  // Determine button link: prefer a specific link, else contact page, else mailto
  let ctaLink = discoveryCall.ctaLink || (slug ? `/${slug}/contact` : '');
  if (!ctaLink && contactEmail) {
    ctaLink = `mailto:${contactEmail}`;
  }

  // If phone but no email/contact page, maybe use tel:
  if (!ctaLink && contactPhone) {
    ctaLink = `tel:${contactPhone}`;
  }

  const ButtonContent = () => (
    <span className="font-medium">{ctaText}</span>
  );

  return (
    <section
      className="py-12 px-6 lg:px-20 rounded-2xl text-center mx-4 lg:mx-auto max-w-6xl my-12"
      style={{ backgroundColor: primaryColor }}
    >
      <h2
        className="text-2xl md:text-3xl font-bold leading-snug text-white"
      >
        {/* Highlight a word if desired */}
        {title.split('{accent}').length > 1
          ? title.split('{accent}').map((part: any, idx: any) =>
              idx % 2 === 1 ? (
                <span key={idx} style={{ color: accentTextColor }}>
                  {part}
                </span>
              ) : (
                <React.Fragment key={idx}>{part}</React.Fragment>
              )
            )
          : (() => {
              // Highlight the last word before a question mark (if any)
              const match = title.match(/^(.*?)(\b\w+?)(\?)?$/);
              if (match) {
                const [, before, word, question] = match;
                return (
                  <>
                    {before}
                    <span style={{ color: accentTextColor }}>{word}</span>
                    {question || ''}
                  </>
                );
              }
              return title;
            })()}
      </h2>

      {subtitle && (
        <p className="mt-4 text-white/90 max-w-2xl mx-auto text-sm md:text-base">
          {subtitle}
        </p>
      )}

      {ctaLink ? (
        ctaLink.startsWith('http') || ctaLink.startsWith('/') ? (
          <Link href={ctaLink}
              className="mt-6 inline-block px-6 py-3 rounded text-white hover:opacity-90 transition"
              style={{ backgroundColor: primaryColor }}
            >
              <ButtonContent />
          </Link>
        ) : (
          <a
            href={ctaLink}
            className="mt-6 inline-block px-6 py-3 rounded text-white hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
          >
            <ButtonContent />
          </a>
        )
      ) : null}
    </section>
  );
}
