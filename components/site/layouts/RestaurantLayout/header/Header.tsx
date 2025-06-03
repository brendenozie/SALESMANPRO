"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MagnifyingGlassCircleIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { useRouter } from "next/navigation";

const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks,
    themeSettings,
  } = storeFormData;

  // Use restaurant’s theme settings or fallbacks
  const primary = themeSettings?.primaryColor || "#F97316"; // orange
  const secondary = themeSettings?.secondaryColor || "#3B82F6"; // blue

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-shadow">
      {/* ── Top Info Bar (desktop) ── */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
        style={{ backgroundColor: `${primary}1A`, color: primary }}
      >
        <div className="flex items-center space-x-6">
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center space-x-1 hover:text-opacity-90 transition-colors"
            >
              <PhoneIcon className="h-4 w-4" />
              <span>{contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center space-x-1 hover:text-opacity-90 transition-colors"
            >
              <MegaphoneIcon className="h-4 w-4" />
              <span>{contactEmail}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks.map((s) => (
            <Link key={s.channel} href={s.url} target="_blank">
              <span
                className="capitalize transition-colors"
                style={{ color: primary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = secondary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = primary)
                }
              >
                {s.channel}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Nav (desktop) */}
          <div className="flex items-center space-x-4">
            <Link href={`/${slug}`} className="flex items-center space-x-2">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name}
                  width={120}
                  height={40}
                  className="object-contain"
                  loader={loader}
                />
              ) : (
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  {name}
                </span>
              )}
            </Link>
            <nav className="hidden lg:flex space-x-6 font-medium text-gray-700 dark:text-gray-200">
              {["Home", "Menu", "Reserve", "Contact"].map((label) => {
                let href = `/${slug}`;
                if (label === "Menu") href = `/${slug}/menu`;
                if (label === "Reserve") href = `/${slug}/reserve`;
                if (label === "Contact") href = `/${slug}/contact`;
                return (
                  <Link
                    key={label}
                    href={href}
                    className="hover:underline"
                    style={{ color: "#444" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = primary)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#444")
                    }
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search (desktop) */}
          <div className="flex-1 mx-6 hidden lg:block">
            <div className="relative">
              <input
                type="search"
                placeholder="Search dishes..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm rounded-full py-2 px-4 pl-10 shadow-sm focus:outline-none"
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 2px ${primary}`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Icons & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              aria-label="Profile"
              onClick={() => router.push(`/${slug}/profile`)}
              className="text-gray-600 dark:text-gray-200"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>
            <button
              className="lg:hidden text-gray-600 dark:text-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3BottomLeftIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 shadow-md">
          <div className="space-y-3">
            {["Home", "Menu", "Reserve", "Contact"].map((label) => {
              let href = `/${slug}`;
              if (label === "Menu") href = `/${slug}/menu`;
              if (label === "Reserve") href = `/${slug}/reserve`;
              if (label === "Contact") href = `/${slug}/contact`;
              return (
                <Link
                  key={label}
                  href={href}
                  className="block hover:underline text-gray-700 dark:text-gray-200"
                  style={{ color: "#444" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = primary)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#444")
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
