"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion"; // For subtle animations
import { useStoreContext } from "@/contexts/StoreContext";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon, // Using EnvelopeIcon for email
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Assuming you have social media icons available, e.g., from Font Awesome or Lucide React
// For this example, I'll use simple text with dynamic styling for social links.
// If you have specific icon components, you'd import them here.
// import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'; // Example if using react-icons/fa

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
    themeSettings,
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || "#FF5722"; // Deep Orange
  const secondaryColor = themeSettings?.secondaryColor || "#3F51B5"; // Indigo

  // Define navigation links dynamically
  const navLinks = [
    { label: "Home", href: `/${slug}` },
    { label: "Menu", href: `/${slug}/restaurent/products` },
    { label: "Reserve", href: `/${slug}/restaurent/reserve` },
    { label: "About Us", href: `/${slug}/restaurent/about` },
    { label: "Contact", href: `/${slug}/#contact` },
    { label: "Gallery", href: `/${slug}/restaurent/gallery` }, // Added Gallery link
  ];

  // Define sample menu categories (replace with actual data if available)
  const menuCategories = [
    { label: "Appetizers", href: `/${slug}/restaurent/products?category=appetizers` },
    { label: "Main Courses", href: `/${slug}/restaurent/products?category=main-courses` },
    { label: "Desserts", href: `/${slug}/restaurent/products?category=desserts` },
    { label: "Drinks", href: `/${slug}/restaurent/products?category=drinks` },
  ];

  return (
    <footer className="bg-gray-950 text-gray-300 py-16 relative overflow-hidden">
      {/* Subtle background pattern or texture (optional) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("/images/footer-texture.png")', backgroundSize: 'cover' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* ── Column 1: About & Logo ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Link href={`/`} className="inline-flex items-center space-x-2">
              {/* You can use an Image component here if you have a dark-mode friendly logo */}
              <span
                className="text-3xl font-extrabold text-white tracking-wide"
                style={{ textShadow: "2px 2px rgba(0,0,0,0.3)" }}
              >
                {name || "Unbite"}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Serving gourmet dishes with passion. Experience our signature flavors, warm hospitality, and a culinary journey you won't forget.
            </p>
            <div className="flex space-x-5 mt-6">
              {socialLinks && socialLinks.map((s) => (
                <motion.a
                  key={s.channel}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-125"
                  style={{ color: primaryColor }}
                  onMouseEnter={(e : any) => (e.currentTarget.style.color = secondaryColor)}
                  onMouseLeave={(e : any) => (e.currentTarget.style.color = primaryColor)}
                  whileHover={{ scale: 1.25 }}
                >
                  {/* Placeholder for actual social icons. Replace with FaFacebook, etc. if using react-icons */}
                  <span className="text-xl capitalize">{s.channel.toString().charAt(0).toUpperCase() + s.channel.toString().slice(1)}</span>
                  {/* Example if using react-icons/fa:
                  {s.channel === 'facebook' && <FaFacebook className="h-6 w-6" />}
                  {s.channel === 'instagram' && <FaInstagram className="h-6 w-6" />}
                  {s.channel === 'twitter' && <FaTwitter className="h-6 w-6" />}
                  */}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ── Column 2: Quick Links ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-6 text-white border-b-2 border-orange-500 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-3">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-400 hover:text-white transition-colors group"
                  >
                    <ChevronRightIcon className="h-4 w-4 mr-2 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Column 3: Contact Info ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-6 text-white border-b-2 border-orange-500 pb-2 inline-block">Get In Touch</h3>
            <ul className="space-y-4 text-gray-400">
              {address && (
                <li className="flex items-start">
                  <MapPinIcon className="h-5 w-5 mr-3 mt-1 text-orange-400 flex-shrink-0" />
                  <span>{address}</span>
                </li>
              )}
              {contactEmail && (
                <li className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-white transition-colors"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactPhone && (
                <li className="flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  <a
                    href={`tel:${contactPhone}`}
                    className="hover:text-white transition-colors"
                  >
                    {contactPhone}
                  </a>
                </li>
              )}
            </ul>
          </motion.div>

          {/* ── Column 4: Newsletter & Menu Categories ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-6 text-white border-b-2 border-orange-500 pb-2 inline-block">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Sign up to receive exclusive offers, new menu alerts, and event invitations directly to your inbox.
            </p>
            <form className="flex flex-col space-y-3 mb-8">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-3 rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-700"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors shadow-lg"
              >
                Subscribe Now
              </button>
            </form>

            {/* Optional: Quick Menu Categories */}
            <h3 className="text-xl font-bold mb-4 text-white border-b-2 border-orange-500 pb-2 inline-block">Menu Highlights</h3>
            <ul className="space-y-2">
              {menuCategories.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="flex items-center text-gray-400 hover:text-white transition-colors group"
                  >
                    <ChevronRightIcon className="h-4 w-4 mr-2 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Bar (Copyright & Policies) ── */}
      <div className="border-t border-gray-700 mt-16 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p className="mb-4 md:mb-0">
            © {new Date().getFullYear()} {name || "Unbite"}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center space-x-4">
            <Link
              href={`/${slug}/restaurent/privacy`}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href={`/${slug}/restaurent/terms`}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            {/* Add more legal/utility links here */}
            <Link
              href={`/${slug}/restaurent/sitemap`}
              className="hover:text-white transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
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
  );
}