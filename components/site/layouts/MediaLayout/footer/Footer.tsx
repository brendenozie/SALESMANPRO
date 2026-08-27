'use client';

import React from "react";
import { motion } from "framer-motion";
import { useStoreContext } from "@/contexts/StoreContext";
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon 
} from "@heroicons/react/24/solid";

// --- TypeScript Interfaces ---
interface StoreAddress {
  id?: string | number;
  label?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPrimary?: boolean;
}

interface Category {
  id: number | string;
  name?: string;
  displayName?: string;
  slug?: string;
  categoryId?: number | string;
}

interface SocialLink {
  channel: string;
  url: string;
}

interface StoreFormData {
  name?: string;
  slug?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  addresses?: StoreAddress[];
  categories?: Category[];
  StoreCategory?: Category[];
  socialLinks?: SocialLink[];
}

// Simple internal NavLink helper
const NavLink: React.FC<{ href: string; className?: string; children: React.ReactNode }> = ({ 
  href, 
  className = "", 
  children 
}) => (
  <a href={href} className={className}>
    {children}
  </a>
);

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const { storeFormData } = useStoreContext() as { storeFormData?: StoreFormData };

  const {
    name = "CorpTech",
    description = "Driving digital transformation through expert consulting, innovative technology, and actionable insights for global enterprises.",
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
    socialLinks = [],
  } = storeFormData || {};

  // Extract industries / categories safely from either schema model
  const categoryList = storeFormData?.categories?.length 
    ? storeFormData.categories 
    : storeFormData?.StoreCategory || [];

  // Normalize multi-address array with fallback to single legacy address
  const displayedAddresses: StoreAddress[] = addresses.length > 0 
    ? addresses 
    : [{
        id: "primary-fallback",
        label: "Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        isPrimary: true
      }];

  // Social Icon Renderer
  const renderSocialIcon = (channel: string) => {
    const size = "w-5 h-5";
    const normalized = channel.toLowerCase();

    switch (normalized) {
      case "facebook":
        return (
          <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22C17.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
        );
      case "twitter":
      case "x":
        return (
          <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.901 1.153h3.682l-8.337 9.851L24 22.842h-8.086l-6.071-7.234-5.617 7.234H.092l8.59-10.138L.092 1.153h8.336l5.357 6.417 4.216-6.417zM16.945 20.843h2.396L6.501 3.25H4.07z" />
          </svg>
        );
      case "instagram":
        return (
          <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.685.007 3.62.052.836.042 1.464.184 1.965.378.52.204.996.48 1.41.894.414.414.69.89.893 1.41.194.5.336 1.13.378 1.965.045.935.051 1.19.051 3.62 0 2.43-.006 2.685-.051 3.62-.042.836-.184 1.464-.378 1.965-.204.52-.48 1.002-.894 1.415-.414.414-.89.69-1.41.893-.5.194-1.13.336-1.965.378-.935.045-1.19.051-3.62.051-2.43 0-2.685-.006-3.62-.051-.836-.042-1.464-.184-1.965-.378-.52-.204-.996-.48-1.41-.894-.414-.414-.69-.89-.893-1.41-.194-.5-.336-1.13-.378-1.965-.045-.935-.051-1.19-.051-3.62 0-2.43.006-2.685.051-3.62.042-.836.184-1.464.378-1.965.204-.52.48-.996.894-1.41.414-.414.89-.69 1.41-.893.5-.194 1.13-.336 1.965-.378.935-.045 1.19-.051 3.62-.051zm0-2c-2.727 0-3.071.01-4.125.06-1.07.05-1.79.215-2.42.465-.675.275-1.22.6-1.85.83-.5.23-1.17.43-1.61.875-.44.445-.645 1.115-.875 1.61-.23.63-.395 1.35-.465 2.42-.05 1.054-.06 1.398-.06 4.125 0 2.727.01 3.071.06 4.125.05 1.07.215 1.79.465 2.42.275.675.6 1.22.83 1.85.23.5.43 1.17.875 1.61.445.44.75 1.015 1.01 1.61.26.6.435 1.22.465 2.01.03.79.06 1.49.06 4.125h-2c-2.6 0-2.95-.01-4-.06-1-.05-1.65-.2-2.32-.45-.7-.3-1.3-.65-1.98-1.04-.68-.4-1.3-.85-1.74-1.45-.44-.6-.79-1.3-.92-1.98-.13-.68-.2-1.37-.2-4.125h-2c0-2.6.01-2.95.06-4 .05-1 .2-1.65.45-2.32.3-.7.65-1.3 1.04-1.98.4-.68.85-1.3 1.45-1.74.6-.44 1.3-.79 1.98-.92.68-.13 1.37-.2 4.125-.2h2c2.6 0 2.95.01 4 .06 1 .05 1.65.2 2.32.45.7.3 1.3.65 1.98 1.04.68.4 1.3.85 1.74 1.45.44.6.79 1.3.92 1.98.13.68.2 1.37.2 4.125h2c0-2.6-.01-2.95-.06-4-.05-1-.2-1.65-.45-2.32-.3-.7-.65-1.3-1.04-1.98-.4-.68-.85-1.3-1.45-1.74-.6-.44-1.3-.79-1.98-.92-.68-.13-1.37-.2-4.125-.2zM12 9a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 110 2 1 1 0 010-2z" />
          </svg>
        );
      case "linkedin":
        return (
          <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.567-4 0v5.604h-3v-11h3v1.765c1.396-2.423 7-2.215 7 3.515v5.72z" />
          </svg>
        );
      case "youtube":
        return (
          <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21.583 7.179c-.232-.862-1.066-1.25-2.147-1.317C17.781 5.768 12 5.768 12 5.768s-5.781 0-7.436.094c-1.08.067-1.916.455-2.147 1.317C2.188 8.871 2.062 12 2.062 12s.126 3.129.357 4.821c.231.862 1.066 1.25 2.147 1.317C6.219 18.232 12 18.232 12 18.232s5.781 0 7.436-.094c1.08-.067 1.916-.455 2.147-1.317.231-1.692.357-4.821.357-4.821s-.126-3.129-.357-4.821zm-11.233 7.821V9.018l4.434 3.091-4.434 3.091z" />
          </svg>
        );
      default:
        return (
          <div className={`p-1 border border-current rounded-full ${size} flex items-center justify-center text-xs font-bold uppercase`}>
            {channel.charAt(0)}
          </div>
        );
    }
  };

  return (
    <footer className="bg-slate-50 text-slate-700 pt-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pb-12">
        {/* Upper Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-slate-200 pb-12">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {name}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          </div>

          {/* Industries / Categories */}
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-4 tracking-wide uppercase text-xs">
              Industries
            </h4>
            <ul className="space-y-3 text-sm">
              {categoryList.slice(0, 5).map((cat, idx) => {
                const title = cat.displayName || cat.name || "Category";
                const catId = cat.categoryId || cat.id || idx;
                return (
                  <li key={catId}>
                    <NavLink
                      href={`/media/industries/${catId}`}
                      className="text-slate-600 hover:text-indigo-600 transition-colors duration-150"
                    >
                      {title}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-4 tracking-wide uppercase text-xs">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <NavLink href="/" className="text-slate-600 hover:text-indigo-600 transition-colors duration-150">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink href="/media/solutions" className="text-slate-600 hover:text-indigo-600 transition-colors duration-150">
                  Solutions
                </NavLink>
              </li>
              <li>
                <NavLink href="/media/insights" className="text-slate-600 hover:text-indigo-600 transition-colors duration-150">
                  Insights
                </NavLink>
              </li>
              <li>
                <NavLink href="/media/about" className="text-slate-600 hover:text-indigo-600 transition-colors duration-150">
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink href="/media/contact" className="text-slate-600 hover:text-indigo-600 transition-colors duration-150">
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Connect & Legal */}
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-4 tracking-wide uppercase text-xs">
              Connect
            </h4>
            {socialLinks.length > 0 && (
              <div className="flex items-center space-x-4 mb-8">
                {socialLinks.map((s) => (
                  <motion.a
                    key={s.channel}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.15, color: "#4F46E5" }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="text-slate-500 hover:text-indigo-600 transition-colors"
                    aria-label={`Follow us on ${s.channel}`}
                  >
                    {renderSocialIcon(s.channel)}
                  </motion.a>
                ))}
              </div>
            )}

            <h4 className="text-base font-bold text-slate-900 mb-4 tracking-wide uppercase text-xs">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <NavLink href="/media/privacy" className="text-slate-600 hover:text-indigo-600 transition-colors duration-150">
                  Privacy Policy
                </NavLink>
              </li>
              <li>
                <NavLink href="/media/terms" className="text-slate-600 hover:text-indigo-600 transition-colors duration-150">
                  Terms of Service
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Dynamic Addresses Showcase Section */}
        {displayedAddresses.length > 0 && (
          <div className="pt-10 pb-4 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-center sm:text-left">
              Our Locations & Contacts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedAddresses.map((addr, index) => (
                <div 
                  key={addr.id || index}
                  className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-3"
                >
                  <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm">
                    <BuildingOfficeIcon className="w-4 h-4 shrink-0 text-indigo-500" />
                    <span>{addr.label || `Office ${index + 1}`}</span>
                  </div>

                  {addr.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(addr.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start space-x-2.5 text-xs text-slate-600 hover:text-indigo-600 transition-colors group"
                    >
                      <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 text-slate-400 group-hover:text-indigo-600" />
                      <span className="leading-relaxed">{addr.address}</span>
                    </a>
                  )}

                  {addr.contactPhone && (
                    <a
                      href={`tel:${addr.contactPhone}`}
                      className="flex items-center space-x-2.5 text-xs text-slate-600 hover:text-indigo-600 transition-colors group"
                    >
                      <PhoneIcon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-indigo-600" />
                      <span>{addr.contactPhone}</span>
                    </a>
                  )}

                  {addr.contactEmail && (
                    <a
                      href={`mailto:${addr.contactEmail}`}
                      className="flex items-center space-x-2.5 text-xs text-slate-600 hover:text-indigo-600 transition-colors group"
                    >
                      <EnvelopeIcon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-indigo-600" />
                      <span className="truncate">{addr.contactEmail}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {year} {name}. All rights reserved.
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
            <a 
              href="https://salesmanpro.site" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
            >
              SalesmanPro.site
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;