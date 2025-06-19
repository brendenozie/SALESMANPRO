'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStoreContext } from '../../../../../contexts/StoreContext';
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const { name, slug, logoUrl, themeSettings } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || '#f97316';
  const secondaryColor = themeSettings?.secondaryColor || '#10b981';

  return (
    <footer className="bg-gray-950 text-gray-300 py-16 px-6 lg:px-12 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo & About */}
        <div className="space-y-4">
          <Link href={`/${slug}`} className="inline-block">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={160}
                height={40}
                loader={loader}
                className="object-contain"
              />
            ) : (
              <span
                className="text-2xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                {name}
              </span>
            )}
          </Link>
          <p className="text-sm text-gray-400">
            Empowering your growth with personalized services and a modern digital experience.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-white font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href={`/${slug}`} className="hover:text-white transition">Home</Link></li>
            <li><Link href={`/${slug}/projects`} className="hover:text-white transition">Projects</Link></li>
            <li><Link href={`/${slug}/about`} className="hover:text-white transition">About</Link></li>
            <li><Link href={`/${slug}/#contact`} className="hover:text-white transition">Contact</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <EnvelopeIcon className="w-4 h-4 mt-0.5 text-emerald-400" />
              <span>hello@example.com</span>
            </li>
            <li className="flex items-start gap-2">
              <PhoneIcon className="w-4 h-4 mt-0.5 text-emerald-400" />
              <span>+254 712 345 678</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 mt-0.5 text-emerald-400" />
              <span>Nairobi, Kenya</span>
            </li>
          </ul>
        </div>

        {/* Newsletter or Social */}
        <div>
          <h4 className="text-white font-semibold mb-4">Stay Connected</h4>
          <p className="text-sm text-gray-400 mb-3">
            Join our newsletter to stay updated on the latest projects and services.
          </p>
          <form className="flex items-center">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 rounded-l-md bg-gray-800 text-sm text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-medium text-white rounded-r-md transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Divider & Bottom */}
      <div className="border-t border-white/10 mt-12 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {name}. All rights reserved.
      </div>
    </footer>
  );
}
