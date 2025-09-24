'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    slug,
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#10B981';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  // Map common social channels to icons (placeholder icons here)
  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <FaceFrownIcon className="w-5 h-5" />,
    twitter: <FaceFrownIcon className="w-5 h-5" />,
    instagram: <FaceFrownIcon className="w-5 h-5" />,
    linkedin: <FaceFrownIcon className="w-5 h-5" />,
    youtube: <FaceFrownIcon className="w-5 h-5" />,
  };

  return (
    <footer className="relative bg-gray-900 text-gray-300 pt-12 overflow-hidden">
      {/* Subtle Radial Accent */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-16 w-80 h-80 bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Gradient Accent Bar */}
      <div
        className="h-1 w-full mb-8"
        style={{
          background: `linear-gradient(90deg, ${primary}, ${secondary})`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* About Us */}
        <div className="relative">
          <h3
            className="text-xl font-extrabold mb-4"
            style={{
              background: `linear-gradient(90deg, ${primary}, ${secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            About Us
          </h3>
          <p className="text-sm leading-relaxed text-gray-400  h-12 overflow-clip">
            {description ||
              'Discover everything you need from our trusted marketplace. Fast delivery, great deals, and top-notch service—trusted by thousands every day.'}
          </p>
          {contactEmail && (
            <p className="mt-4 text-sm hover:text-white transition-colors">
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
          )}
          {contactPhone && (
            <p className="mt-1 text-sm hover:text-white transition-colors">
              <a href={`tel:${contactPhone}`}>{contactPhone}</a>
            </p>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h3
            className="text-xl font-extrabold mb-4"
            style={{
              background: `linear-gradient(90deg, ${primary}, ${secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href={`/site/${slug}/ecommerceshoes/about`}
                className="hover:text-white transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/ecommerceshoes/contact`}
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/ecommerceshoes/privacy`}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/ecommerceshoes/terms`}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3
            className="text-xl font-extrabold mb-4"
            style={{
              background: `linear-gradient(90deg, ${primary}, ${secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Customer Care
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href={`/site/${slug}/ecommerceshoes/help`}
                className="hover:text-white transition-colors"
              >
                Help Center
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/ecommerceshoes/returns`}
                className="hover:text-white transition-colors"
              >
                Returns
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/ecommerceshoes/shipping`}
                className="hover:text-white transition-colors"
              >
                Shipping
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/ecommerceshoes/track`}
                className="hover:text-white transition-colors"
              >
                Track Order
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3
            className="text-xl font-extrabold mb-4"
            style={{
              background: `linear-gradient(90deg, ${primary}, ${secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Follow Us
          </h3>
          <div className="flex space-x-4">
            {socialLinks.map((s, idx) => {
              const channel = s.channel;//.toLowerCase();
              const icon = iconMapper[channel] || <FaceFrownIcon className="w-5 h-5" />;
              return (
                <motion.a
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex items-center justify-center 
                    w-10 h-10 
                    text-gray-300 hover:text-white 
                    rounded-full 
                    transition-colors
                  "
                  style={{
                    background: `linear-gradient(135deg, ${primary}33, ${secondary}33)`,
                  }}
                >
                  {icon}
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 border-t border-gray-700 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link
              href={`/site/${slug}/ecommerceshoes/sitemap.xml`}
              className="text-sm hover:text-white transition-colors"
            >
              Sitemap
            </Link>
            <Link
              href={`/site/${slug}/ecommerceshoes/faq`}
              className="text-sm hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link
              href={`/site/${slug}/ecommerceshoes/support`}
              className="text-sm hover:text-white transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
