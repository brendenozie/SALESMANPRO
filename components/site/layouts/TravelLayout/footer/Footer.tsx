"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const navLinks = [
    { label: "Home", href: `/${storeFormData?.slug}` },
    { label: "Destinations", href: `/${storeFormData?.slug}/destinations` },
    { label: "Tours", href: `/${storeFormData?.slug}/tours` },
    { label: "About", href: `/${storeFormData?.slug}/about` },
    { label: "Contact", href: `/${storeFormData?.slug}/contact` },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Hook up real subscription logic here
    alert(`Subscribed: ${newsletterEmail}`);
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 pb-12">
        {/* About & Logo */}
        <div className="space-y-4">
          <Link href={`/${storeFormData?.slug}`}>
            {storeFormData?.logoUrl ? (
              <Image
                src={storeFormData?.logoUrl}
                alt={storeFormData?.name}
                width={140}
                height={48}
                loader={loader}
                className="object-contain cursor-pointer"
              />
            ) : (
              <span className="text-2xl font-bold text-white cursor-pointer">
                {storeFormData?.name}
              </span>
            )}
          </Link>
          <p className="text-sm">
            {storeFormData?.description ||
              "Explore unique travel experiences, curated itineraries, and expert guidance."}
          </p>
          <div className="space-y-2 text-sm">
            {storeFormData?.contactEmail && (
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-5 h-5 text-green-400" />
                <a
                  href={`mailto:${storeFormData?.contactEmail}`}
                  className="hover:text-white transition"
                >
                  {storeFormData?.contactEmail}
                </a>
              </div>
            )}
            {storeFormData?.contactPhone && (
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 text-green-400" />
                <a
                  href={`tel:${storeFormData?.contactPhone}`}
                  className="hover:text-white transition"
                >
                  {storeFormData?.contactPhone}
                </a>
              </div>
            )}
            {storeFormData?.address && (
              <div className="flex items-start space-x-2">
                <MapPinIcon className="w-5 h-5 text-green-400 mt-0.5" />
                <span>{storeFormData?.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="flex items-center hover:text-white transition"
                >
                  <ArrowRightIcon className="w-4 h-4 mr-2 text-green-400" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Newsletter</h3>
          <p className="text-sm mb-4">
            Subscribe for travel tips, exclusive deals, and updates.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-3">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
            <button
              type="submit"
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Social & Footer Bottom */}
      <div className="border-t border-gray-700 pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Social Links */}
          <div className="flex space-x-4">
            {storeFormData?.socialLinks?.map((s) => (
              <a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition capitalize text-sm"
              >
                {s.channel}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {storeFormData?.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
