"use client"

import React, { useState, useEffect } from "react";
import logo from "../../../assets/shop.png";
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
  MapPinIcon
} from "@heroicons/react/24/outline";
import { useStateContext } from "../../../contexts/ContextProvider.js";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import { usePathname } from 'next/navigation';

const Header = () => {
  const {user, isDarkMode, setMode, cart, isCartOpen, setIsCartOpen, location, setLocation, locationName, setLocationName,isOpen, setIsOpen, onClose, onUpdate } = useStateContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const path = usePathname();
  // bail out on /stores or any deeper stores route
  if (path.startsWith('/stores')) return null;  
  if (path.startsWith('/admin')) return null;
  if (path.startsWith('/agent')) return null;
  if (path.startsWith('/clients')) return null;
  if (path.startsWith('/site')) return null;
  
  return (
    <header className="w-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 shadow-md transition-colors duration-300">
      <TopBar location={location} setLocation={setLocation} locationName={locationName} setLocationName={setLocationName} isOpen={isOpen} setIsOpen={setIsOpen} onClose={onClose} onUpdate={onUpdate}/>
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
          <SearchBar location={location} setLocation={setLocation} locationName={locationName} setLocationName={setLocationName}/>
          <NavIcons
            user={user}
            cart={cart}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isDarkMode={isDarkMode}
            setDarkMode={setMode}
            isCartOpen={isCartOpen} 
            setIsCartOpen={setIsCartOpen}
          />
        </div>
        {/* Desktop Menu */}
        <DesktopMenu />
      </nav>

      {isMobileMenuOpen && (
        <MobileMenu setIsMobileMenuOpen={setIsMobileMenuOpen} />
      )}
      
      <BottomNav />
    </header>
  );
};

export default Header;

const SearchBar = ({location, setLocation, locationName, setLocationName}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  // Simulating API call to fetch search suggestions
  const fetchSuggestions = async (query) => {
    setLoading(true);
    setError(null);

    try {
      // Replace this URL with your actual API endpoint
      const response = await fetch(`/api/shop/products?search=${query}`);
      const data = await response.json();
      
      setSuggestions(data.products);
      setIsDropdownVisible(data.products.length > 0);
    } catch (err) {
      setError("Failed to fetch suggestions.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of the fetchSuggestions function
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      setIsDropdownVisible(false);
    } else {
      debouncedFetchSuggestions(searchTerm);
    }

    // Cleanup debounced function on unmount
    return () => debouncedFetchSuggestions.cancel();
  }, [searchTerm]);

  return (
    <div className="relative w-1/2 hidden md:flex items-center">
      <MagnifyingGlassIcon className="absolute left-3 text-yellow-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search products..."
        className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-4 focus:ring-yellow-400 focus:outline-none text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsDropdownVisible(suggestions.length > 0)}
        onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)} // Delay to allow clicking suggestions
      />
      <button 
        onClick={() => router.push(`/shop/productlist?location=${location}`)} 
        className="absolute right-3 text-yellow-400 text-xs hover:underline"
      >
        🔍 View Nearby Deals
      </button>
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute top-full right-4 mt-2 text-yellow-400 animate-spin">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="31.4">
              <animate attributeName="stroke-dashoffset" from="31.4" to="0" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      )}
      
      {/* Error message */}
      {error && <div className="absolute top-full mt-2 text-red-600">{error}</div>}

      {/* Dropdown for suggestions */}
      {isDropdownVisible && !loading && !error && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
        >
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white cursor-pointer transition"
              onMouseDown={() => {
                // setSearchTerm(item);
                router.push(`/shop/product/${item.id}`);
              }} // Set input value on click
            >
              {item.title}
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

const TopBar = ({location, setLocation, locationName, setLocationName, isOpen, setIsOpen, onClose, onUpdate}) => (
  <div className="bg-yellow-400 text-black text-sm py-2 hidden md:block animate-fadeIn dark:bg-yellow-500">
    <div className="container mx-auto flex justify-between px-6">
      <div className="flex space-x-6">
        <span className="flex items-center space-x-2">
          <i className="fa fa-phone"></i>
          <span>+254 706 448 146</span>
        </span>
        <span className="flex items-center space-x-2">
          <i className="fa fa-envelope"></i>
          <span>support@ghuba.shop</span>
        </span>
      </div>
      <div className="flex space-x-6">
        <span className="flex items-center space-x-2 cursor-pointer" onClick={() => {setIsOpen(!isOpen)}}>
          <MapPinIcon className="w-4 h-4 text-gray-800 dark:text-white" />
          <span>{locationName}</span>
        </span>
        <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">FAQs</span>
        <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">Need Help?</span>
      </div>
    </div>
  </div>
);

const NavIcons = ({
  user,
  cart,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isDarkMode,
  setDarkMode,
  isCartOpen,
  setIsCartOpen
}) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Ensures hydration-safe rendering
  }, []);

  
  const handleProfileClick = () => {
    if (user) {
      router.push("/shop/profile");
    }
  };

  return (
    <div className="flex items-center space-x-6">
      {user && <UserIcon onClick={handleProfileClick} className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-transform transform hover:scale-125" />}
      <motion.div onClick={() => setIsCartOpen(!isCartOpen)} className="relative cursor-pointer">
        <ShoppingBagIcon className="w-6 h-6 text-yellow-400 hover:text-yellow-300 transition-transform transform hover:scale-125" />
        {isMounted && cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
            {cart.length}
          </span>
        )}
      </motion.div>
      <button
        onClick={() => setDarkMode(isDarkMode ? "Light" : "Dark")}
        className="text-yellow-400 hover:text-yellow-300 transition-transform transform hover:scale-125"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
      </button>
    </div>
  );
};

const menuItems = [
  { name: "Home", icon: <HomeIcon className="w-5 h-5 mr-2" />, link: "/" },
  { name: "All Products", icon: <DocumentTextIcon className="w-5 h-5 mr-2" />, link: "/shop/productlist" },
  { name: "All Categories", icon: <DocumentDuplicateIcon className="w-5 h-5 mr-2" />, link: "/shop/categories" },
  { name: "My Shop", icon: <BuildingLibraryIcon className="w-5 h-5 mr-2" />, link: "/stores" },
  { name: "Track My Order", icon: <TruckIcon className="w-5 h-5 mr-2" />, link: "/shop/orderTracking" },
  { name: "Contact", icon: <PhoneIcon className="w-5 h-5 mr-2" />, link: "/shop/contact" },
];

const DesktopMenu = () => (
  <ul className="hidden md:flex items-center space-x-6 text-orange-500 dark:text-yellow-400 font-medium justify-end">
    {menuItems.map(({ name, icon, link }) => (
      <li key={name} className="relative group">
        <a
          href={link}
          className="flex items-center px-4 py-2 transition-all duration-300 rounded-lg hover:bg-yellow-500 hover:text-white hover:shadow-md"
        >
          {icon}
          {name}
        </a>
        {/* Underline Effect */}
        <span className="absolute left-0 bottom-0 w-0 h-1 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
      </li>
    ))}
  </ul>
);

const BottomNav = () => {
  const router = useRouter();
  const menuItems = [
    { name: "Home", icon: HomeIcon, link: "/" },
    { name: "Products", icon: DocumentTextIcon, link: "/shop/productlist" },
    { name: "Categories", icon: DocumentDuplicateIcon, link: "/shop/categories" },
    { name: "Orders", icon: TruckIcon, link: "/shop/orderTracking" },
    { name: "Profile", icon: UserIcon, link: "/shop/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-gray-300 dark:border-gray-700 flex justify-around py-3 shadow-lg md:hidden z-50">
      {menuItems.map(({ name, icon: Icon, link }) => (
        <button
          key={name}
          onClick={() => router.push(link)}
          className="flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-yellow-500 transition-all"
        >
          <Icon className="w-6 h-6" />
          <span className="text-xs mt-1">{name}</span>
        </button>
      ))}
    </div>
  );
};

const MobileMenu = ({ setIsMobileMenuOpen }) => (
  <div className="fixed top-0 left-0 w-full h-full bg-white dark:bg-black flex flex-col items-center justify-center space-y-6 z-50">
    <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-6">
      <XMarkIcon className="w-6 h-6" />
    </button>
    {menuItems.map(({ name, icon: Icon, link }) => (
      <button key={name} onClick={() => router.push(link)} className="text-2xl flex items-center space-x-2">
        <Icon className="w-6 h-6" />
        <span>{name}</span>
      </button>
    ))}
  </div>
);
