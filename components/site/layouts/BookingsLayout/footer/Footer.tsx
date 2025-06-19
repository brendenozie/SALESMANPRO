'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-950 text-white pt-16 pb-10 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-black via-gray-900 to-gray-950" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Tagline */}
        <div>
          <h3 className="text-2xl font-bold text-rose-500">Ducun Vijed</h3>
          <p className="mt-4 text-gray-400 text-sm max-w-xs">
            Your gateway to personalized, on-demand wellness. Book your perfect massage, anytime.
          </p>
          <div className="flex gap-4 mt-6 text-rose-400">
            <a href="#" aria-label="Facebook">
              <FaceFrownIcon className="hover:text-white transition" />
            </a>
            <a href="#" aria-label="Instagram">
              <FaceFrownIcon className="hover:text-white transition" />
            </a>
            <a href="#" aria-label="Twitter">
              <FaceFrownIcon className="hover:text-white transition" />
            </a>
            <a href="https://wa.me/254712345678" target="_blank" aria-label="WhatsApp">
              <FaceFrownIcon className="hover:text-white transition" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="#services" className="hover:text-white transition">Services</Link></li>
            <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
            <li><Link href="#testimonials" className="hover:text-white transition">Testimonials</Link></li>
            <li><Link href="#faq" className="hover:text-white transition">FAQs</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="#contact" className="hover:text-white transition">Contact Us</Link></li>
            <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-white transition">Live Chat</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Stay Updated</h4>
          <p className="text-gray-400 text-sm mb-4">
            Join our mailing list for updates & exclusive offers.
          </p>
          <form className="flex items-center space-x-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-full bg-white/10 text-white placeholder-gray-400 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-sm font-semibold rounded-full transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm text-gray-500">
        &copy; {year} Ducun Vijed. All rights reserved.
      </div>
    </footer>
  );
}
