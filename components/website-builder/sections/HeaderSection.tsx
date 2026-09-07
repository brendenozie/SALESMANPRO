"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { NavigationConfig, ThemeTokens } from "@/types/website-builder";
import { useStateContext } from "@/contexts/ContextProvider";

const WhatsAppBubbleIcon = ({className}:{className?: string}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M12 2a10 10 0 00-8.94 14.47L2 22l5.73-1.5A10 10 0 1012 2zm0 18a8 8 0 01-4.07-1.12l-.29-.17-3.4.89.91-3.31-.19-.31A8 8 0 1112 20zm4.39-5.46c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.43h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
    </svg>
  );
};

interface HeaderProps {
  navigation: NavigationConfig;
  theme: ThemeTokens;
  storeName: string;
  storeSlug: string;
  logoUrl?: string | null;
  contactPhone?: string | null;
  currentPath?: string;
  onNavigate?: (url: string) => void;
  isEditorPreview?: boolean;
}

export default function HeaderSection({
  navigation,
  theme,
  storeName,
  storeSlug,
  logoUrl,
  contactPhone,
  currentPath = "/",
  onNavigate,
  isEditorPreview = false,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cart from global app context if available
  let cartCount = 0;
  try {
    const context = useStateContext();
    cartCount = (context?.cart || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
  } catch {
    cartCount = 0;
  }

  const { headerSettings, headerItems } = navigation;

  useEffect(() => {
    setMounted(true);
    if (isEditorPreview) return;
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isEditorPreview]);

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    if (isEditorPreview && onNavigate) {
      e.preventDefault();
      onNavigate(url);
    }
  };

  const whatsappNumber = contactPhone ? contactPhone.replace(/\D/g, "") : "";

  return (
    <>
      {/* 1. Announcement Bar */}
      {headerSettings.showAnnouncementBar && headerSettings.announcementBarText && (
        <div
          className="w-full py-2 px-4 text-xs font-semibold text-center tracking-wide transition-colors"
          style={{
            backgroundColor: theme.primaryColor,
            color: "#FFFFFF",
          }}
        >
          {headerSettings.announcementBarText}
        </div>
      )}

      {/* 2. Main Header */}
      <header
        className={`w-full transition-all duration-300 z-40 ${
          headerSettings.sticky ? "sticky top-0" : "relative"
        } ${
          scrolled
            ? "bg-white/95 dark:bg-zinc-950/95 shadow-md backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 py-3"
            : "bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/60 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              onClick={(e) => handleLinkClick(e, "/")}
              className="flex items-center gap-3 group"
            >
              {logoUrl ? (
                <div className="relative flex items-center" style={{ height: `${headerSettings.logoHeight || 44}px` }}>
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="h-full w-auto object-contain max-h-12"
                  />
                </div>
              ) : (
                <span
                  className="text-xl sm:text-2xl font-black tracking-tight uppercase"
                  style={{ color: theme.primaryColor }}
                >
                  {storeName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {headerItems.map((item) => {
                const isActive = currentPath === item.url || (item.url !== "/" && currentPath.startsWith(item.url));
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={(e) => handleLinkClick(e, item.url)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "font-bold"
                        : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50"
                    }`}
                    style={
                      isActive
                        ? {
                            color: theme.primaryColor,
                            backgroundColor: `${theme.primaryColor}14`,
                          }
                        : {}
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Search, WhatsApp, User, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            {headerSettings.showSearch && (
              <button
                type="button"
                onClick={() => setShowSearchModal(!showSearchModal)}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                aria-label="Search Catalog"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            )}

            {/* WhatsApp Direct Action */}
            {headerSettings.showWhatsAppBtn && whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hello%20${encodeURIComponent(storeName)}%2C%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                <WhatsAppBubbleIcon className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* User Account */}
            {headerSettings.showUserAccount && (
              <Link
                href="/profile"
                onClick={(e) => handleLinkClick(e, "/profile")}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition hidden sm:inline-flex"
                aria-label="My Account"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            {/* Cart Trigger */}
            {headerSettings.showCart && (
              <Link
                href="/cart"
                onClick={(e) => handleLinkClick(e, "/cart")}
                className="relative p-2 rounded-xl text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center"
                aria-label="Shopping Cart"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none min-w-[18px] text-center"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200/80 dark:border-zinc-800 px-4 pt-3 pb-6 bg-white dark:bg-zinc-900 space-y-2 animate-fadeIn">
            {headerItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleLinkClick(e, item.url);
                }}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {item.label}
              </Link>
            ))}

            {whatsappNumber && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-500 text-white shadow-sm"
                >
                  <WhatsAppBubbleIcon className="w-5 h-5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
