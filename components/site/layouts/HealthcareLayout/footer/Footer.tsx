// File: components/site/Footer.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';


const getIcon = (channel: string) => {
  switch (channel.toLowerCase()) {
    case 'facebook':
      return <PhoneIcon className="h-5 w-5" />;
    case 'twitter':
      return <PhoneIcon className="h-5 w-5" />;
    case 'instagram':
      return <PhoneIcon className="h-5 w-5" />;
    case 'linkedin':
      return <PhoneIcon className="h-5 w-5" />;
    case 'youtube':
      return <PhoneIcon className="h-5 w-5" />;
    default:
      return <EnvelopeIcon className="h-5 w-5" />;
  }
};

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    contactEmail,
    contactPhone,
    socialLinks,
    faqs,
  } = storeFormData || {};

  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Subscribed: ${email}`);
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-12">
        {/* About Section */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">About {name}</h3>
          <p className="text-sm leading-relaxed text-gray-400">
            {`WellSpring Clinic offers top-tier healthcare services, personalized treatment plans, and compassionate care. Our dedicated team of specialists is here to support your health journey.`}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={`/`} className="hover:text-white transition-colors">Home
              </Link>
            </li>
            <li>
              <Link href={`/healthcare/services`} className="hover:text-white transition-colors">Services
              </Link>
            </li>
            <li>
              <Link href={`/healthcare/doctors`} className="hover:text-white transition-colors">Doctors
              </Link>
            </li>
            <li>
              <Link href={`/healthcare/about`}  className="hover:text-white transition-colors">About Us
              </Link>
            </li>
            <li>
              <Link href={`/healthcare/contact`} className="hover:text-white transition-colors">Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & FAQs */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            {contactEmail && (
              <li className="flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5 text-teal-400" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </li>
            )}
            {contactPhone && (
              <li className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-teal-400" />
                <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">
                  {contactPhone}
                </a>
              </li>
            )}
          </ul>

          {faqs && faqs.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-white mt-8 mb-4">FAQs</h3>
              <ul className="space-y-2 text-sm">
                {faqs.slice(0, 3).map((q: any, idx: number) => (
                  <li key={idx}>
                    <Link href={`/healthcare/faqs`} className="hover:text-white transition-colors">{q.question}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Newsletter & Social */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Newsletter</h3>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-4">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 text-gray-200 placeholder-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center bg-teal-500 hover:bg-teal-600 px-6 py-2 rounded-lg text-white font-semibold shadow-lg transition"
            >
              Subscribe
            </motion.button>
          </form>

          {socialLinks && socialLinks.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-white mt-8 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((s, idx) => (
                  <motion.a
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full text-gray-400 hover:text-white transition"
                  >
                    {getIcon(s.channel.toString())}
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
      <div className="flex items-center gap-1.5 px-4 py-2 mt-4 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
    </div>

    </footer>
  );
}
