"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronUpIcon,
  FaceSmileIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/solid";
import { EditableElement } from "@/contexts/EditableContentContext";

interface AddressItem {
  label?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
}

interface SocialLink {
  channel?: string;
  url?: string;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
}

interface StoreFormData {
  slug?: string;
  name?: string;
  tagline?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  addresses?: AddressItem[];
  socialLinks?: SocialLink[] | Record<string, string>;
  themeSettings?: ThemeSettings;
}

interface FooterProps {
  storeFormData?: StoreFormData;
}

const Footer: React.FC<FooterProps> = ({ storeFormData = {} }) => {
  const {
    slug = "/",
    name = "Company Name",
    tagline,
    description,
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
    socialLinks = [],
    themeSettings = {},
  } = storeFormData;

  const primary = themeSettings.primaryColor || "#0f766e";
  const secondary = themeSettings.secondaryColor || "#3b82f6";

  // Extract up to 3 addresses for the regional showcase.
  // Fallback to legacy address data if the addresses array is empty.
  const regionalAddresses: AddressItem[] =
    addresses.length > 0
      ? addresses.slice(0, 3)
      : [
          {
            label: "Global Headquarters",
            address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
            contactPhone: contactPhone,
            contactEmail: contactEmail,
          },
        ];

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z" />
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11.75 20h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.25 12.268h-3v-5.604c0-1.337-.026-3.059-1.865-3.059-1.865 0-2.151 1.459-2.151 2.967v5.696h-3v-11h2.881v1.507h.041c.401-.761 1.381-1.562 2.841-1.562 3.039 0 3.602 2.001 3.602 4.601v6.454z" />
      </svg>
    ),
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formattedSocialLinks = Array.isArray(socialLinks)
    ? socialLinks
    : Object.entries(socialLinks).map(([channel, url]) => ({ channel, url }));

  return (
    <footer className="relative z-0 bg-white text-gray-800 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-gray-100">
          {/* Logo and About */}
          <div>
            <EditableElement
              targetId="global.global.footer.Footer.main.brandName"
              componentKey="Footer"
              elementKey="brandName"
              label="Footer Brand Name"
              defaultValue={name}
              inline
            >
              {(val) => (
                <h2 className="text-2xl font-bold mb-4 text-gray-900">{val || name}</h2>
              )}
            </EditableElement>
            <EditableElement
              targetId="global.global.footer.Footer.main.bioText"
              componentKey="Footer"
              elementKey="bioText"
              label="Brand Bio / Mission"
              defaultValue={tagline || description || "Your trusted platform for innovative digital solutions."}
              type="textarea"
            >
              {(val) => (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {val || tagline || description || "Your trusted platform for innovative digital solutions."}
                </p>
              )}
            </EditableElement>
            <div className="flex mt-5 space-x-3">
              {formattedSocialLinks.map((s, idx) => {
                const channel = String(s.channel || "").toLowerCase();
                const icon = iconMapper[channel] || <FaceSmileIcon className="w-5 h-5" />;
                if (!s.url) return null;

                return (
                  <motion.a
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-white rounded-full transition-colors"
                    style={{
                      background: `linear-gradient(135deg, ${primary}22, ${secondary}22)`,
                    }}
                  >
                    {icon}
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-600 font-medium">
              <li>
                <Link href={`/${slug}#services`} className="hover:text-gray-900 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href={`/${slug}#featured`} className="hover:text-gray-900 transition-colors">
                  Featured
                </Link>
              </li>
              <li>
                <Link href={`/${slug}#testimonials`} className="hover:text-gray-900 transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href={`/${slug}#contact`} className="hover:text-gray-900 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Endpoints */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              {contactEmail && (
                <li className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-700 flex-shrink-0" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-gray-900 transition-colors break-all">
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactPhone && (
                <li className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2 text-gray-700 flex-shrink-0" />
                  <a href={`tel:${contactPhone}`} className="hover:text-gray-900 transition-colors">
                    {contactPhone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-3">Stay updated with our latest offers.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2"
                aria-label="Enter your email"
                required
              />
              <button
                type="submit"
                style={{ backgroundColor: primary }}
                className="text-white py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Regional Multi-Locations Showcase Section */}
        {regionalAddresses.length > 0 && (
          <div className="pt-10 pb-10 border-b border-gray-100">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-6">
              Our Locations
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regionalAddresses.map((loc, idx) => {
                const mapsUrl = loc.address
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`
                  : null;

                return (
                  <div
                    key={idx}
                    className="p-5 border border-gray-200 bg-gray-50/50 rounded-xl flex flex-col justify-between space-y-4 hover:border-gray-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPinIcon className="w-4 h-4 text-gray-900 flex-shrink-0" />
                        <h6 className="text-xs font-mono font-bold uppercase text-gray-900 tracking-wider">
                          {loc.label || `Location 0${idx + 1}`}
                        </h6>
                      </div>
                      {loc.address && (
                        <p className="text-xs text-gray-600 leading-relaxed pl-6">
                          {loc.address}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-3 border-t border-gray-200/80 text-xs">
                      {loc.contactPhone && (
                        <a
                          href={`tel:${loc.contactPhone}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <PhoneIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span>{loc.contactPhone}</span>
                        </a>
                      )}

                      {loc.contactEmail && (
                        <a
                          href={`mailto:${loc.contactEmail}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors truncate"
                        >
                          <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{loc.contactEmail}</span>
                        </a>
                      )}

                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 hover:text-emerald-600 transition-colors pt-1"
                        >
                          <span>Get Directions</span>
                          <ArrowUpRightIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scroll to Top */}
        <div className="flex justify-end mt-6">
          <button
            onClick={scrollToTop}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2.5 rounded-full transition-colors"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ChevronUpIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Base */}
        <div className="border-t border-gray-100 mt-6 pt-6 text-sm text-center text-gray-500">
          <EditableElement
            targetId="global.global.footer.Footer.main.copyrightText"
            componentKey="Footer"
            elementKey="copyrightText"
            label="Copyright Text"
            defaultValue={`© ${new Date().getFullYear()} ${name}. All rights reserved.`}
            inline
          >
            {(val) => (
              <span>{val || `© ${new Date().getFullYear()} ${name}. All rights reserved.`}</span>
            )}
          </EditableElement>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-4 py-2 mt-2 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Powered by
        </span>
        <a
          href="https://salesmanpro.site"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
      </div>
    </footer>
  );
};

export default Footer;