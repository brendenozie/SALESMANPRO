'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

interface AddressItem {
  label?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { storeFormData } = useStoreContext();

  const {
    name,
    description,
    socialLinks,
    contactPhone,
    contactEmail,
    themeSettings,
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase.
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses: AddressItem[] =
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

  // Normalize socialLinks to a map if it's an array or object
  const socialLinksMap: Record<string, string | false> = Array.isArray(socialLinks)
    ? (socialLinks as any[]).reduce((acc: Record<string, string | false>, item: any) => {
        if (item?.platform) acc[item.platform] = item.url ?? false;
        return acc;
      }, {})
    : (socialLinks || {});

  const defaultSocialLinks = {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    whatsapp: `https://wa.me/${(contactPhone || '254712345678').replace(/[^0-9]/g, '')}`,
  };

  const getSocialLink = (platform: keyof typeof defaultSocialLinks) =>
    (socialLinksMap as any)?.[platform] || defaultSocialLinks[platform];

  return (
    <footer className="relative bg-gray-50 text-gray-800 pt-16 pb-10 px-6 overflow-hidden border-t border-gray-100">
      {/* Background Glow */}
      <div
        className="absolute inset-0 -z-10 opacity-5"
        style={{
          backgroundImage: 'url(/images/footer-texture-light.svg)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />

      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Column 1: Brand Info & Socials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-between"
          >
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
                {name || 'Your Brand'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {description ||
                  'Delivering excellence and tailored solutions for your lifestyle and business needs.'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Connect With Us
              </p>
              <div className="flex items-center gap-3 text-gray-500">
                {socialLinksMap?.facebook !== false && (
                  <a
                    href={getSocialLink('facebook')}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="p-2.5 rounded-full bg-white shadow-sm border border-gray-200 hover:text-emerald-600 hover:border-emerald-500 transition-all transform hover:-translate-y-1"
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
                    className="p-2.5 rounded-full bg-white shadow-sm border border-gray-200 hover:text-emerald-600 hover:border-emerald-500 transition-all transform hover:-translate-y-1"
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
                    className="p-2.5 rounded-full bg-white shadow-sm border border-gray-200 hover:text-emerald-600 hover:border-emerald-500 transition-all transform hover:-translate-y-1"
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
                    className="p-2.5 rounded-full bg-white shadow-sm border border-gray-200 hover:text-emerald-600 hover:border-emerald-500 transition-all transform hover:-translate-y-1"
                  >
                    <WhatsappIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-bold mb-5 text-gray-900">Quick Links</h4>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>
                <Link href="#services" className="hover:text-emerald-600 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#benefits" className="hover:text-emerald-600 transition-colors">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-emerald-600 transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-emerald-600 transition-colors">
                  FAQs
                </Link></li>
            </ul>
          </motion.div>

          {/* Column 3: Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold mb-5 text-gray-900">Support</h4>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>
                <Link href="#contact" className="hover:text-emerald-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-emerald-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#livechat" className="hover:text-emerald-600 transition-colors">
                  Live Chat
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 4: Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-bold mb-5 text-gray-900">Stay Updated</h4>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Join our mailing list for exclusive offers, updates, and news directly to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2.5">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors shadow-sm"
                aria-label="Email for newsletter"
                required
              />
              <motion.button
                type="submit"
                className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                whileHover={{ scale: 1.02, boxShadow: `0 8px 20px ${primaryColor}33` }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Dynamic Multi-Location Showcase Section */}
        {regionalAddresses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-10 border-t border-gray-200"
          >
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
              Our Locations & Contact Details
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionalAddresses.map((loc, idx) => {
                const mapUrl = loc.address
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      loc.address
                    )}`
                  : null;

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2.5 text-emerald-600">
                        <MapPinIcon className="w-5 h-5 flex-shrink-0" />
                        <h6 className="font-bold text-gray-900 text-base">
                          {loc.label || `Branch ${idx + 1}`}
                        </h6>
                      </div>

                      {loc.address && (
                        <p className="text-gray-600 text-xs leading-relaxed mb-4 pl-7">
                          {loc.address}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                      {loc.contactPhone && (
                        <a
                          href={`tel:${loc.contactPhone}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
                        >
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <span>{loc.contactPhone}</span>
                        </a>
                      )}

                      {loc.contactEmail && (
                        <a
                          href={`mailto:${loc.contactEmail}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors truncate"
                        >
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{loc.contactEmail}</span>
                        </a>
                      )}

                      {mapUrl && (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold pt-1 transition-colors"
                        >
                          <span>Get Directions</span>
                          <ArrowTopRightIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Footer Bottom / Copyright */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>&copy; {year} {name || 'Your Brand'}. All rights reserved.</p>
          <p className="text-orange-600 font-medium">
            powered by{' '}
            <a
              href="https://salesmanpro.site"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-semibold text-orange-600"
            >
              salesmanpro.site
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// --- Inline Hero Icons ---
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ArrowTopRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

// --- Social Icons ---
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm6.406-11.845a1.162 1.162 0 100 2.324 1.162 1.162 0 000-2.324z" clipRule="evenodd" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-1.785-.881-2.062-.981-.276-.101-.478-.15-.678.15-.201.301-.777.981-.954 1.182-.176.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.897-.798-1.503-1.784-1.679-2.085-.176-.301-.019-.464.13-.613.135-.133.301-.351.451-.527.151-.176.201-.301.302-.502.101-.201.05-.376-.025-.527-.075-.15-.678-1.633-.929-2.235-.244-.585-.494-.505-.678-.515-.176-.008-.376-.01-.576-.01-.201 0-.527.075-.802.376-.276.301-1.053 1.029-1.053 2.511 0 1.482 1.078 2.912 1.229 3.113.151.201 2.122 3.24 5.141 4.542.718.31 1.279.495 1.716.634.721.23 1.378.197 1.9.12.582-.087 1.785-.728 2.036-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.226-.577-.377z" />
  </svg>
);