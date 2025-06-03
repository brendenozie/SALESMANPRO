// File: components/site/Footer.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { FaceSmileIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '../../../../../contexts/StoreContext';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const { name, slug, description, socialLinks } = storeFormData;
  const [email, setEmail] = useState('');

  const navItems = [
    { label: 'Home', href: `/${slug}` },
    { label: 'Blog', href: `/${slug}/blog` },
    { label: 'About', href: `/${slug}/about` },
    { label: 'Contact', href: `/${slug}/contact` },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: integrate real subscription logic here
    alert(`Thanks for subscribing: ${email}`);
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-700 pb-12">
        {/* About */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">About {name}</h3>
          <p className="text-sm leading-relaxed text-gray-400">
            {description ||
              'Delivering quality insights and content to keep you informed and inspired. Stay connected for more updates.'}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-white transition-colors">{item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter & Social */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Stay in the Loop</h3>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-4">
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 text-gray-200 placeholder-gray-500 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg text-white font-semibold shadow-lg transition"
            >
              Subscribe
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </motion.button>
          </form>

          {socialLinks.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((link:any) => (
                  <motion.a
                    key={link.channel}
                    whileHover={{ scale: 1.1 }}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full text-gray-400 hover:text-white transition"
                  >
                    <FaceSmileIcon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {name}. All rights reserved.
      </div>
    </footer>
  );
}
