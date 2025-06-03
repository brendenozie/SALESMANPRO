"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MagnifyingGlassCircleIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";

//----------------------------------------------
// Image loader (same as in CoursesSite)
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
// Header (pulls store data from context)
//----------------------------------------------
export default function Header() {
  const { storeFormData } = useStoreContext();
  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Destructure values from storeFormData
  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks,
    storeCategories,
    themeSettings,
  } = storeFormData;

  // Fallback colors if not provided
  const primary = themeSettings?.primaryColor || "#f97316";    // orange fallback
  const secondary = themeSettings?.secondaryColor || "#3b82f6"; // blue fallback

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-shadow">
      {/* ── Top Info Bar (desktop only) ── */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
        style={{ backgroundColor: `${primary}1A`, color: primary }}
      >
        <div className="flex items-center space-x-6">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center uppercase hover:underline"
            >
              📧 <span className="ml-1">{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center hover:underline"
            >
              📞 <span className="ml-1">{contactPhone}</span>
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = secondary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = primary)
              }
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
                onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
              >
                Home
              </Link>

              <Link
                href={`/${slug}/courses`}
                className="hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
              >
                Courses
              </Link>

              {/* Dropdown for categories */}
              <div className="relative group">
                <button
                  className="flex items-center space-x-1 hover:underline"
                  style={{ color: "#444" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = primary)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#444")
                  }
                >
                  <span>Categories</span>
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {storeCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${slug}/category/${cat.id}`}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* ── Search Input (desktop) ── */}
          <div className="flex-1 mx-6 hidden lg:block">
            <div className="relative">
              <input
                type="search"
                placeholder="Search courses..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm rounded-full py-2 px-4 pl-10 shadow-sm focus:outline-none"
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 2px ${primary}`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* ── Icons & Mobile Menu Toggle ── */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                router.push(`/${slug}/profile`);
              }}
              className="text-gray-600 dark:text-gray-200"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                router.push(`/${slug}/checkout`);
              }}
              className="relative text-gray-600 dark:text-gray-200"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
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
            <Link
              href={`/${slug}`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
            >
              Home
            </Link>

            <Link
              href={`/${slug}/courses`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
            >
              Courses
            </Link>

            <details className="group">
              <summary className="flex items-center justify-between hover:underline text-gray-700 dark:text-gray-200 cursor-pointer">
                <span>Categories</span>
                <svg
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="mt-2 pl-4 space-y-1">
                {storeCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${slug}/category/${cat.id}`}
                    className="block hover:underline text-gray-700 dark:text-gray-200"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}
    </header>
  );
}
