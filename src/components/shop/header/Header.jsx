import React, { useState, useEffect } from "react";
import logo from "../../../assets/fit1.png";
import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Header = ({ CartItem }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="w-full bg-white shadow-md">
      {/* Top Bar */}
      <TopBar />

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 bg-white transition-all ${isSticky ? "shadow-lg" : ""}`}>
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <a href="/">
            <img src={logo.src} alt="Logo" className="w-32 transition-transform transform hover:scale-105" loading="lazy" />
          </a>

          {/* Search Bar */}
          <SearchBar />

          {/* Icons */}
          <NavIcons
            CartItem={CartItem}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && <MobileMenu setIsMobileMenuOpen={setIsMobileMenuOpen} />}
    </header>
  );
};

const TopBar = () => (
  <div className="bg-blue-900 text-white text-sm py-2 hidden md:block animate-fadeIn">
    <div className="container mx-auto flex justify-between px-6">
      <div className="flex space-x-6">
        <span className="flex items-center space-x-2">
          <i className="fa fa-phone"></i>
          <span>+88012 3456 7894</span>
        </span>
        <span className="flex items-center space-x-2">
          <i className="fa fa-envelope"></i>
          <span>support@ui-lib.com</span>
        </span>
      </div>
      <div className="flex space-x-6">
        <span className="hover:text-gray-300 cursor-pointer">FAQs</span>
        <span className="hover:text-gray-300 cursor-pointer">Need Help?</span>
      </div>
    </div>
  </div>
);

const SearchBar = () => (
  <div className="hidden md:flex items-center relative w-1/2">
    <MagnifyingGlassIcon className="absolute left-3 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder="Search products..."
      className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-600 text-gray-700 transition-shadow focus:shadow-lg"
    />
  </div>
);

const NavIcons = ({ CartItem, isMobileMenuOpen, setIsMobileMenuOpen }) => (
  <div className="flex items-center space-x-6">
    <UserIcon className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" />
    <div className="relative cursor-pointer">
      <ShoppingBagIcon className="w-6 h-6 text-gray-600 hover:text-blue-600 transition-colors" />
      {CartItem.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
          {CartItem.length}
        </span>
      )}
    </div>
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="md:hidden text-gray-600"
      aria-label="Toggle Menu"
    >
      {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
    </button>
  </div>
);

const MobileMenu = ({ setIsMobileMenuOpen }) => (
  <div className="fixed top-0 left-0 w-full h-full bg-white flex flex-col items-center justify-center space-y-6 z-50 animate-slideIn">
    {[
      { name: "Home", path: "/" },
      { name: "Pages", path: "/pages" },
      { name: "User Account", path: "/user" },
      { name: "Vendor Account", path: "/vendor" },
      { name: "Track My Order", path: "/track" },
      { name: "Contact", path: "/contact" },
    ].map((item) => (
      <a key={item.name} href={item.path} className="text-xl font-medium hover:text-blue-600 transition-colors">
        {item.name}
      </a>
    ))}
    <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-6" aria-label="Close Menu">
      <XMarkIcon className="w-6 h-6 text-gray-600 hover:text-red-600 transition-colors" />
    </button>
  </div>
);

export default Header;
