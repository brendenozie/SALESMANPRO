"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import Link from "next/link";
import ClientCookieWrapper from "../body/components/ClientCookieWrapper";
import LocationModal from "@/components/locationManager";
import Cart from "../body/components/cart";
import SignInModal from "../body/components/SignInModal/SignInModal";
import { useStoreContext } from "@/contexts/StoreContext";

interface AddressItem {
  label?: string;
  address?: string;
  city?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPrimary?: boolean;
}

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
  
  // Fetch dynamic context from state manager
  const { storeFormData } = useStoreContext();
  const data = { ...defaultStoreData, ...storeFormData };
  const { name, description, tagline } = data;
    
  const legacyAddress = storeFormData?.address || defaultStoreData.address;
  const primaryEmail = storeFormData?.contactEmail || defaultStoreData.contactEmail;
  const primaryPhone = storeFormData?.contactPhone || defaultStoreData.contactPhone;
  const addresses: AddressItem[] = storeFormData?.addresses || [];

  // Extract up to 3 addresses for the regional showcase. 
  // Fallback to primary/legacy data if the addresses array is empty.
  const regionalAddresses: AddressItem[] = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: legacyAddress,
        contactPhone: primaryPhone,
        contactEmail: primaryEmail,
        isPrimary: true
      }];

  // Paths where the footer should be hidden entirely
  const hiddenPaths = ['/ghuba/profile', '/shop/profile'];
  if (hiddenPaths.some(p => path?.includes(p))) return null;

  // Hide footer on mobile for specific path
  if (isMobile && path === "/ghuba/productlist") {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black py-16 text-gray-900 dark:text-white transition-colors duration-300">
        <div className="container mx-auto px-6 lg:px-8">
          
          {/* Main Footer Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Brand and Description Segment */}
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold italic text-yellow-500 uppercase tracking-tight">
                {name}
              </h1>
              <p className="text-sm font-light opacity-90 leading-relaxed text-gray-800 dark:text-gray-300">
                {description || tagline}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button className="flex items-center bg-gray-300 dark:bg-[#152e4d] hover:bg-yellow-400 py-2.5 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105 duration-300 dark:text-white text-gray-900 hover:text-black">
                  <i className="fa-brands fa-google-play text-lg mr-2"></i>
                  <span className="text-xs font-semibold">Google Play</span>
                </button>
                <button className="flex items-center bg-gray-300 dark:bg-[#152e4d] hover:bg-yellow-400 py-2.5 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105 duration-300 dark:text-white text-gray-900 hover:text-black">
                  <i className="fa-brands fa-app-store-ios text-lg mr-2"></i>
                  <span className="text-xs font-semibold">App Store</span>
                </button>
              </div>
            </div>

            {/* Navigation Link Lists: About Us */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-yellow-500 border-b-2 border-yellow-500 pb-2 inline-block">About Us</h2>
              <ul className="space-y-3">
                {["Careers", "Our Stores", "Our Cares", "Terms & Conditions", "Privacy Policy"].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={`/ghuba/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="block text-sm text-gray-800 dark:text-gray-300 opacity-80 hover:opacity-100 hover:text-yellow-500 transition-all transform hover:translate-x-1 duration-200"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation Link Lists: Customer Care */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-yellow-500 border-b-2 border-yellow-500 pb-2 inline-block">Customer Care</h2>
              <ul className="space-y-3">
                {["Help Center", "How to Buy", "Track Your Order", "Bulk Purchasing", "Returns & Refunds"].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={`/ghuba/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="block text-sm text-gray-800 dark:text-gray-300 opacity-80 hover:opacity-100 hover:text-yellow-500 transition-all transform hover:translate-x-1 duration-200"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Touchpoints */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-yellow-500 border-b-2 border-yellow-500 pb-2 inline-block">Direct Touchpoints</h2>
              <ul className="space-y-3 text-sm text-gray-800 dark:text-gray-300">
                {primaryPhone && (
                  <li>
                    <span className="font-semibold text-yellow-500">Phone: </span>
                    <a href={`tel:${primaryPhone}`} className="hover:underline transition-all">
                      {primaryPhone}
                    </a>
                  </li>
                )}
                {primaryEmail && (
                  <li>
                    <span className="font-semibold text-yellow-500">Email: </span>
                    <a href={`mailto:${primaryEmail}`} className="hover:underline transition-all">
                      {primaryEmail}
                    </a>
                  </li>
                )}
              </ul>
            </div>

          </div>

          {/* Regional Addresses & Locations Showcase */}
          <div className="pt-10 pb-6 border-t border-gray-300 dark:border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-6">
              Our Locations & Branches ({regionalAddresses.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regionalAddresses.map((loc, idx) => {
                const fullQuery = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;

                return (
                  <div 
                    key={idx}
                    className="p-5 rounded-2xl bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 hover:border-yellow-500/50 shadow-sm transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                          {loc.label || `Location 0${idx + 1}`}
                        </span>
                        {loc.isPrimary && (
                          <span className="text-[10px] font-bold uppercase text-gray-400">
                            Primary Hub
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed pt-1">
                        {loc.address || "Address details on request."}
                      </p>

                      {(loc.city || loc.country) && (
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {[loc.city, loc.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                      {loc.contactPhone && (
                        <div>
                          <a href={`tel:${loc.contactPhone}`} className="text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition-colors">
                            <i className="fa-solid fa-phone text-xs mr-2 text-yellow-500"></i>
                            {loc.contactPhone}
                          </a>
                        </div>
                      )}
                      {loc.contactEmail && (
                        <div>
                          <a href={`mailto:${loc.contactEmail}`} className="text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition-colors truncate block">
                            <i className="fa-solid fa-envelope text-xs mr-2 text-yellow-500"></i>
                            {loc.contactEmail}
                          </a>
                        </div>
                      )}

                      <a 
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 pt-2 text-[11px] font-bold text-yellow-500 hover:text-yellow-600 transition-colors"
                      >
                        <span>Get Directions</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Copyright & Attribution Matrix */}
          <div className="border-t border-gray-300 dark:border-gray-800 mt-8 pt-6 text-center text-sm opacity-80 text-gray-800 dark:text-gray-300">
            © {currentYear} <span className="text-yellow-500 font-semibold uppercase">{name}</span>. All Rights Reserved.
          </div>
          
          <div className="flex items-center gap-1.5 px-4 py-2 mt-2 justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Powered by</span>
            <a 
              href="https://salesmanpro.site" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
            >
              SalesmanPro.site
            </a>
          </div>

        </div>
      </footer>
      
      <Cart />
      <LocationModal />
      <ClientCookieWrapper />
      <SignInModal />
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