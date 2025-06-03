"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { useRouter } from "next/navigation";

//----------------------------------------------
// Image loader (same as elsewhere)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

//----------------------------------------------
// Header for NonProfitSite (pulls from StoreContext)
//----------------------------------------------
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

  const primary = themeSettings?.primaryColor || "#10B981"; // green fallback
  const secondary = themeSettings?.secondaryColor || "#047857"; // darker green

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-shadow">
      {/* ── Top Info Bar (desktop) ── */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
        style={{ backgroundColor: `${primary}1A`, color: primary }}
      >
        <div className="flex items-center space-x-6">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center space-x-1 uppercase hover:underline"
            >
              <MegaphoneIcon className="h-4 w-4" />
              <span>{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center space-x-1 hover:underline"
            >
              <PhoneIcon className="h-4 w-4" />
              <span>{contactPhone}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks.map((s) => (
            <a
              key={s.channel}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: primary }}
              onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = primary)}
              className="capitalize transition-colors"
            >
              {s.channel}
            </a>
          ))}
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Navigation (desktop) */}
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
              <Link
                href={`/${slug}`}
                className="hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#444")
                }
              >
                Home
              </Link>

              <Link
                href={`/${slug}/programs`}
                className="hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#444")
                }
              >
                Programs
              </Link>

              <Link
                href={`/${slug}/donate`}
                className="hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#444")
                }
              >
                Donate
              </Link>

              <Link
                href={`/${slug}/contact`}
                className="hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#444")
                }
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* User Icon (e.g., volunteer login) */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => router.push(`/${slug}/profile`)}
              className="text-gray-600 dark:text-gray-200"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>

            {/* Mobile menu toggle */}
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
            <Link
              href={`/${slug}`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#444")
              }
            >
              Home
            </Link>

            <Link
              href={`/${slug}/programs`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#444")
              }
            >
              Programs
            </Link>

            <Link
              href={`/${slug}/donate`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#444")
              }
            >
              Donate
            </Link>

            <Link
              href={`/${slug}/contact`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#444")
              }
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
