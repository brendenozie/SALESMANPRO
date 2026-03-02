'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronUpIcon,
  MegaphoneIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

export default function SaasFooter() {
  const { storeFormData } = useStoreContext();

  const primary = storeFormData?.themeSettings?.primaryColor || "#4F46E5";
  const secondary = storeFormData?.themeSettings?.secondaryColor || "#3B82F6";

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: `/#features` },
        { label: "Pricing", href: `/#pricing` },
        { label: "Docs", href: `/#docs` },
        { label: "API", href: `/#api` },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: `/#about` },
        { label: "Careers", href: `/#careers` },
        { label: "Blog", href: `/#blog` },
        { label: "Contact", href: `/#contact` },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: `/#privacy` },
        { label: "Terms of Service", href: `/#terms` },
        { label: "Security", href: `/#security` },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: `/#support` },
        { label: "API Status", href: `/#status` },
        { label: "Community", href: `/#community` },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand & Contact */}
        <div className="space-y-6">
          <Link href={`/`} className="flex items-center space-x-2 cursor-pointer">
            {storeFormData?.logoUrl ? (
              <Image
                src={storeFormData?.logoUrl}
                alt={storeFormData?.name}
                width={48}
                height={48}
                loader={loader}
                className="rounded-full"
              />
            ) : (
              <span
                className="text-2xl font-bold"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {storeFormData?.name}
              </span>
            )}
          </Link>
          <p className="text-sm leading-relaxed">
            {storeFormData?.description ||
              "Building tools to help your business grow effortlessly."}
          </p>
          <ul className="space-y-4">
            {storeFormData?.contactEmail && (
              <li className="flex items-center space-x-2">
                <MegaphoneIcon      className="h-5 w-5 text-indigo-400" />
                <a
                  href={`mailto:${storeFormData?.contactEmail}`}
                  className="hover:text-white transition-colors text-sm truncate"
                >
                  {storeFormData?.contactEmail}
                </a>
              </li>
            )}
            {storeFormData?.contactPhone && (
              <li className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-indigo-400" />
                <a
                  href={`tel:${storeFormData?.contactPhone}`}
                  className="hover:text-white transition-colors text-sm"
                >
                  {storeFormData?.contactPhone}
                </a>
              </li>
            )}
            {storeFormData?.address && (
              <li className="flex items-start space-x-2">
                <MapPinIcon className="h-5 w-5 mt-0.5 text-indigo-400" />
                <span className="text-sm leading-snug">
                  {storeFormData?.address}
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-lg font-semibold text-gray-100 mb-4">
                {group.title}
              </h4>
              <ul className="space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Newsletter & Bottom */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        {/* Newsletter Signup */}
        <div className="w-full md:w-1/2">
          <motion.h5
            className="text-xl font-semibold text-white mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Subscribe to our newsletter
          </motion.h5>
          <form className="flex space-x-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2 rounded-l-full border border-gray-700 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-r-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Subscribe
            </motion.button>
          </form>
        </div>

        {/* Scroll to Top & Social Icons */}
        <div className="flex items-center space-x-8">
          {/* Scroll to Top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUpIcon className="h-6 w-6" />
            <span className="ml-2 text-sm">Back to Top</span>
          </button>

          {/* Social Icons */}
          <div className="flex space-x-4">
            {storeFormData?.socialLinks.map((s) => (
              <motion.a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.1 }}
                className="bg-gray-800 p-2 rounded-full"
                style={{ color: primary }}
                onMouseEnter={(e : any) =>
                  (e.currentTarget.style.color = secondary)
                }
                onMouseLeave={(e : any) => (e.currentTarget.style.color = primary)}
              >
                {s.channel.toString().toLowerCase() === "twitter" && (
                  <Image
                    src="/icons/twitter.svg"
                    alt="Twitter"
                    width={20}
                    height={20}
                  />
                )}
                {s.channel.toString().toLowerCase() === "linkedin" && (
                  <Image
                    src="/icons/linkedin.svg"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                  />
                )}
                {s.channel.toString().toLowerCase() === "github" && (
                  <Image
                    src="/icons/github.svg"
                    alt="GitHub"
                    width={20}
                    height={20}
                  />
                )}
                {/* Add more as needed */}
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-800 text-gray-500 text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} {storeFormData?.name}. All rights reserved.
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
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
