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
} from "@heroicons/react/24/outline";

// import {
//   FaFacebookF,
//   FaInstagram,
//   FaLinkedinIn,
//   FaTwitter,
// } from "react-icons/fa";

interface FooterProps {
  storeFormData:any;
}


const Footer: React.FC<FooterProps> = ({ storeFormData }) => {
  const primary = storeFormData.themeSettings?.primaryColor || "#0f766e";

  const socialLinks = [
    { icon: <FaceSmileIcon className="w-5 h-5" />, href: "#" },
    { icon: <FaceSmileIcon className="w-5 h-5" />, href: "#" },
    { icon: <FaceSmileIcon className="w-5 h-5" />, href: "#" },
    { icon: <FaceSmileIcon className="w-5 h-5" />, href: "#" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-0 bg-white text-gray-800 pt-44 pb-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Logo and About */}
          <div>
            <h2 className="text-2xl font-bold mb-4">{storeFormData.name}</h2>
            <p className="text-sm text-gray-600">
              {storeFormData.tagline ||
                "Your trusted platform for innovative digital solutions."}
            </p>
            <div className="flex mt-5 space-x-3">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition text-xl"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href={`/${storeFormData.slug}#services`}>Services</Link></li>
              <li><Link href={`/${storeFormData.slug}#featured`}>Featured</Link></li>
              <li><Link href={`/${storeFormData.slug}#testimonials`}>Testimonials</Link></li>
              <li><Link href={`/${storeFormData.slug}/contact`}>Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              {storeFormData.address && (
                <li className="flex items-start">
                  <MapPinIcon className="w-5 h-5 mr-2 mt-1 text-gray-700" />
                  <span>{storeFormData.address}</span>
                </li>
              )}
              {storeFormData.contactEmail && (
                <li className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-700" />
                  <a href={`mailto:${storeFormData.contactEmail}`}>
                    {storeFormData.contactEmail}
                  </a>
                </li>
              )}
              {storeFormData.contactPhone && (
                <li className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2 text-gray-700" />
                  <a href={`tel:${storeFormData.contactPhone}`}>
                    {storeFormData.contactPhone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-3">Stay updated with our latest offers.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[primary]"
              />
              <button
                type="submit"
                style={{ backgroundColor: primary }}
                className="text-white py-2 rounded-md text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Scroll to Top */}
        <div className="flex justify-end mt-10">
          <button
            onClick={scrollToTop}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full"
            title="Scroll to top"
          >
            <ChevronUpIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Base */}
        <div className="border-t border-gray-200 mt-10 pt-6 text-sm text-center text-gray-500">
          © {new Date().getFullYear()} {storeFormData.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
