"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import Link from "next/link";
import ClientCookieWrapper from "../body/components/ClientCookieWrapper";
import LocationModal from "@/components/locationManager";
import Cart from "../body/components/cart";
import SignInModal from "../body/components/SignInModal/SignInModal";
import { useStoreContext } from "@/contexts/StoreContext";

const defaultStoreData = {
  name: "ghuba",
  description: "Discover the best deals and exclusive offers with ghuba, your trusted shopping companion.",
  address: "Nairobi, Kenya",
  contactEmail: "ghuba@gmail.com",
  contactPhone: "+254 732 771 353"
};

const Footer = () => {
  const path = usePathname();
  const isMobile = useIsMobile();
  
  // Fetch dynamic tenant context from your state manager

  const { storeFormData } = useStoreContext();
  const data = { ...defaultStoreData, ...storeFormData };
  const { name, description, tagline, contactPhone, contactEmail, address } = data;

  // Paths where the footer should be hidden entirely
  const hiddenPaths = ['/ghuba/profile', '/shop/profile'];
  if (hiddenPaths.some(p => path.includes(p))) return null;

  // Hide footer only on mobile + specific path
  if (isMobile && path === "/ghuba/productlist") {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black py-20 text-gray-900 dark:text-white">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-8">
          
          {/* Brand and Description Segment */}
          <div className="space-y-8">
            <h1 className="text-4xl font-extrabold italic text-yellow-500 uppercase tracking-tight">
              {name}
            </h1>
            <p className="text-sm font-light opacity-90 leading-relaxed text-gray-800 dark:text-gray-300">
              {description || tagline}
            </p>
            <div className="flex space-x-4">
              <button className="flex items-center bg-gray-300 dark:bg-[#152e4d] hover:bg-yellow-400 py-3 px-5 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300 dark:text-white text-gray-900 hover:text-black">
                <i className="fa-brands fa-google-play text-lg mr-2"></i>
                <span className="text-sm font-medium">Google Play</span>
              </button>
              <button className="flex items-center bg-gray-300 dark:bg-[#152e4d] hover:bg-yellow-400 py-3 px-5 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300 dark:text-white text-gray-900 hover:text-black">
                <i className="fa-brands fa-app-store-ios text-lg mr-2"></i>
                <span className="text-sm font-medium">App Store</span>
              </button>
            </div>
          </div>

          {/* Navigation Link Lists */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-500 border-b-2 border-yellow-500 pb-2">About Us</h2>
            <ul className="space-y-3">
              {["Careers", "Our Stores", "Our Cares", "Terms & Conditions", "Privacy Policy"].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={`/ghuba/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="block text-sm text-gray-800 dark:text-gray-300 opacity-80 hover:opacity-100 hover:text-yellow-500 transition-all transform hover:translate-x-2 duration-300 cursor-pointer"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-500 border-b-2 border-yellow-500 pb-2">Customer Care</h2>
            <ul className="space-y-3">
              {["Help Center", "How to Buy", "Track Your Order", "Bulk Purchasing", "Returns & Refunds"].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={`/ghuba/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="block text-sm text-gray-800 dark:text-gray-300 opacity-80 hover:opacity-100 hover:text-yellow-500 transition-all transform hover:translate-x-2 duration-300 cursor-pointer"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details Segment */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-500 border-b-2 border-yellow-500 pb-2">Contact Us</h2>
            <ul className="space-y-3 text-sm text-gray-800 dark:text-gray-300">
              <li className="opacity-80 hover:opacity-100 hover:text-yellow-500 transition-all transform hover:translate-x-2 duration-300">
                {address}
              </li>
              <li className="opacity-80 hover:opacity-100 hover:text-yellow-500 transition-all transform hover:translate-x-2 duration-300">
                Email: {contactEmail}
              </li>
              <li className="opacity-80 hover:opacity-100 hover:text-yellow-500 transition-all transform hover:translate-x-2 duration-300">
                Phone: {contactPhone}
              </li>
            </ul>
          </div>
        </div>

        {/* System Copyright & Attribution Matrix */}
        <div className="border-t border-gray-400 dark:border-[#152e4d] mt-12 pt-6 text-center text-sm opacity-70 text-gray-800 dark:text-gray-300">
          © {currentYear} <span className="text-yellow-500 font-semibold uppercase">{name}</span>. All Rights Reserved.
        </div>
        
        <div className="flex items-center gap-1.5 px-4 py-2 mt-4 justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
          <a 
            href="https://salesmanpro.site" 
            className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
          >
            SalesmanPro.site
          </a>
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

/* --- HELPERS --- */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}