import React, { useState, useEffect } from "react";
import logo from "../../../assets/shop.png";
import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "../../../contexts/ContextProvider.js";

const Header = () => {
  const { isDarkMode, setMode, cart } = useStateContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  

  return (
    <header className="w-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 shadow-md transition-colors duration-300">
      <TopBar />

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
            cart={cart}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isDarkMode={isDarkMode}
            setDarkMode={setMode}
          />
        </div>
      </nav>

      {isMobileMenuOpen && (
        <MobileMenu setIsMobileMenuOpen={setIsMobileMenuOpen} />
      )}
    </header>
  );
};

const TopBar = () => (
  <div className="bg-yellow-400 text-black text-sm py-2 hidden md:block animate-fadeIn dark:bg-yellow-500">
    <div className="container mx-auto flex justify-between px-6">
      <div className="flex space-x-6">
        <span className="flex items-center space-x-2">
          <i className="fa fa-phone"></i>
          <span>+254 706 448 146</span>
        </span>
        <span className="flex items-center space-x-2">
          <i className="fa fa-envelope"></i>
          <span>support@kapu.com</span>
        </span>
      </div>
      <div className="flex space-x-6">
        <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">FAQs</span>
        <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">Need Help?</span>
      </div>
    </div>
  </div>
);

const SearchBar = () => (
  <div className="hidden md:flex items-center relative w-1/2">
    <MagnifyingGlassIcon className="absolute left-3 text-yellow-400 w-5 h-5 hover:text-yellow-300 transition duration-300" />
    <input
      type="text"
      placeholder="Search products..."
      className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-4 focus:ring-yellow-400 focus:outline-none text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow-md transition-transform duration-300 hover:scale-105"
    />
  </div>
);

const NavIcons = ({
  cart,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isDarkMode,
  setDarkMode,
}) => (
  <div className="flex items-center space-x-6">
    <UserIcon className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-transform transform hover:scale-125" />
    <div className="relative cursor-pointer">
      <ShoppingBagIcon className="w-6 h-6 text-yellow-400 hover:text-yellow-300 transition-transform transform hover:scale-125" />
      {cart.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
          {CartItem.length}
        </span>
      )}
    </div>
    <button
      onClick={() => setDarkMode(isDarkMode ? "Light" : "Dark")}
      className="text-yellow-400 hover:text-yellow-300 transition-transform transform hover:scale-125"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
    </button>
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="md:hidden text-yellow-400 hover:text-yellow-300 transition-transform transform hover:scale-125"
      aria-label="Toggle Menu"
    >
      {isMobileMenuOpen ? (
        <XMarkIcon className="w-6 h-6" />
      ) : (
        <Bars3Icon className="w-6 h-6" />
      )}
    </button>
  </div>
);

const MobileMenu = ({ setIsMobileMenuOpen }) => (
  <div className="fixed top-0 left-0 w-full h-full bg-white dark:bg-black bg-opacity-90 backdrop-blur-lg flex flex-col items-center justify-center space-y-6 z-50 animate-fadeIn transition-colors duration-300">
    {["Home", "Pages", "User Account", "Vendor Account", "Track My Order", "Contact"].map(
      (item) => (
        <a
          key={item}
          href={`/${item.toLowerCase().replace(/ /g, "")}`}
          className="text-2xl text-yellow-400 font-semibold hover:text-yellow-300 transition-transform transform hover:scale-110"
        >
          {item}
        </a>
      )
    )}
    <button
      onClick={() => setIsMobileMenuOpen(false)}
      className="absolute top-4 right-6 text-yellow-400 hover:text-red-600 transition-transform transform hover:rotate-90"
      aria-label="Close Menu"
    >
      <XMarkIcon className="w-6 h-6" />
    </button>
  </div>
);

export default Header;
