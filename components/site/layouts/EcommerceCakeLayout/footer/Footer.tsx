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
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
    twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
    linkedin: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11.75 20h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.25 12.268h-3v-5.604c0-1.337-.026-3.059-1.865-3.059-1.865 0-2.151 1.459-2.151 2.967v5.696h-3v-11h2.881v1.507h.041c.401-.761 1.381-1.562 2.841-1.562 3.039 0 3.602 2.001 3.602 4.601v6.454z"/></svg>,
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
                href={`/ecommerce/about`}
                className="hover:text-white transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href={`/ecommerce/contact`}
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href={`/ecommerce/privacy`}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href={`/ecommerce/terms`}
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
                href={`/ecommerce/help`}
                className="hover:text-white transition-colors"
              >
                Help Center
              </Link>
            </li>
            <li>
              <Link
                href={`/ecommerce/returns`}
                className="hover:text-white transition-colors"
              >
                Returns
              </Link>
            </li>
            <li>
              <Link
                href={`/ecommerce/shipping`}
                className="hover:text-white transition-colors"
              >
                Shipping
              </Link>
            </li>
            <li>
              <Link
                href={`/ecommerce/track`}
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
              const channel = String(s.channel).toLowerCase();
              const icon = iconMapper[channel] || <FaceFrownIcon className="w-5 h-5" />;
              return (
                <motion.a
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  href={`${s.url}`}
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
              href={`/ecommerce/sitemap.xml`}
              className="text-sm hover:text-white transition-colors"
            >
              Sitemap
            </Link>
            <Link
              href={`/ecommerce/faq`}
              className="text-sm hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link
              href={`/ecommerce/support`}
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
