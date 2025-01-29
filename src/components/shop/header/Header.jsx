import React, { useState, useEffect } from "react";
import logo from "../../../assets/fit1.png";
import {
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

const Header = ({ CartItem }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSearchActive(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="w-full">
      {/* Top Bar */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 py-2 text-white text-sm">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <i className="fa fa-phone"></i>
              <span>+88012 3456 7894</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fa fa-envelope"></i>
              <span>support@ui-lib.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-gray-300 cursor-pointer">FAQs</span>
            <span className="hover:text-gray-300 cursor-pointer">Need Help?</span>
            <div className="flex items-center space-x-2">
              <span role="img" aria-label="language">🏳️‍⚧️</span>
              <span className="hover:text-gray-300 cursor-pointer">EN</span>
            </div>
            <div className="flex items-center space-x-2">
              <span role="img" aria-label="currency">💲</span>
              <span className="hover:text-gray-300 cursor-pointer">USD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section
        className={`search bg-gray-50 py-4 shadow-md sticky top-0 z-50 transition-all duration-300 ${
          isSearchActive ? "shadow-lg" : ""
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="logo w-1/5">
            <a href="/">
              <img src={logo.src} alt="logo" className="w-32" loading="lazy" />
            </a>
          </div>

          <div className="relative flex items-center w-3/5">
            <i className="fa fa-search absolute left-4 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-2 bg-white border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
            />
            <span className="text-gray-500 ml-4 cursor-pointer hover:text-blue-600">
              All Categories
            </span>
          </div>

          <div className="icon flex items-center w-1/5 justify-end space-x-6">
            <i className="fa fa-user text-xl text-gray-600 hover:text-blue-600 cursor-pointer"></i>
            <div className="relative">
              <ShoppingBagIcon className=" h-10 w-10 fa fa-shopping-bag text-xl text-gray-600 hover:text-blue-600 cursor-pointer"></ShoppingBagIcon>
              {CartItem.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {CartItem.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Navigation */}
      <nav className="bg-white shadow-md py-4">
        <div className="container mx-auto flex justify-between items-center px-6">
          <button
            className="categories flex items-center bg-gray-100 px-6 py-2 rounded-md cursor-pointer hover:bg-gray-200 transition duration-300"
          >
            <i className="fa fa-bars text-lg mr-3"></i>
            <span className="font-medium">Categories</span>
          </button>

          <ul
            className={`${
              isMobileMenuOpen
                ? "fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center space-y-8 z-50"
                : "hidden md:flex space-x-8"
            } text-gray-700 font-medium`}
          >
            <li className="hover:text-blue-600 transition duration-300">
              <a href="/">Home</a>
            </li>
            <li className="hover:text-blue-600 transition duration-300">
              <a href="/pages">Pages</a>
            </li>
            <li className="hover:text-blue-600 transition duration-300">
              <a href="/user">User Account</a>
            </li>
            <li className="hover:text-blue-600 transition duration-300">
              <a href="/vendor">Vendor Account</a>
            </li>
            <li className="hover:text-blue-600 transition duration-300">
              <a href="/track">Track My Order</a>
            </li>
            <li className="hover:text-blue-600 transition duration-300">
              <a href="/contact">Contact</a>
            </li>
          </ul>

          <button
            className="toggle md:hidden text-2xl text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
