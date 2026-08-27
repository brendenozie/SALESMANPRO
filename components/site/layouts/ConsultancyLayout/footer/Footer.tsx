"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ArrowTopRightOnSquareIcon 
} from "@heroicons/react/24/outline";
import { FaceSmileIcon } from "@heroicons/react/24/solid";
import { StoreForm } from "../../../../../types/typings";
import ClientCookieWrapper from "../body/components/ClientCookieWrapper";
import SignInModal from "../../GhubaLayout/body/components/SignInModal/SignInModal";

interface FooterProps {
  storeFormData: StoreForm;
}

const Footer: React.FC<FooterProps> = ({ storeFormData }) => {
  const socials = [
    { name: "LinkedIn", href: "#" },
    { name: "Twitter", href: "#" },
    { name: "Facebook", href: "#" },
    { name: "Instagram", href: "#" },
    { name: "YouTube", href: "#" },
  ];

  const {
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase. 
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        isMain: true
      }];

  return (
    <>
      <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300 pt-20 pb-12">
        {/* Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-700/10 via-transparent to-transparent pointer-events-none" />

        {/* Footer Content */}
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">

          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {storeFormData?.name?.charAt(0).toUpperCase() || "C"}
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {storeFormData?.name || "YourCoach"}
              </h2>
            </div>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Empowering growth, clarity, and transformation — one step at a time. 
              Let’s build a path that aligns your purpose with lasting results.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-bold text-white text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#hero" className="hover:text-orange-400 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-orange-400 transition-colors">About</a></li>
              <li><a href="#services" className="hover:text-orange-400 transition-colors">Services</a></li>
              <li><a href="#testimonials" className="hover:text-orange-400 transition-colors">Testimonials</a></li>
              <li><a href="#contact" className="hover:text-orange-400 transition-colors">Contact</a></li>
            </ul>
          </motion.div>

          {/* Regional Locations & Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-bold text-white text-lg mb-4">Our Locations</h4>
            <div className="space-y-5">
              {regionalAddresses.map((loc: any, idx: number) => {
                const label = loc?.label || (idx === 0 ? "Headquarters" : `Hub ${idx + 1}`);
                const fullAddress = typeof loc === "string" ? loc : loc?.address;
                const phone = loc?.contactPhone || contactPhone;
                const emailAddr = loc?.contactEmail || contactEmail;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || "")}`;

                return (
                  <div key={idx} className="border-l-2 border-gray-700 pl-3 space-y-1 hover:border-orange-500 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        {label}
                        {(loc?.isMain || idx === 0) && (
                          <span className="px-1 py-0.2 rounded text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30">HQ</span>
                        )}
                      </span>
                      {fullAddress && (
                        <a 
                          href={mapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-gray-400 hover:text-orange-400 flex items-center gap-0.5"
                          title="View on Google Maps"
                        >
                          Map <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {fullAddress && (
                      <div className="flex items-start space-x-2 text-xs text-gray-400">
                        <MapPinIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>{fullAddress}</span>
                      </div>
                    )}

                    {phone && (
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <PhoneIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <a href={`tel:${phone}`} className="hover:text-orange-400 transition-colors">{phone}</a>
                      </div>
                    )}

                    {emailAddr && (
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <EnvelopeIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <a href={`mailto:${emailAddr}`} className="hover:text-orange-400 transition-colors truncate">{emailAddr}</a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Social & Motto */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-bold text-white text-lg mb-4">Stay Connected</h4>
            <p className="text-sm text-gray-400 mb-5">
              Follow us for insights, tips, and motivation on personal growth and success.
            </p>
            <div className="flex space-x-4">
              {socials.map((s, idx) => (
                <motion.a
                  key={idx}
                  href={s.href}
                  aria-label={`Visit ${s.name}`}
                  whileHover={{ scale: 1.2, rotate: 3 }}
                  className="text-gray-400 hover:text-orange-400 bg-gray-800 p-2 rounded-full transition-colors"
                >
                  <FaceSmileIcon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-16 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            &copy; {new Date().getFullYear()} {storeFormData?.name || "YourCoach"} — All Rights Reserved.  
            <br />
            <span className="text-orange-400 font-semibold">
              Empowering You to Lead with Clarity and Confidence.
            </span>
          </motion.p>
        </div>

        {/* Powered By Brand Tag */}
        <div className="flex items-center gap-1.5 px-4 py-2 justify-center mt-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
          <a 
            href="https://salesmanpro.site" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
          >
            SalesmanPro.site
          </a>
        </div>
      </footer>

      <SignInModal />
      <ClientCookieWrapper />
    </>
  );
};

export default Footer;