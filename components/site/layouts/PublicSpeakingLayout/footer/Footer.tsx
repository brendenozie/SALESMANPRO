"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import {
  FaceSmileIcon,
} from "@heroicons/react/24/solid";
import {
  FaLinkedin,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import type { IconType } from "react-icons";

interface FooterProps {
  storeFormData: any;
}

export default function Footer({ storeFormData }: FooterProps) {

  const {
    name,
    slug,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
    themeSettings,
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || "#FF5722";
  const secondaryColor = themeSettings?.secondaryColor || "#3F51B5";

  const description = `Empowering growth, clarity, and transformation — one step at a time.
  Let’s build a path that aligns your purpose with lasting results.`;

  const socials =
    socialLinks && socialLinks.length > 0
      ? socialLinks
      : [
          { channel: "LinkedIn", url: "#" },
          { channel: "Twitter", url: "#" },
          { channel: "Facebook", url: "#" },
          { channel: "Instagram", url: "#" },
          { channel: "YouTube", url: "#" },
        ];

  const getSocialIcon = (channel: unknown): React.ReactElement => {
  const iconMap: Record<string, IconType> = {
    linkedin: FaLinkedin,
    twitter: FaTwitter,
    x: FaTwitter,
    facebook: FaFacebookF,
    instagram: FaInstagram,
    youtube: FaYoutube,
  };

  const key = String(channel ?? "").toLowerCase();
  const IconComponent = iconMap[key];
  if (IconComponent) {
    const Component = IconComponent as React.ComponentType<any>;
    return <Component className="w-5 h-5" />;
  }
  return <FaceSmileIcon className="w-5 h-5" />;
};


  return (
    <>
      <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300 pt-20 pb-12">
        {/* Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-700/10 via-transparent to-transparent pointer-events-none"></div>

        {/* Footer Content */}
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {(name && name.charAt(0).toUpperCase()) || "C"}
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {name || "YourCoach"}
              </h2>
            </div>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-bold text-white text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${slug || ""}`}
                  className="hover:text-orange-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={`/${slug || ""}/about`}
                  className="hover:text-orange-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={`/${slug || ""}/services`}
                  className="hover:text-orange-400 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href={`/${slug || ""}/testimonials`}
                  className="hover:text-orange-400 transition-colors"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href={`/${slug || ""}/contact`}
                  className="hover:text-orange-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-bold text-white text-lg mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              {contactEmail && (
                <li className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-5 h-5 text-orange-500" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-orange-400"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactPhone && (
                <li className="flex items-center space-x-2">
                  <PhoneIcon className="w-5 h-5 text-orange-500" />
                  <a
                    href={`tel:${contactPhone}`}
                    className="hover:text-orange-400"
                  >
                    {contactPhone}
                  </a>
                </li>
              )}
              {address && (
                <li className="flex items-center space-x-2">
                  <MapPinIcon className="w-5 h-5 text-orange-500" />
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </motion.div>

          {/* Social & Motto */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-bold text-white text-lg mb-4">Stay Connected</h4>
            <p className="text-sm text-gray-400 mb-5">
              Follow us for insights, inspiration, and updates.
            </p>
            <div className="flex space-x-3">
              {socials.map((s: any, idx: number) => (
                <motion.a
                  key={idx}
                  href={s.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.channel ?? `social-${idx}`}
                  whileHover={{ scale: 1.15 }}
                  className={`p-2 rounded-full transition-all duration-300 bg-white/5 hover:bg-[${secondaryColor}] hover:text-white text-[${primaryColor}]`}
                >
                  {getSocialIcon(s.channel)}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            &copy; {new Date().getFullYear()} {name || "YourCoach"} — All Rights Reserved.
            <br />
            <span className="font-semibold text-orange-400" style={{ color: primaryColor }}>
              Empowering You to Lead with Clarity and Confidence.
            </span>
          </motion.p>
        </div>
      <div className="flex items-center gap-1.5 px-4 py-2 mt-4 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
    </div>

      </footer>
    </>
  );
}
