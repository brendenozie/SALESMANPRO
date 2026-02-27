"use client"
import React from "react";
import { usePathname } from 'next/navigation';

// import CookieConsentBar from "./components/CookieConsentBar";
import ClientCookieWrapper from "./components/ClientCookieWrapper";

import LocationModal from "@/components/locationManager";
import Cart from "./components/layouts/GhubaLayout/body/components/cart";
import SignInModal from "./components/layouts/GhubaLayout/body/components/SignInModal/SignInModal";

const Footer = () => {
  const path = usePathname();
  // bail out on /stores or any deeper stores route
  // if (path.startsWith('/stores')) return null;
  // if (path.startsWith('/admin')) return null;
  // if (path.startsWith('/agent')) return null;
  // if (path.startsWith('/clients')) return null;  
  // if (path.startsWith('/site')) return null;
  if (path.startsWith('/ghuba/profile')) return null;
  if (path.startsWith('/shop/profile')) return null;
  if(path.includes('/shop/profile')) return null;
  if (path.includes('/ghuba/profile')) return null;
  // if (path.startsWith('/shop/profile')) return null;
  // if (path.startsWith('/dashboards')) return null;
  // if (path.startsWith('/play')) return null;
  // if (path.startsWith('/doctor')) return null;
  // if (path.startsWith('/patient')) return null;

  return (
    <>
      <footer className="bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black py-20 text-gray-900 dark:text-white">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-8">
          <div className="space-y-8">
            <h1 className="text-4xl font-extrabold italic text-yellow-500">ghuba</h1>
            <p className="text-sm font-light opacity-90 leading-relaxed text-gray-800 dark:text-gray-300">
              Discover the best deals and exclusive offers with ghuba, your trusted shopping companion.
            </p>
            <div className="flex space-x-4">
              <button className="flex items-center bg-gray-300 dark:bg-[#152e4d] hover:bg-yellow-400 py-3 px-5 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300">
                <i className="fa-brands fa-google-play text-lg mr-2"></i>
                <span className="text-sm">Google Play</span>
              </button>
              <button className="flex items-center bg-gray-300 dark:bg-[#152e4d] hover:bg-yellow-400 py-3 px-5 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300">
                <i className="fa-brands fa-app-store-ios text-lg mr-2"></i>
                <span className="text-sm">App Store</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-500 border-b-2 border-yellow-500 pb-2">About Us</h2>
            <ul className="space-y-3 text-gray-800 dark:text-gray-300">
              {["Careers", "Our Stores", "Our Cares", "Terms & Conditions", "Privacy Policy"].map((item, index) => (
                <li key={index} className="opacity-80 hover:opacity-100 hover:text-yellow-500 transition-transform transform hover:translate-x-2 duration-300 cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-500 border-b-2 border-yellow-500 pb-2">Customer Care</h2>
            <ul className="space-y-3 text-gray-800 dark:text-gray-300">
              {["Help Center", "How to Buy", "Track Your Order", "Bulk Purchasing", "Returns & Refunds"].map((item, index) => (
                <li key={index} className="opacity-80 hover:opacity-100 hover:text-yellow-500 transition-transform transform hover:translate-x-2 duration-300 cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-500 border-b-2 border-yellow-500 pb-2">Contact Us</h2>
            <ul className="space-y-3 text-gray-800 dark:text-gray-300">
              {["Nairobi, Kenya", "Email: ghuba@gmail.com", "Phone: +254 732 771 353"].map((item, index) => (
                <li key={index} className="opacity-80 hover:opacity-100 hover:text-yellow-500 transition-transform transform hover:translate-x-2 duration-300 cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-400 dark:border-[#152e4d] mt-12 pt-6 text-center text-sm opacity-70 text-gray-800 dark:text-gray-300">
          © 2025 <span className="text-yellow-500 font-semibold">ghuba</span>. All Rights Reserved.
        </div>
      </footer>
      
      <Cart />
      <LocationModal />
      <SignInModal />
      <ClientCookieWrapper />
    </>

  );
};

export default Footer;