"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  store: {
    name: string;
    themeSettings?: { primaryColor?: string; secondaryColor?: string };
  };
}

const Header: React.FC<HeaderProps> = ({ store }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const primary = store?.themeSettings?.primaryColor || "#10b981"; // teal
  const secondary = store?.themeSettings?.secondaryColor || "#6366f1"; // indigo

  const navItems = [
    { id: "services", label: "Services" },
    { id: "pricing", label: "Pricing" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQs" },
    { id: "contact", label: "Contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-all ${
          scrolled ? "bg-white/40 shadow-md py-6" : " py-6"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          {/* Logo */}
          <Link href="/#hero">
            <motion.span
              className="text-2xl font-bold bg-clip-text text-transparent cursor-pointer"
              style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})` }}
              whileHover={{ scale: 1.05 }}
            >
              {store.name}
            </motion.span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                className="relative text-gray-700 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                {item.label}
                <motion.span
                  className="absolute left-0 bottom-[-4px] h-0.5 bg-gradient-to-r"
                  style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})` }}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
            <motion.a
              href="#booking"
              className="px-6 py-2 rounded-full text-sm font-semibold"
              style={{ background: `linear-gradient(45deg, ${primary}, ${secondary})`, color: '#fff' }}
              whileHover={{ scale: 1.05 }}
            >
              Book Now
            </motion.a>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsOpen(true)}
          >
            <Bars3Icon className="h-8 w-8" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-3/4 bg-white shadow-lg p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <motion.span
                className="text-xl font-bold cursor-pointer"
                style={{ color: primary }}
                whileTap={{ scale: 0.95 }}
              >
                {store.name}
              </motion.span>
              <button onClick={() => setIsOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <nav className="flex flex-col space-y-6">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 text-lg font-medium hover:text-gray-900 transition"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <motion.a
              href="#booking"
              onClick={() => setIsOpen(false)}
              className="mt-auto text-center px-4 py-3 rounded-full font-semibold"
              style={{ background: `linear-gradient(45deg, ${primary}, ${secondary})`, color: '#fff' }}
              whileHover={{ scale: 1.05 }}
            >
              Book Now
            </motion.a>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
