"use client";

import React, { useState, useEffect } from "react";
import logo from "@/assets/shop.png";
import {
  ShoppingBagIcon,
  XMarkIcon,
  UserIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  HomeIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  BuildingLibraryIcon,
  TruckIcon,
  PhoneIcon,
  MapPinIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  Bars3BottomRightIcon,
  ArrowRightIcon,
  FilmIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useStateContext } from "@/contexts/ContextProvider";
import { useStoreContext } from '@/contexts/StoreContext';
import UniversalSearchBar from "@/components/search/UniversalSearchBar";

const defaultStoreData = {};

const Header = () => {
  const { 
    user, 
    isDarkMode, 
    setMode, 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    isOpen, 
    setIsOpen
  } = useStateContext();

  const { storeFormData } = useStoreContext();
  const data = { ...defaultStoreData, ...storeFormData };
  const { name, logoUrl, contactPhone, contactEmail } = data;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hiddenPaths = ['/ghuba/profile', '/shop/profile', '/ghuba/feed'];
  if (hiddenPaths.some(p => path.includes(p))) return null;

  return (
    <>
      <header className="w-full flex flex-col z-50">
        {/* Top Info Bar */}
        <TopBar 
          locationName="Nairobi, KE" 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
          phone={contactPhone}
          email={contactEmail}
        />
        
        {/* Main Navigation */}
        <nav
          className={`sticky top-0 z-40 w-full transition-all duration-300 ${
            isSticky 
              ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm border-b border-zinc-200 dark:border-zinc-800" 
              : "bg-white dark:bg-zinc-950"
          }`}
        >
          <div className="container mx-auto flex items-center justify-between px-4 md:px-6 py-4">
            
            {/* Logo Section */}
            <Link 
              href="/" 
              prefetch={true}
              className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
            >
              <div className="relative overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-900 p-1 transition-transform group-hover:scale-105">
                {logoUrl ? (
                  <img src={logoUrl} alt={name || "Store Logo"} className="h-10 w-auto object-contain" loading="lazy" />
                ) : (
                  <img src={logo.src} alt="Default Logo" className="h-10 w-auto object-contain" loading="lazy" />
                )}
              </div>
              {name && !logoUrl && (
                <span className="font-black text-xl text-zinc-900 dark:text-white tracking-tight hidden sm:block">
                  {name}
                </span>
              )}
            </Link>

            {/* Desktop Search Center */}
            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <UniversalSearchBar scope="GHUBA" />
            </div>

            {/* Actions Right */}
            <div className="flex items-center gap-4">
              <NavIcons
                user={user}
                cart={cart}
                isDarkMode={isDarkMode}
                setMode={setMode}
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
              />
              
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" 
                onClick={() => setIsMobileMenuOpen(true)}
              >
                 <Bars3BottomRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Search Row */}
          <div className="md:hidden px-4 pb-3 pt-1">
            <UniversalSearchBar scope="GHUBA" />
          </div>

          <DesktopMenu path={path} />
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && <MobileMenu setIsMobileMenuOpen={setIsMobileMenuOpen} />}
        </AnimatePresence>
        
        <BottomNav path={path} />
      </header>

      <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} cart={cart} />
    </>
  );
};

/* --- SUBCOMPONENTS --- */

const TopBar = ({ locationName, isOpen, setIsOpen, phone, email }: any) => (
  <div className="bg-amber-500 text-zinc-900 text-[11px] font-semibold tracking-wide py-2 hidden md:block">
    <div className="container mx-auto flex justify-between px-6">
      <div className="flex items-center space-x-6">
        <span className="hover:text-white dark:hover:text-black transition-colors cursor-pointer flex items-center gap-1.5">
          <PhoneIcon className="w-3.5 h-3.5" /> {phone || "+254 732 771 353"}
        </span>
        <span className="hover:text-white dark:hover:text-black transition-colors cursor-pointer">
          {email || "support@salesmanpro.site"}
        </span>
      </div>
      <div className="flex items-center space-x-6">
        <span 
          className="flex items-center space-x-1.5 cursor-pointer hover:text-white dark:hover:text-black transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <MapPinIcon className="w-3.5 h-3.5" />
          <span>{locationName || "Select Location"}</span>
        </span>
        <span className="cursor-pointer hover:text-white dark:hover:text-black transition-colors">FAQs</span>
      </div>
    </div>
  </div>
);

const NavIcons = ({ user, cart, isDarkMode, setMode, isCartOpen, setIsCartOpen }: any) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const cartQuantityCount = cart.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0);

  return (
    <div className="flex items-center space-x-1 sm:space-x-3">
      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")) {
              router.push("/stores");
            } else {
              window.location.href = "https://salesmanpro.site/stores";
            }
          }
        }}
        className="hidden lg:flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        <BuildingLibraryIcon className="w-4 h-4" />
        Start Selling
      </button>

      {user && (
        <button 
          onClick={() => router.push("/ghuba/profile")} 
          className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-500 transition-all"
        >
          <UserIcon className="w-6 h-6" />
        </button>
      )}
      
      <button 
        onClick={() => setMode(isDarkMode ? "Light" : "Dark")} 
        className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-500 transition-all"
      >
        {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
      </button>

      <button 
        onClick={() => setIsCartOpen(!isCartOpen)} 
        className="relative p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-500 transition-all group"
      >
        <ShoppingBagIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {mounted && cartQuantityCount > 0 && (
          <span className="absolute 0 top-1 right-0 bg-amber-500 text-zinc-900 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-zinc-950">
            {cartQuantityCount}
          </span>
        )}
      </button>
    </div>
  );
};

const DesktopMenu = ({ path }: { path: string }) => (
  <div className="hidden md:block w-full border-t border-zinc-100 dark:border-zinc-800/50">
    <ul className="container mx-auto flex items-center justify-center space-x-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 py-2">
      {menuItems.map(({ name, icon, link, isExternal }) => {
        const isActive = !isExternal && (path === link || (link !== "/" && path?.startsWith(link)));
        const href = isExternal && typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".localhost"))
          ? "/stores"
          : link;
        return (
          <li key={name}>
            {isExternal ? (
              <a
                href={href}
                className="flex items-center px-4 py-2 rounded-full transition-all gap-2 active:scale-95 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              >
                <span className="opacity-70">{icon}</span> {name}
              </a>
            ) : (
              <Link 
                href={link} 
                prefetch={false}
                className={`flex items-center px-4 py-2 rounded-full transition-all gap-2 active:scale-95 ${
                  isActive
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-500 dark:hover:text-amber-400"
                }`}
              >
                <span className={isActive ? "opacity-100" : "opacity-70"}>{icon}</span> {name}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  </div>
);

const MobileMenu = ({ setIsMobileMenuOpen }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="fixed inset-0 bg-white/90 dark:bg-zinc-950/90 z-[60] flex flex-col justify-center px-8"
    >
      <button 
        onClick={() => setIsMobileMenuOpen(false)} 
        className="absolute top-6 right-6 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-900 dark:text-white active:scale-95"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      
      <div className="space-y-6">
        {menuItems.map(({ name, icon, link, isExternal }, i) => {
          const href = isExternal && typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".localhost"))
            ? "/stores"
            : link;
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {isExternal ? (
                <a
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-2xl font-black text-left flex items-center gap-6 text-zinc-800 dark:text-white hover:text-amber-500 dark:hover:text-amber-500 transition-colors active:scale-95"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-amber-500">
                    {icon}
                  </div>
                  {name}
                </a>
              ) : (
                <Link 
                  href={link} 
                  prefetch={false}
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-full text-2xl font-black text-left flex items-center gap-6 text-zinc-800 dark:text-white hover:text-amber-500 dark:hover:text-amber-500 transition-colors active:scale-95"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-amber-500">
                    {icon}
                  </div>
                  {name}
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

/* --- UPDATED CREATIVE 5-ITEM BOTTOM NAV BAR --- */
const BottomNav = ({ path }: { path: string }) => {
  const router = useRouter();

  const handleSellClick = () => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")) {
        router.push("/stores");
      } else {
        window.location.href = "https://salesmanpro.site/stores";
      }
    }
  };

  const items = [
    { name: "Home", icon: HomeIcon, link: "/" },
    { name: "Reels", icon: FilmIcon, link: "/ghuba/feed" },
    { name: "Sell", icon: BuildingLibraryIcon, link: "/stores", isAction: true },
    { name: "Explore", icon: MagnifyingGlassIcon, link: "/ghuba/productlist" },
    { name: "Profile", icon: UserIcon, link: "/ghuba/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden px-4 pb-3 pt-1 pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 py-1.5 relative">
        {items.map(({ name, icon: Icon, link, isAction }) => {
          const isActive = path === link || (link !== "/" && path?.startsWith(link));

          if (isAction) {
            return (
              <button
                key={name}
                onClick={handleSellClick}
                className="relative -top-5 flex flex-col items-center justify-center active:scale-90 transition-transform group"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/40 flex items-center justify-center border-4 border-white dark:border-zinc-950 group-hover:rotate-6 transition-all">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black tracking-tight text-amber-600 dark:text-amber-400 mt-0.5">
                  {name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={name}
              href={link}
              prefetch={true}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-90 ${
                isActive
                  ? "text-amber-500"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-amber-500/10 stroke-[2.2] text-amber-500 scale-110" : "stroke-[1.7]"} transition-transform`} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? "font-black text-amber-500" : ""}`}>
                {name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const CartDrawer = ({ isCartOpen, setIsCartOpen, cart }: any) => {
  const { addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const router = useRouter();

  const totalItemCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc: number, item: any) => acc + (item.finalPrice * item.quantity), 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                  Your Cart 
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                    {totalItemCount} Items
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full bg-white dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white shadow-sm border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5">
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-full">
                    <ShoppingBagIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg text-zinc-900 dark:text-zinc-200">Your cart is empty</h5>
                    <p className="text-sm text-zinc-500 mt-2">Looks like you haven't added anything yet.</p>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-6 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item: any, idx: number) => {
                  const hasSelectedOptions = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;
                  const itemSignatureId = hasSelectedOptions 
                    ? `${item.id}-${JSON.stringify(item.selectedOptions)}` 
                    : item.id;

                  return (
                    <motion.div 
                      key={`${item.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow items-center relative group"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-100 dark:border-zinc-700/50">
                        <img 
                          src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                          alt={item.name}
                          className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                        />
                      </div>

                      <div className="flex-grow min-w-0 pr-8">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {item.name || item.title}
                        </h4>
                        
                        {hasSelectedOptions && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.selectedOptions).map(([key, val]: any) => (
                              <span key={key} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 text-sm font-black text-amber-600 dark:text-amber-400">
                          KSH {item.finalPrice.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 h-full shrink-0">
                        <button 
                          onClick={() => removeFromCart && removeFromCart(itemSignatureId)}
                          className="absolute top-4 right-4 text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>

                        <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 rounded-full p-1 border border-zinc-200 dark:border-zinc-800 mt-auto">
                          <button 
                            onClick={() => decreaseQuantity(itemSignatureId)}
                            className="p-1 rounded-full text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-colors"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center text-zinc-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="p-1 rounded-full text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-colors"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-zinc-500">Subtotal</span>
                  <span className="font-black text-xl text-zinc-900 dark:text-white">
                    KSH {cartSubtotal.toLocaleString()}
                  </span>
                </div>
                
                <button
                  onClick={() => { setIsCartOpen(false); router.push("/ghuba/checkout"); }}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRightIcon className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  link: string;
  isExternal?: boolean;
}

const menuItems: MenuItem[] = [
  { name: "Home", icon: <HomeIcon className="w-5 h-5" />, link: "/" },
  { name: "Reels Feed", icon: <FilmIcon className="w-5 h-5 text-amber-500" />, link: "/ghuba/feed" },
  { name: "All Products", icon: <DocumentTextIcon className="w-5 h-5" />, link: "/ghuba/productlist" },
  { name: "Categories", icon: <DocumentDuplicateIcon className="w-5 h-5" />, link: "/ghuba/categories" },
  { name: "Start Selling", icon: <BuildingLibraryIcon className="w-5 h-5" />, link: "https://salesmanpro.site/stores", isExternal: true }, 
  { name: "Track Order", icon: <TruckIcon className="w-5 h-5" />, link: "/ghuba/orderTracking" },
];

export default Header;