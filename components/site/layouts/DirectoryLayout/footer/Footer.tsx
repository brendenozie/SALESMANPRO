import React from 'react';
import { 
  FaceSmileIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Type definitions
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

interface StoreAddress {
  label?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  isMain?: boolean;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  addresses?: StoreAddress[];
  // themeSettings
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface FooterProps {
  storeFormData: Store;
}

const Footer: React.FC<FooterProps> = ({ storeFormData }) => {
  const {
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
    socialLinks = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase. 
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        isMain: true
      }];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 border-b border-gray-700 pb-12">

        {/* About Us (3 cols) */}
        <div className="lg:col-span-3">
          <h3 className="text-xl font-semibold text-white mb-4">About Us</h3>
          <p className="text-sm leading-relaxed text-gray-400 mb-6">
            {storeFormData?.description || "Discover everything you need from our trusted marketplace. Fast delivery, great deals, and top-notch service—trusted by thousands every day."}
          </p>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Connect With Us</h4>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s, idx) => (
                  <motion.a 
                    key={idx}
                    whileHover={{ scale: 1.08 }} 
                    href={s.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    title={s.channel}
                  >
                    <FaceSmileIcon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Links (2 cols) */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/directorylistings/about" className="hover:text-white transition-colors">About</a></li>
            <li><a href="/directorylistings/contact" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="/directorylistings/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="/directorylistings/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Customer Care (2 cols) */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-4">Customer Care</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/directorylistings/help" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="/directorylistings/returns" className="hover:text-white transition-colors">Returns</a></li>
            <li><a href="/directorylistings/shipping" className="hover:text-white transition-colors">Shipping</a></li>
            <li><a href="/directorylistings/track" className="hover:text-white transition-colors">Track Order</a></li>
          </ul>
        </div>

        {/* Regional Locations & Contact Info (5 cols) */}
        <div className="lg:col-span-5">
          <h3 className="text-xl font-semibold text-white mb-4">Our Locations</h3>
          <div className="space-y-3">
            {regionalAddresses.map((loc, idx) => {
              const label = loc?.label || (idx === 0 ? "Main Office" : `Branch ${idx + 1}`);
              const fullAddress = typeof loc === "string" ? loc : loc?.address;
              const phone = loc?.contactPhone || contactPhone;
              const emailAddr = loc?.contactEmail || contactEmail;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || "")}`;

              return (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-xl bg-gray-800/60 border border-gray-700/60 hover:border-gray-600 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        {label}
                      </span>
                      {(loc?.isMain || idx === 0) && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-600/20 text-orange-400 border border-orange-500/30 uppercase">
                          HQ
                        </span>
                      )}
                    </div>
                    {fullAddress && (
                      <a 
                        href={mapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[11px] text-gray-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
                        title="View address on Google Maps"
                      >
                        <span>Map</span>
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {fullAddress && (
                    <div className="flex items-start gap-2 text-xs text-gray-400">
                      <MapPinIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{fullAddress}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-gray-700/50 text-xs text-gray-400">
                    {phone && (
                      <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>{phone}</span>
                      </a>
                    )}
                    {emailAddr && (
                      <a href={`mailto:${emailAddr}`} className="flex items-center gap-1.5 hover:text-orange-400 transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">{emailAddr}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {storeFormData?.name}. All rights reserved.
      </div>

      {/* Powered by Badge */}
      <div className="flex items-center gap-1.5 px-4 py-2 mt-6 border border-stone-800/50 rounded-full bg-stone-900/50 backdrop-blur-sm text-center mx-auto w-max">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-500 transition-colors"
        >
          SalesmanPro.site
        </a>
      </div>

    </footer>
  );
};

export default Footer;