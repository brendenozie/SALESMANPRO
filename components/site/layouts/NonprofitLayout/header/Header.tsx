"use client";

import React, { useState } from "react";
import { useStoreContext } from "@/contexts/StoreContext";

// Sample data to use as a fallback if the database data is not available
const sampleData = {
  name: "KindFlow",
  slug: "kindflow",
  logoUrl: "https://placehold.co/120x40/000000/FFFFFF?text=Logo",
  contactEmail: "info@example.org",
  contactPhone: "+1 (555) 123-4567",
  socialLinks: [
    { channel: "facebook", url: "https://facebook.com" },
    { channel: "twitter", url: "https://twitter.com" },
    { channel: "instagram", url: "https://instagram.com" },
  ],
  themeSettings: {
    primaryColor: "#10B981", // green fallback
    secondaryColor: "#047857", // darker green
  },
};

//----------------------------------------------
// Header for NonProfitSite (uses sample data)
//----------------------------------------------
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const { storeFormData } = useStoreContext();
  
    const {
      name,
      slug,
      logoUrl,
      contactEmail,
      contactPhone,
      socialLinks,
      themeSettings,
    } = storeFormData || sampleData;
    

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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11.455v-.747a1.69 1.69 0 0 0-.256-.913l-4.225-7.796a1.69 1.69 0 0 0-3.078 0L5.346 9.795a1.69 1.69 0 0 0-.257.913v.747m14.288 0a1.688 1.688 0 0 1 1.69 1.69v1.86a2.69 2.69 0 0 1-2.69 2.69h-10a2.69 2.69 0 0 1-2.69-2.69v-1.86a1.69 1.69 0 0 1 1.69-1.69m14.288 0H4.712" />
              </svg>
              <span>{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center space-x-1 hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-.98.8-1.75 1.75-1.75h3.5a1.75 1.75 0 0 1 1.75 1.75v3.5c0 .98-.8 1.75-1.75 1.75H4a1.75 1.75 0 0 1-1.75-1.75V6.75ZM15 6.75c0-.98.8-1.75 1.75-1.75h3.5a1.75 1.75 0 0 1 1.75 1.75v3.5c0 .98-.8 1.75-1.75 1.75h-3.5a1.75 1.75 0 0 1-1.75-1.75V6.75ZM2.25 15c0-.98.8-1.75 1.75-1.75h3.5a1.75 1.75 0 0 1 1.75 1.75v3.5c0 .98-.8 1.75-1.75 1.75H4a1.75 1.75 0 0 1-1.75-1.75V15ZM15 15c0-.98.8-1.75 1.75-1.75h3.5a1.75 1.75 0 0 1 1.75 1.75v3.5c0 .98-.8 1.75-1.75 1.75h-3.5a1.75 1.75 0 0 1-1.75-1.75V15Z" />
              </svg>
              <span>{contactPhone}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks?.map((s) => (
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
            <a href={`/${slug}`} className="flex items-center space-x-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={name}
                  width={120}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  {name}
                </span>
              )}
            </a>

            <nav className="hidden lg:flex space-x-6 font-medium text-gray-700 dark:text-gray-200">
              <a
                href={`/${slug}`}
                className="hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#444")
                }
              >
                Home
              </a>
              <a
                href={`/${slug}/programs`}
                className="hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#444")
                }
              >
                Programs
              </a>

              <a
                href={`/${slug}/donate`}
                className="hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#444")
                }
              >
                Donate
              </a>

              <a
                href={`/${slug}/contact`}
                className="hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#444")
                }
              >
                Contact
              </a>
            </nav>
          </div>

          {/* User Icon (e.g., volunteer login) */}
          <div className="flex items-center space-x-4">
            <a
              href={`/${slug}/profile`}
              className="text-gray-600 dark:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </a>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-gray-600 dark:text-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 shadow-md">
          <div className="space-y-3">
            <a
              href={`/${slug}`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#444")
              }
            >
              Home
            </a>

            <a
              href={`/${slug}/programs`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#444")
              }
            >
              Programs
            </a>

            <a
              href={`/${slug}/donate`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#444")
              }
            >
              Donate
            </a>

            <a
              href={`/${slug}/contact`}
              className="block hover:underline text-gray-700 dark:text-gray-200"
              style={{ color: "#444" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#444")
              }
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
