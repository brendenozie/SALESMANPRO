"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
// import {
//   FaFacebookF,
//   FaTwitter,
//   FaInstagram,
//   FaLinkedinIn,
// } from "react-icons/fa";

interface FooterProps {
  store: {
    name: string;
    slug: string;
    themeSettings?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  };
}

const Footer: React.FC<FooterProps> = ({ store }) => {
  const primary = store.themeSettings?.primaryColor || "#4f46e5";

  const socialLinks = [
    { icon: <PhoneIcon />, href: "#" },
    { icon: <PhoneIcon />, href: "#" },
    { icon: <PhoneIcon />, href: "#" },
    { icon: <PhoneIcon />, href: "#" },
  ];

  return (
    <footer className="relative z-10 bg-white/10 backdrop-blur-md text-black pt-16 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo and About */}
          <div>
            <h2 className="text-2xl font-bold mb-4">{store.name}</h2>
            <p className="text-sm text-black/80">
              Your trusted platform for innovative digital solutions.
            </p>
            <div className="flex mt-4 space-x-4">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-black/80 text-sm">
              <li><Link href={`/${store.slug}#services`}>Services</Link></li>
              <li><Link href={`/${store.slug}#featured`}>Featured</Link></li>
              <li><Link href={`/${store.slug}#testimonials`}>Testimonials</Link></li>
              <li><Link href={`/${store.slug}/contact`}>Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-black/80">
              {store.address && (
                <li className="flex items-start">
                  <MapPinIcon className="w-5 h-5 mr-2 mt-1" />
                  <span>{store.address}</span>
                </li>
              )}
              {store.contactEmail && (
                <li className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  <a href={`mailto:${store.contactEmail}`}>{store.contactEmail}</a>
                </li>
              )}
              {store.contactPhone && (
                <li className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  <a href={`tel:${store.contactPhone}`}>{store.contactPhone}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mt-12 pt-6 text-sm text-center text-black/50">
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
