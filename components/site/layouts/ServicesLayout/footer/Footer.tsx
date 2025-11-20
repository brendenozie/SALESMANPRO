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
  FaceFrownIcon,
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
  const secondary = storeFormData.themeSettings?.secondaryColor || "#3b82f6";
  
  const {
    slug,
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
    twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
    linkedin: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11.75 20h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.25 12.268h-3v-5.604c0-1.337-.026-3.059-1.865-3.059-1.865 0-2.151 1.459-2.151 2.967v5.696h-3v-11h2.881v1.507h.041c.401-.761 1.381-1.562 2.841-1.562 3.039 0 3.602 2.001 3.602 4.601v6.454z"/></svg>,
  };

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
              {socialLinks.map((s: any, idx: number) => {
                const channel = String(s.channel).toLowerCase();
                const icon = iconMapper[channel] || <FaceFrownIcon className="w-5 h-5" />;
                return (
                  <motion.a
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    href={`${s.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      flex items-center justify-center 
                      w-10 h-10 
                      text-gray-300 hover:text-white 
                      rounded-full 
                      transition-colors
                    "
                    style={{
                      background: `linear-gradient(135deg, ${primary}33, ${secondary}33)`,
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
