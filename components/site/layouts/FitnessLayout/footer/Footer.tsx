"use client";

import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
// import { StoreContext } from "../path/to/StoreContext"; // adjust to your actual context path
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (!storeFormData) return null;

  // Example footer links; adjust routes as needed
  // const programLinks = storeFormData.classes.map((c: any) => ({
  //   name: c.name,
  //   href: `/programs/${c.slug}`,
  // }));
  // const trainerLinks = storeFormData.trainers.map((t: any) => ({
  //   name: t.name,
  //   href: `/trainers/${t.id}`,
  // }));

  return (
    <footer className="bg-gray-900 text-gray-300 dark:bg-gray-800 dark:text-gray-400">
      <div className="max-w-7xl mx-auto py-12 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Column 1: Brand & Description */}
        <div>
          <h4 className="text-xl font-bold text-white dark:text-white mb-4">
            {storeFormData.name}
          </h4>
          <p className="text-sm">
            {/* Optionally include a tagline or description if available */}
            {storeFormData.description || "Your fitness journey starts here."}
          </p>
        </div>

        {/* Column 2: Programs */}
        {/* <div>
          <h5 className="font-semibold text-white dark:text-white mb-3">Programs</h5>
          <ul className="space-y-2 text-sm">
            {programLinks.slice(0, 5).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {programLinks.length > 5 && (
              <li>
                <Link
                  href="/programs"
                  className="hover:text-white font-medium text-sm"
                >
                  View All &rarr;
                </Link>
              </li>
            )}
          </ul>
        </div> */}

        {/* Column 3: Trainers & Resources */}
        <div>
          <h5 className="font-semibold text-white dark:text-white mb-3">
            Trainers
          </h5>
          {/* <ul className="space-y-2 text-sm">
            {trainerLinks.slice(0, 5).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {trainerLinks.length > 5 && (
              <li>
                <Link
                  href="/trainers"
                  className="hover:text-white font-medium text-sm"
                >
                  View All &rarr;
                </Link>
              </li>
            )}
          </ul> */}
        </div>

        {/* Column 4: Legal & Social */}
        <div className="space-y-6">
          <div>
            <h5 className="font-semibold text-white dark:text-white mb-3">
              Legal
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex space-x-4">
            {/* <a
              href={storeFormData.socialLinks? || "#"}
              aria-label="Facebook"
              className="hover:text-white transition-colors"
            >
        
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M22 12a10 10 0 10-11.5 9.9v-7H8.5v-2.9h2V9.3c0-2 1.2-3.1 3-3.1.9 0 1.7.1 1.9.1v2.1H14c-1.1 0-1.4.7-1.4 1.4V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z" />
              </svg>
            </a>
            <a
              href={storeFormData.social?.instagram || "#"}
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 2C4.79 2 3 3.79 3 6v12c0 2.21 1.79 4 4 4h10c2.21 0 4-1.79 4-4V6c0-2.21-1.79-4-4-4H7zm10 2a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-.75a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </a>
            <a
              href={storeFormData.social?.twitter || "#"}
              aria-label="Twitter"
              className="hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.28 4.28 0 001.88-2.37 8.54 8.54 0 01-2.7 1.03 4.24 4.24 0 00-7.23 3.86 12.02 12.02 0 01-8.73-4.43 4.24 4.24 0 001.31 5.66 4.17 4.17 0 01-1.92-.53v.05a4.24 4.24 0 003.39 4.16 4.3 4.3 0 01-1.92.07 4.24 4.24 0 003.96 2.94A8.5 8.5 0 012 19.54a12.02 12.02 0 006.5 1.9c7.8 0 12.07-6.47 12.07-12.08 0-.18-.01-.36-.02-.54A8.7 8.7 0 0024 4.56a8.41 8.41 0 01-2.54.7z" />
              </svg>
            </a> */}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="mt-4 flex items-center space-x-2 p-2 bg-gray-800 dark:bg-gray-700 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-300" />
            )}
            <span className="text-sm">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-4 text-center text-xs">
        &copy; {new Date().getFullYear()} {storeFormData.name}. All rights reserved.
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
