// File: components/site/Footer.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { EditableElement } from '@/contexts/EditableContentContext';

interface AddressItem {
  label?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
}

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
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the locations section.
  // Fallback to legacy address structure if the array is empty.
  const regionalAddresses: AddressItem[] = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Primary Location",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail
      }];

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

      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-slate-900 pb-16">
          {/* About Module */}
          <div className="space-y-4">
            <EditableElement
              targetId="global.global.footer.Footer.main.brandName"
              componentKey="Footer"
              elementKey="brandName"
              label="Brand Name"
              defaultValue={name}
              inline
            >
              {(val) => (
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                  About {val}
                </h3>
              )}
            </EditableElement>
            <EditableElement
              targetId="global.global.footer.Footer.main.bioText"
              componentKey="Footer"
              elementKey="bioText"
              label="Brand Bio"
              defaultValue="Providing expert, personalized healthcare solutions engineered around complete patient recovery, active preventative diagnostics, and systemic vitality."
            >
              {(val) => (
                <p className="text-sm leading-relaxed text-slate-400">
                  {val}
                </p>
              )}
            </EditableElement>
          </div>

          {/* Quick Navigation */}
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

          {/* Direct Communications & FAQs */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Communications
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {contactEmail && (
                <li className="flex items-center space-x-2.5 group">
                  <EnvelopeIcon className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors break-all">
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactPhone && (
                <li className="flex items-center space-x-2.5 group">
                  <PhoneIcon className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
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

          {/* Digital Subscription & Social Networks */}
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
                      title={s.channel}
                    >
                      <GlobeAltIcon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Locations Showcase */}
        {regionalAddresses.length > 0 && (
          <div className="border-b border-slate-900 pb-16">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-2">
              <BuildingOfficeIcon className="h-4 w-4 text-slate-500" />
              Our Locations & Support Hubs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionalAddresses.map((loc, idx) => {
                const fullAddressString = [loc.address, loc.city, loc.state, loc.zip, loc.country]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div 
                    key={idx} 
                    className="p-5 bg-slate-900/50 border border-slate-900 rounded-2xl space-y-3 hover:border-slate-800 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        {loc.label || `Branch ${idx + 1}`}
                      </span>
                      {fullAddressString && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressString)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                        >
                          <MapPinIcon className="h-3 w-3" /> Get Directions
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {fullAddressString || "Address detail pending"}
                    </p>

                    {(loc.contactPhone || loc.contactEmail) && (
                      <div className="pt-2 border-t border-slate-800/60 space-y-1.5 text-xs text-slate-400">
                        {loc.contactPhone && (
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <a href={`tel:${loc.contactPhone}`} className="hover:text-white transition-colors">
                              {loc.contactPhone}
                            </a>
                          </div>
                        )}
                        {loc.contactEmail && (
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <a href={`mailto:${loc.contactEmail}`} className="hover:text-white transition-colors break-all">
                              {loc.contactEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Copy & Platform Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <EditableElement
            targetId="global.global.footer.Footer.main.copyrightText"
            componentKey="Footer"
            elementKey="copyrightText"
            label="Copyright Notice"
            defaultValue={`${name}. Systems secure.`}
            inline
          >
            {(val) => (
              <div>
                &copy; {new Date().getFullYear()} {val}
              </div>
            )}
          </EditableElement>
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

      </div>
    </footer>
  );
}