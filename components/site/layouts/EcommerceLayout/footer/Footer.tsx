'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '../../../../../contexts/StoreContext';
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

  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  // Map common social channels to icons
  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <FaceFrownIcon className='w-5 h-5' />,
    twitter: <FaceFrownIcon className='w-5 h-5'  />,
    instagram: <FaceFrownIcon className='w-5 h-5'  />,
    linkedin: <FaceFrownIcon className='w-5 h-5'  />,
    youtube: <FaceFrownIcon className='w-5 h-5'  />,
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12">
      {/* Gradient Accent Bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${primary}, ${secondary})`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12 border-b border-gray-700">
        {/* About Us */}
        <div>
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
          <p className="text-sm leading-relaxed text-gray-400">
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
                href={`/site/${slug}/about`}
                className="hover:text-white transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/contact`}
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/privacy`}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/terms`}
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
                href={`/site/${slug}/help`}
                className="hover:text-white transition-colors"
              >
                Help Center
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/returns`}
                className="hover:text-white transition-colors"
              >
                Returns
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/shipping`}
                className="hover:text-white transition-colors"
              >
                Shipping
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${slug}/track`}
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
              const channel = s.channel.toLowerCase();
              const icon = iconMapper[channel] || <FaceFrownIcon className='w-5 h-5'  />;
              return (
                <motion.a
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white bg-gray-800 p-3 rounded-full transition-colors"
                  style={{
                    background: `linear-gradient(135deg, ${primary}33, ${secondary}33)`,
                  }}
                >
                  <span className="h-5 w-5">{icon}</span>
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 border-t border-gray-700 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link
              href={`/site/${slug}/sitemap.xml`}
              className="text-sm hover:text-white transition-colors"
            >
              Sitemap
            </Link>
            <Link
              href={`/site/${slug}/faq`}
              className="text-sm hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link
              href={`/site/${slug}/support`}
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
