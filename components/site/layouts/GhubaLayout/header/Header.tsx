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
  PlusIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { debounce } from "lodash";
import { useStateContext } from "@/contexts/ContextProvider";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hiddenPaths = ['/ghuba/profile', '/shop/profile'];
  if (hiddenPaths.some(p => path.includes(p))) return null;

  return (
    <>
      <header className="w-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 shadow-md transition-colors duration-300">
        <TopBar 
          locationName="Nairobi, KE" 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
        />
        
        <nav
          className={`sticky top-0 z-50 bg-gradient-to-b from-white via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black bg-opacity-90 backdrop-blur-md transition-all duration-300 ${
            isSticky ? "shadow-2xl" : "shadow-none"
          }`}
        >
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <a href="/">
              <img
                src={logo.src}
                alt="Logo"
                className="w-32 transition-transform transform hover:scale-110"
                loading="lazy"
              />
            </a>

            <SearchBar />

            <NavIcons
              user={user}
              cart={cart}
              isDarkMode={isDarkMode}
              setMode={setMode}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
            />
            
            <button className="md:hidden text-yellow-500" onClick={() => setIsMobileMenuOpen(true)}>
               <div className="space-y-1">
                  <span className="block w-6 h-0.5 bg-current"></span>
                  <span className="block w-6 h-0.5 bg-current"></span>
                  <span className="block w-6 h-0.5 bg-current"></span>
               </div>
            </button>
          </div>

          <DesktopMenu />
        </nav>

        {isMobileMenuOpen && (
          <MobileMenu setIsMobileMenuOpen={setIsMobileMenuOpen} />
        )}
        
        <BottomNav />
      </header>

      {/* Slide-out Sidebar Cart Engine */}
      <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
};

/* --- SUBCOMPONENTS --- */

const CartDrawer = ({ isCartOpen, setIsCartOpen }: any) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const router = useRouter();

  // Deduplicate and aggregate individual variation structures accurately
  const totalItemCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc: number, item: any) => acc + (item.finalPrice * item.quantity), 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          {/* Backdrop map overlay overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Slider content body panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white dark:bg-[#0F0F0F] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10"
          >
            {/* Header matrix elements */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  Shopping Cart 
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold">
                    {totalItemCount}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">Review selected items and configurations.</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* List entries frame */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-full text-zinc-400">
                    <ShoppingBagIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-black uppercase text-xs tracking-wider text-zinc-400">Your basket is empty</h5>
                    <p className="text-xs text-zinc-400 max-w-[200px] mx-auto mt-1">Add items to configure options or secure purchases.</p>
                  </div>
                </div>
              ) : (
                cart.map((item: any, idx: number) => {
                  // Unique signature logic supporting standalone and multi-variant objects
                  const hasSelectedOptions = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;
                  const itemSignatureId = hasSelectedOptions 
                    ? `${item.id}-${JSON.stringify(item.selectedOptions)}` 
                    : item.id;

                  return (
                    <motion.div 
                      key={`${item.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 items-center"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 relative">
                        <img 
                          src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-grow space-y-1">
                        <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white line-clamp-1">
                          {item.name || item.title}
                        </h4>
                        
                        {/* Dynamic custom variant pills inside options mapping arrays */}
                        {hasSelectedOptions && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {Object.entries(item.selectedOptions).map(([key, val]: any) => (
                              <span 
                                key={key}
                                className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300/20"
                              >
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 pt-1">
                          KSH {item.finalPrice.toLocaleString()}
                        </div>
                      </div>

                      {/* Item adjustment action matrices */}
                      <div className="flex flex-col items-end justify-between h-full min-h-[64px] shrink-0">
                        <button 
                          onClick={() => removeFromCart ? removeFromCart(itemSignatureId) : null}
                          className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>

                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200/40 dark:border-zinc-700/30">
                          <button 
                            onClick={() => decreaseQuantity(itemSignatureId)}
                            className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <span className="text-[11px] font-black px-2 text-zinc-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
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

            {/* Footer metrics processing */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-zinc-400 uppercase text-xs tracking-wider">Subtotal</span>
                  <span className="font-black text-lg text-zinc-900 dark:text-white">
                    KSH {cartSubtotal.toLocaleString()}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/ghuba/checkout");
                  }}
                  className="w-full py-4 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-[0.99]"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchSuggestions = async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/shop/products?search=${query}`);
      const data = await response.json();
      setSuggestions(data.products || []);
      setIsDropdownVisible((data.products || []).length > 0);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = React.useMemo(() => debounce(fetchSuggestions, 500), []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      setIsDropdownVisible(false);
    } else {
      debouncedFetch(searchTerm);
    }
  }, [searchTerm, debouncedFetch]);

  return (
    <div className="relative w-1/2 hidden md:flex items-center">
      <MagnifyingGlassIcon className="absolute left-3 text-yellow-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search products..."
        className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-4 focus:ring-yellow-400 focus:outline-none text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
      />
      <button 
        onClick={() => router.push(`/ghuba/productlist`)} 
        className="absolute right-3 text-yellow-400 text-xs hover:underline"
      >
        🔍 Nearby Deals
      </button>

      {isDropdownVisible && (
        <motion.ul className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((item: any) => (
            <li
              key={item.id}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
              onMouseDown={() => router.push(`/ghuba/product/${item.id}`)}
            >
              {item.title}
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

const TopBar = ({ locationName, isOpen, setIsOpen }: any) => (
  <div className="bg-yellow-400 text-black text-sm py-2 hidden md:block dark:bg-yellow-500">
    <div className="container mx-auto flex justify-between px-6">
      <div className="flex space-x-6">
        <span>+254 732 771 353</span>
        <span>support@salesmanpro.site</span>
      </div>
      <div className="flex space-x-6">
        <span className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <MapPinIcon className="w-4 h-4" />
          <span>{locationName || "Select Location"}</span>
        </span>
        <span className="cursor-pointer">FAQs</span>
      </div>
    </div>
  </div>
);

const NavIcons = ({ user, cart, isDarkMode, setMode, isCartOpen, setIsCartOpen }: any) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Compute actual aggregated structural total quantity metric
  const cartQuantityCount = cart.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0);

  return (
    <div className="flex items-center space-x-6">
      {user && (
        <UserIcon 
          onClick={() => router.push("/ghuba/profile")} 
          className="w-6 h-6 text-yellow-400 cursor-pointer hover:scale-125 transition-transform" 
        />
      )}
      <div onClick={() => setIsCartOpen(!isCartOpen)} className="relative cursor-pointer">
        <ShoppingBagIcon className="w-6 h-6 text-yellow-400 hover:scale-125 transition-transform" />
        {mounted && cartQuantityCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-bounce">
            {cartQuantityCount}
          </span>
        )}
      </div>
      <button onClick={() => setMode(isDarkMode ? "Light" : "Dark")} className="text-yellow-400">
        {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
      </button>
    </div>
  );
};

const DesktopMenu = () => (
  <ul className="hidden md:flex items-center space-x-6 text-orange-500 dark:text-yellow-400 font-medium justify-center pb-2">
    {menuItems.map(({ name, icon, link }) => (
      <li key={name} className="relative group">
        <a href={link} className="flex items-center px-4 py-2 transition-all rounded-lg hover:bg-yellow-500 hover:text-white">
          {icon} {name}
        </a>
      </li>
    ))}
  </ul>
);

const BottomNav = () => {
  const router = useRouter();
  const items = [
    { name: "Home", icon: HomeIcon, link: "/" },
    { name: "Products", icon: DocumentTextIcon, link: "/ghuba/productlist" },
    { name: "Categories", icon: DocumentDuplicateIcon, link: "/ghuba/categories" },
    { name: "Orders", icon: TruckIcon, link: "/ghuba/orderTracking" },
    { name: "Profile", icon: UserIcon, link: "/ghuba/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t flex justify-around py-3 shadow-lg md:hidden z-50">
      {items.map(({ name, icon: Icon, link }) => (
        <button key={name} onClick={() => router.push(link)} className="flex flex-col items-center text-gray-500 dark:text-gray-400">
          <Icon className="w-6 h-6" />
          <span className="text-[10px] mt-1">{name}</span>
        </button>
      ))}
    </div>
  );
};

const MobileMenu = ({ setIsMobileMenuOpen }: any) => {
  const router = useRouter();
  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center space-y-8 z-[60]">
      <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6">
        <XMarkIcon className="w-8 h-8 text-yellow-500" />
      </button>
      {menuItems.map(({ name, icon, link }) => (
        <button key={name} onClick={() => { router.push(link); setIsMobileMenuOpen(false); }} className="text-2xl flex items-center space-x-4">
           <span className="w-8 h-8 text-yellow-500">{icon}</span>
           <span>{name}</span>
        </button>
      ))}
    </div>
  );
};

const menuItems = [
  { name: "Home", icon: <HomeIcon className="w-5 h-5 mr-2" />, link: "/" },
  { name: "All Products", icon: <DocumentTextIcon className="w-5 h-5 mr-2" />, link: "/ghuba/productlist" },
  { name: "All Categories", icon: <DocumentDuplicateIcon className="w-5 h-5 mr-2" />, link: "/ghuba/categories" },
  { name: "My Shop", icon: <BuildingLibraryIcon className="w-5 h-5 mr-2" />, link: "/stores" },
  { name: "Track Order", icon: <TruckIcon className="w-5 h-5 mr-2" />, link: "/ghuba/orderTracking" },
  { name: "Contact", icon: <PhoneIcon className="w-5 h-5 mr-2" />, link: "/ghuba/contact" },
];

export default Header;