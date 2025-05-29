"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Programs', href: '/#featured' },
    { label: 'Locations', href: '/#locations' },
    { label: 'Coaches', href: '/#experts' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/#footer' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Logo */}
        <Link href="/"  className="text-2xl font-bold text-gray-900 dark:text-white">FitWell
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 items-center">
          {navItems.map(item => (
            <Link key={item.label} href={item.href}  className="text-gray-700 dark:text-gray-300 hover:text-primary transition">
                {item.label}
            </Link>
          ))}
          <div className="relative">
            <input
              type="search"
              placeholder="Search programs..."
              className="pl-8 pr-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-1 bg-primary text-white rounded-full text-sm font-medium"
          >
            Get Started
          </motion.button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-300"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.nav
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="md:hidden bg-white dark:bg-gray-900 shadow-inner"
        >
          <ul className="flex flex-col space-y-2 px-4 py-3">
            {navItems.map(item => (
              <li key={item.label}>
                <Link href={item.href} 
                    onClick={() => setMobileOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary transition py-1"
                  >
                    {item.label}
                  
                </Link>
              </li>
            ))}
            <li>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full px-4 py-2 bg-primary text-white rounded-full text-sm font-medium"
              >
                Get Started
              </motion.button>
            </li>
          </ul>
        </motion.nav>
      )}
    </header>
  );
}
