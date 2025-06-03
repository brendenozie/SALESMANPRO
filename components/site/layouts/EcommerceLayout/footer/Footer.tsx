// File: components/site/Footer.tsx
'use client';

import React from 'react';
import { FaceSmileIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useStoreContext } from '../../../../../contexts/StoreContext';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    slug,
    name,
    description,
    socialLinks,
  } = storeFormData;

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-12">
        {/* About Us */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">About Us</h3>
          <p className="text-sm leading-relaxed text-gray-400">
            {description ||
              'Discover everything you need from our trusted marketplace. Fast delivery, great deals, and top-notch service—trusted by thousands every day.'}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`/site/${slug}/about`}
                className="hover:text-white transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a
                href={`/site/${slug}/contact`}
                className="hover:text-white transition-colors"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href={`/site/${slug}/privacy`}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href={`/site/${slug}/terms`}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Customer Care</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`/site/${slug}/help`}
                className="hover:text-white transition-colors"
              >
                Help Center
              </a>
            </li>
            <li>
              <a
                href={`/site/${slug}/returns`}
                className="hover:text-white transition-colors"
              >
                Returns
              </a>
            </li>
            <li>
              <a
                href={`/site/${slug}/shipping`}
                className="hover:text-white transition-colors"
              >
                Shipping
              </a>
            </li>
            <li>
              <a
                href={`/site/${slug}/track`}
                className="hover:text-white transition-colors"
              >
                Track Order
              </a>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            {socialLinks.map((s,index) => (
              <motion.a
                key={index}
                whileHover={{ scale: 1.1 }}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full"
              >
                <FaceSmileIcon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {name}. All rights reserved.
      </div>
    </footer>
  );
}
