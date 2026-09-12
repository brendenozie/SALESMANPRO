"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";
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

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const {
    name = "Company Name",
    description,
    logoUrl,
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
    socialLinks = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase.
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses: AddressItem[] =
    addresses?.length > 0
      ? addresses.slice(0, 3)
      : [
          {
            label: "Global Headquarters",
            address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
            contactPhone: contactPhone,
            contactEmail: contactEmail,
          },
        ];

  const navLinks = [
    { label: "Home", href: `/` },
    { label: "Destinations", href: `/#destinations` },
    { label: "Tours", href: `/#tours` },
    { label: "About", href: `/#about` },
    { label: "Contact", href: `/#contact` },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Subscribed: ${newsletterEmail}`);
    setNewsletterEmail("");
  };

  const formattedSocialLinks: SocialLink[] = Array.isArray(socialLinks)
    ? socialLinks
    : Object.entries(socialLinks || {}).map(([channel, url]) => ({
        channel,
        url: String(url),
      }));

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 pb-12">
        {/* About & Logo */}
        <div className="space-y-4">
          <Link href={`/`}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={140}
                height={48}
                loader={loader}
                className="object-contain cursor-pointer"
              />
            ) : (
              <EditableElement
                targetId="global.global.footer.Footer.main.brandName"
                componentKey="Footer"
                elementKey="brandName"
                label="Brand Name"
                defaultValue={name}
                inline
              >
                {(val) => (
                  <span className="text-2xl font-bold text-white cursor-pointer">
                    {val}
                  </span>
                )}
              </EditableElement>
            )}
          </Link>
          <EditableElement
            targetId="global.global.footer.Footer.main.bioText"
            componentKey="Footer"
            elementKey="bioText"
            label="Brand Bio"
            defaultValue={description || "Explore unique travel experiences, curated itineraries, and expert guidance."}
          >
            {(val) => (
              <p className="text-sm leading-relaxed text-gray-400">
                {val}
              </p>
            )}
          </EditableElement>
          <div className="space-y-2 text-sm pt-2">
            {contactEmail && (
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-white transition break-all"
                >
                  {contactEmail}
                </a>
              </div>
            )}
            {contactPhone && (
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a
                  href={`tel:${contactPhone}`}
                  className="hover:text-white transition"
                >
                  {contactPhone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="flex items-center hover:text-white transition text-gray-400 hover:translate-x-1 duration-150 inline-flex"
                >
                  <ArrowRightIcon className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Subscribe for travel tips, exclusive deals, and updates.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-3">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-500 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              aria-label="Your email address"
            />
            <button
              type="submit"
              className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 transition text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Regional Multi-Locations Grid */}
      {regionalAddresses.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-10 border-t border-gray-800">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-6">
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
                  className="p-5 border border-gray-800 bg-gray-800/50 rounded-xl flex flex-col justify-between space-y-4 hover:border-gray-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <h6 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                        {loc.label || `Office 0${idx + 1}`}
                      </h6>
                    </div>
                    {loc.address && (
                      <p className="text-xs text-gray-400 leading-relaxed pl-6">
                        {loc.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-700/60 text-xs">
                    {loc.contactPhone && (
                      <a
                        href={`tel:${loc.contactPhone}`}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <PhoneIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        <span>{loc.contactPhone}</span>
                      </a>
                    )}

                    {loc.contactEmail && (
                      <a
                        href={`mailto:${loc.contactEmail}`}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors truncate"
                      >
                        <EnvelopeIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}

                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors pt-1"
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

      {/* Social & Footer Bottom */}
      <div className="border-t border-gray-800 pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Social Links */}
          <div className="flex space-x-6">
            {formattedSocialLinks.map((s, idx) => {
              if (!s.url) return null;
              return (
                <a
                  key={idx}
                  href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition capitalize text-xs text-gray-400 font-medium"
                >
                  {s.channel}
                </a>
              );
            })}
          </div>

          {/* Copyright */}
          <EditableElement
            targetId="global.global.footer.Footer.main.copyrightText"
            componentKey="Footer"
            elementKey="copyrightText"
            label="Copyright Notice"
            defaultValue={`All rights reserved. Powered by ${name}.`}
            inline
          >
            {(val) => (
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} {val}
              </p>
            )}
          </EditableElement>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-4 py-2 mt-2 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Powered by
        </span>
        <a
          href="https://salesmanpro.site"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
        >
          SalesmanPro.site
        </a>
      </div>
    </footer>
  );
}