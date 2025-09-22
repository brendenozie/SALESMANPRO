"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassCircleIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MegaphoneIcon,
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { useStateContext } from "@/contexts/ContextProvider";
import { useRouter } from "next/navigation";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const { cart, addToCart, removeFromCart } = useStateContext();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { name, slug, logoUrl, contactEmail, contactPhone, socialLinks, themeSettings } =
    storeFormData;

  const primaryColor = themeSettings?.primaryColor || "#FF5722"; // Deep Orange
  const secondaryColor = themeSettings?.secondaryColor || "#3F51B5"; // Indigo

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: `/site/${slug}` },
    { label: "Menu", href: `/site/${slug}#menu` },
    { label: "About", href: `/site/${slug}#about` },
    { label: "Contact", href: `/site/${slug}#contact` },
  ];

  return (
    <motion.header
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      {/* Top Info Bar */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-xs font-medium text-gray-700"
        style={{ backgroundColor: scrolled ? "#f8f8f8" : `${primaryColor}1A` }}
      >
        <div className="flex items-center space-x-6">
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="flex items-center space-x-1" style={{ color: primaryColor }}>
              <PhoneIcon className="h-4 w-4" />
              <span>{contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="flex items-center space-x-1" style={{ color: primaryColor }}>
              <MegaphoneIcon className="h-4 w-4" />
              <span>{contactEmail}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks?.map((s) => (
            <Link key={s.channel} href={s.url} target="_blank" rel="noopener noreferrer">
              <span className="capitalize" style={{ color: primaryColor }}>
                {s.channel}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/site/${slug}`} className="flex items-center space-x-3 flex-shrink-0">
            {logoUrl ? (
              <Image src={logoUrl} alt={name || "Restaurant Logo"} width={150} height={50} className="object-contain" loader={loader} />
            ) : (
              <span className="text-2xl font-extrabold">{name || "Restaurant Name"}</span>
            )}
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex flex-grow justify-center space-x-8 font-medium text-lg">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-[var(--primary-color)]">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <input type="search" placeholder="Search dishes..." className="w-48 rounded-full py-2 px-4" />
              <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Profile */}
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => router.push(`/${slug}/profile`)}>
              <UserIcon className="h-6 w-6" />
            </motion.button>

            {/* Cart */}
            <div className="relative">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => setCartOpen(!cartOpen)} className="relative">
                <ShoppingCartIcon className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </motion.button>

              {/* Cart Dropdown */}
              <AnimatePresence>
                {cartOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-lg p-4 z-50"
                  >
                    {cart.length === 0 ? (
                      <p className="text-sm text-gray-500">Your cart is empty.</p>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {item.images?.[0] && (
                                <Image
                                  src={item.images[0]}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="rounded-md object-cover"
                                />
                              )}
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => removeFromCart(item)}
                                className="p-1 border rounded-full hover:bg-gray-100"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => addToCart(item)}
                                className="p-1 border rounded-full hover:bg-gray-100"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <Link
                          href={`/site/${slug}/checkout`}
                          className="block text-center w-full py-2 rounded-md font-semibold"
                          style={{ backgroundColor: primaryColor, color: "white" }}
                        >
                          Go to Checkout
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3BottomLeftIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
