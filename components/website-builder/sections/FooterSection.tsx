"use client";

import React from "react";
import Link from "next/link";
import { NavigationConfig, ThemeTokens } from "@/types/website-builder";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";

interface FooterProps {
  navigation: NavigationConfig;
  theme: ThemeTokens;
  storeName: string;
  storeSlug: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  socialLinks?: any[];
  onNavigate?: (url: string) => void;
  isEditorPreview?: boolean;
}

const socialIconMap: Record<string, React.ElementType> = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaTwitter,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  youtube: FaYoutube,
};

export default function FooterSection({
  navigation,
  theme,
  storeName,
  storeSlug,
  contactEmail,
  contactPhone,
  address,
  socialLinks = [],
  onNavigate,
  isEditorPreview = false,
}: FooterProps) {
  const { footerColumns, footerSettings } = navigation;

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    if (isEditorPreview && onNavigate) {
      e.preventDefault();
      onNavigate(url);
    }
  };

  return (
    <footer className="w-full bg-zinc-950 text-white pt-16 pb-12 border-t border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          {/* Brand & Contact summary */}
          <div className="lg:col-span-4 space-y-4">
            <h3
              className="text-2xl font-black uppercase tracking-tight"
              style={{ color: theme.primaryColor }}
            >
              {storeName}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Discover verified quality products, backed by prompt nationwide delivery, secure checkout and human customer care.
            </p>

            <div className="space-y-2 pt-2 text-xs text-zinc-300">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-white transition">
                  <EnvelopeIcon className="w-4 h-4 text-zinc-500" />
                  <span>{contactEmail}</span>
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-2 hover:text-white transition">
                  <PhoneIcon className="w-4 h-4 text-zinc-500" />
                  <span>{contactPhone}</span>
                </a>
              )}
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPinIcon className="w-4 h-4 text-zinc-500" />
                <span>{address || "Nairobi, Kenya"}</span>
              </div>
            </div>

            {/* Social Icons */}
            {footerSettings.showSocialLinks && socialLinks.length > 0 && (
              <div className="flex items-center gap-3 pt-3">
                {socialLinks.map((s, idx) => {
                  const channelKey = (s.channel || s.platform || "").toLowerCase();
                  const Icon = socialIconMap[channelKey] || FaInstagram;
                  return (
                    <a
                      key={idx}
                      href={s.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      aria-label={s.channel || "Social profile"}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Link Columns */}
          {footerColumns.map((col) => (
            <div key={col.id} className="lg:col-span-2 space-y-4">
              <h4 className="text-xs uppercase font-black tracking-widest text-zinc-400">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      onClick={(e) => handleLinkClick(e, item.url)}
                      className="text-sm text-zinc-400 hover:text-white transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Quick Payment Badges */}
          {footerSettings.showPaymentIcons && (
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs uppercase font-black tracking-widest text-zinc-400">
                Accepted Payments
              </h4>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-2.5 py-1.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  M-Pesa
                </span>
                <span className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Visa
                </span>
                <span className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Mastercard
                </span>
                <span className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Cash on Delivery
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{footerSettings.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>Powered by <span className="font-bold text-zinc-300">SalesmanPro</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
