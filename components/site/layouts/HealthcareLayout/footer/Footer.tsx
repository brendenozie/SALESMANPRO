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
      return <span className="text-xs font-bold font-mono">FB</span>;
    case 'twitter':
    case 'x':
      return <span className="text-xs font-bold font-mono">X</span>;
    case 'instagram':
      return <span className="text-xs font-bold font-mono">IG</span>;
    case 'linkedin':
      return <span className="text-xs font-bold font-mono">LN</span>;
    case 'youtube':
      return <span className="text-xs font-bold font-mono">YT</span>;
    default:
      return <EnvelopeIcon className="h-4 w-4" />;
  }
};

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name = 'Clinic Center',
    slug = 'healthcare',
    contactEmail,
    contactPhone,
    socialLinks = [],
    faqs = [],
    themeSettings,
  } = storeFormData || {};

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const primaryColor = themeSettings?.primaryColor || '#0d9488';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 4000);
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-20 pb-12 relative overflow-hidden">
      {/* Structural Accent Top Bar */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-slate-900 pb-16">
        {/* About Module */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            About {name}
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            Providing expert, personalized healthcare solutions engineered around complete patient recovery, active preventative diagnostics, and systemic vitality.
          </p>
        </div>

        {/* Dynamic Multi-tenant Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            Navigation
          </h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: 'Home', path: `/${slug}` },
              { label: 'Services', path: `/${slug}/services` },
              { label: 'Doctors', path: `/${slug}/doctors` },
              { label: 'About Us', path: `/${slug}/about` },
              { label: 'Contact Center', path: `/${slug}/contact` },
            ].map((link, idx) => (
              <li key={idx}>
                <Link 
                  href={link.path} 
                  className="hover:text-white transition-colors duration-200 flex items-center group text-slate-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-teal-500 mr-2 transition-all" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Matrix & Selective FAQs */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            Communications
          </h3>
          <ul className="space-y-3 text-sm text-slate-400">
            {contactEmail && (
              <li className="flex items-center space-x-2.5 group">
                <EnvelopeIcon className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors break-all">
                  {contactEmail}
                </a>
              </li>
            )}
            {contactPhone && (
              <li className="flex items-center space-x-2.5 group">
                <PhoneIcon className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">
                  {contactPhone}
                </a>
              </li>
            )}
          </ul>

          {faqs && faqs.length > 0 && (
            <div className="pt-4 border-t border-slate-900/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Help Center</h4>
              <ul className="space-y-1.5 text-xs">
                {faqs.slice(0, 2).map((q: any, idx: number) => (
                  <li key={idx}>
                    <Link href={`/${slug}/faqs`} className="text-slate-500 hover:text-slate-300 transition-colors line-clamp-1">
                      {q.question}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Digital Subscription & Networks */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            Updates
          </h3>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="Secure digital mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-slate-700 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider text-white uppercase transition-all duration-300 shadow-md relative overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubscribed ? 'Securely Linked' : 'Subscribe'}
            </button>
          </form>

          {socialLinks && socialLinks.length > 0 && (
            <div className="pt-2">
              <div className="flex space-x-2">
                {socialLinks.map((s: any, idx: number) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-500 hover:text-white transition-all duration-200"
                  >
                    {getIcon(s.channel.toString())}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy & Platform Attribution */}
      <div className="mt-12 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div>
          &copy; {new Date().getFullYear()} {name}. Systems secure.
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/40 rounded-xl border border-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Architecture via</span>
          <a 
            href="https://salesmanpro.site" 
            className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-500 transition-colors"
          >
            SalesmanPro.site
          </a>
        </div>
      </div>
    </footer>
  );
}