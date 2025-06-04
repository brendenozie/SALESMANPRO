"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { FaceFrownIcon } from "@heroicons/react/24/solid";
// import {
//   FaFacebookF,
//   FaTwitter,
//   FaInstagram,
//   FaYoutube,
// } from "react-icons/fa";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface SocialLink {
  channel: string;
  url: string;
}

interface StoreFormData {
  name: string;
  slug: string;
  description?: string;
  categories: Category[];
  socialLinks: SocialLink[];
}

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const { storeFormData } = useStoreContext();

  const renderSocialIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "facebook":
        return <FaceFrownIcon className="w-5 h-5" />;
      case "twitter":
        return <FaceFrownIcon className="w-5 h-5" />;
      case "instagram":
        return <FaceFrownIcon className="w-5 h-5" />;
      case "youtube":
        return <FaceFrownIcon className="w-5 h-5" />;
      default:
        return <span className="uppercase">{channel.charAt(0)}</span>;
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-12">
        {/* About */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            About {storeFormData.name}
          </h3>
          <p className="text-sm leading-relaxed text-gray-400">
            {storeFormData.description ||
              "Discover inspiring stories, videos, and insights—stay connected and informed with Pulse Media."}
          </p>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Categories
          </h3>
          <ul className="space-y-2 text-sm">
            {storeFormData.storeCategories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/site/${storeFormData.slug}/category/${cat.id}`}
                  className="hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={`/site/${storeFormData.slug}`}
                className="hover:text-white transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${storeFormData.slug}/articles`}
                className="hover:text-white transition-colors"
              >
                Articles
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${storeFormData.slug}/videos`}
                className="hover:text-white transition-colors"
              >
                Videos
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${storeFormData.slug}/about`}
                className="hover:text-white transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${storeFormData.slug}/contact`}
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow & Legal */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Follow Us
          </h3>
          <div className="flex space-x-4 mb-6">
            {storeFormData.socialLinks.map((s) => (
              <motion.a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={s.channel}
              >
                {renderSocialIcon(s.channel)}
              </motion.a>
            ))}
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Legal
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={`/site/${storeFormData.slug}/privacy`}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href={`/site/${storeFormData.slug}/terms`}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500 pb-8">
        &copy; {year} {storeFormData.name}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
