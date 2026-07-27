'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { storeFormData } = useStoreContext();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const {
    name,
    description,
    socialLinks,
    contactPhone,
    themeSettings,
    contactEmail,
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase.
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses =
    addresses?.length > 0
      ? addresses.slice(0, 3)
      : [
          {
            label: 'Global Headquarters',
            address: legacyAddress || 'Lusingeti Road, Number 31, Industrial Area, Nairobi',
            contactPhone: contactPhone,
            contactEmail: contactEmail,
          },
        ];

  const primaryColor = themeSettings?.primaryColor || '#00A880';

  // Normalize socialLinks to a key-value record map
  const socialLinksMap: Record<string, string | false> = Array.isArray(socialLinks)
    ? (socialLinks as any[]).reduce((acc, item) => {
        if (item?.platform) acc[item.platform] = item.url ?? false;
        return acc;
      }, {})
    : socialLinks || {};

  const defaultSocialLinks = {
    facebook: 'https://facebook.com/yourpage',
    instagram: 'https://instagram.com/yourpage',
    twitter: 'https://twitter.com/yourpage',
    whatsapp: `https://wa.me/${contactPhone?.replace(/[^0-9]/g, '') || '254712345678'}`,
  };

  const getSocialLink = (platform: keyof typeof defaultSocialLinks) =>
    (socialLinksMap as any)?.[platform] || defaultSocialLinks[platform];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative bg-gray-50 text-gray-800 pt-16 pb-10 px-6 overflow-hidden border-t border-gray-200">
      {/* Background Texture Overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/footer-texture-light.svg)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 relative z-10">
        
        {/* Brand & Socials Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-4 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-2xl font-black tracking-tight text-gray-900 mb-3">
              {name || 'Your Brand'}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {description ||
                'Delivering top-tier services and quality experiences. Reach out or visit our local centers for dedicated support.'}
            </p>
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Connect With Us
            </span>
            <div className="flex gap-3 text-gray-500">
              {socialLinksMap?.facebook !== false && (
                <a
                  href={getSocialLink('facebook')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-2.5 rounded-full bg-white border border-gray-200 hover:text-emerald-600 hover:border-emerald-600 transition-all transform hover:scale-110 shadow-sm"
                >
                  <FacebookIcon className="w-5 h-5" />
                </a>
              )}
              {socialLinksMap?.instagram !== false && (
                <a
                  href={getSocialLink('instagram')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2.5 rounded-full bg-white border border-gray-200 hover:text-emerald-600 hover:border-emerald-600 transition-all transform hover:scale-110 shadow-sm"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              )}
              {socialLinksMap?.twitter !== false && (
                <a
                  href={getSocialLink('twitter')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="p-2.5 rounded-full bg-white border border-gray-200 hover:text-emerald-600 hover:border-emerald-600 transition-all transform hover:scale-110 shadow-sm"
                >
                  <TwitterIcon className="w-5 h-5" />
                </a>
              )}
              {socialLinksMap?.whatsapp !== false && (
                <a
                  href={getSocialLink('whatsapp')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="p-2.5 rounded-full bg-white border border-gray-200 hover:text-emerald-600 hover:border-emerald-600 transition-all transform hover:scale-110 shadow-sm"
                >
                  <WhatsappIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Dynamic Addresses Showcase Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="lg:col-span-3"
        >
          <h4 className="text-lg font-bold mb-4 text-gray-900">Our Locations</h4>
          <div className="space-y-4">
            {regionalAddresses.map((loc: any, idx: number) => {
              const formattedAddr = typeof loc === 'string' ? loc : loc?.address;
              const title = loc?.label || (idx === 0 ? 'Main Office' : `Branch ${idx + 1}`);
              const phone = loc?.contactPhone || contactPhone;
              const emailAddr = loc?.contactEmail || contactEmail;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-sm text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">{title}</span>
                    {formattedAddr && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          formattedAddr
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <MapPinIcon className="w-3.5 h-3.5" /> Directions
                      </a>
                    )}
                  </div>
                  {formattedAddr && <p className="text-gray-600 leading-snug">{formattedAddr}</p>}
                  <div className="pt-1 flex flex-wrap gap-x-3 gap-y-1 text-gray-500 font-mono text-[11px]">
                    {phone && (
                      <a href={`tel:${phone}`} className="hover:text-emerald-600">
                        📞 {phone}
                      </a>
                    )}
                    {emailAddr && (
                      <a href={`mailto:${emailAddr}`} className="hover:text-emerald-600 truncate max-w-[180px]">
                        ✉️ {emailAddr}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Links & Support Navigation Columns */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-bold mb-4 text-gray-900">Explore</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="#services" className="hover:text-emerald-600 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#benefits" className="hover:text-emerald-600 transition-colors">
                  Why Us
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-emerald-600 transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-emerald-600 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-bold mb-4 text-gray-900">Support</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="#contact" className="hover:text-emerald-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-600 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-emerald-600 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#livechat" className="hover:text-emerald-600 transition-colors">
                  Live Chat
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Subscription Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="lg:col-span-3"
        >
          <h4 className="text-lg font-bold mb-4 text-gray-900">Stay Updated</h4>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            Subscribe for exclusive offers, updates, and news direct to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors shadow-sm"
                aria-label="Email address for newsletter"
              />
            </div>
            <motion.button
              type="submit"
              className="w-full py-2.5 px-5 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ backgroundColor: primaryColor }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {subscribed ? '✓ Subscribed!' : 'Subscribe'}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 max-w-7xl mx-auto relative z-10 gap-3">
        <div>
          &copy; {year} <span className="font-semibold text-gray-700">{name || 'Your Brand'}</span>.
          All rights reserved.
        </div>
        <div className="text-gray-500">
          Powered by{' '}
          <a
            href="https://salesmanpro.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 font-semibold hover:underline"
          >
            salesmanpro.site
          </a>
        </div>
      </div>
    </footer>
  );
}

/* --- Helper SVG Icons --- */

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.71 1.462h.005c6.554 0 11.89-5.335 11.893-11.892a11.821 11.821 0 00-3.488-8.413" />
  </svg>
);