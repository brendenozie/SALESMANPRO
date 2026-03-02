"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { FaceSmileIcon } from "@heroicons/react/24/solid";
import { StoreForm } from "../../../../../types/typings";
import ClientCookieWrapper from "../body/components/ClientCookieWrapper";
import SignInModal from "../../GhubaLayout/body/components/SignInModal/SignInModal";

interface FooterProps {
  storeFormData: StoreForm;
}

const Footer: React.FC<FooterProps> = ({ storeFormData }) => {
  const socials = [
    { name: "LinkedIn", href: "#", icon: "" },
    { name: "Twitter", href: "#", icon: "" },
    { name: "Facebook", href: "#", icon: "" },
    { name: "Instagram", href: "#", icon: "" },
    { name: "YouTube", href: "#", icon: "" },
  ];

  return (
    <>
      <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300 pt-20 pb-12">
        {/* Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-700/10 via-transparent to-transparent pointer-events-none"></div>

        {/* Footer Content */}
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">

          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {storeFormData.name?.charAt(0).toUpperCase() || "C"}
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {storeFormData.name || "YourCoach"}
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

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-bold text-white text-lg mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <EnvelopeIcon className="w-5 h-5 text-orange-500" />
                <a href="mailto:info@flourishhub.com" className="hover:text-orange-400">info@flourishhub.com</a>
              </li>
              <li className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 text-orange-500" />
                <a href="tel:+254721299385" className="hover:text-orange-400">+254 721299385</a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5 text-orange-500" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </motion.div>

          {/* Social & Motto */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-bold text-white text-lg mb-4">Stay Connected</h4>
            <p className="text-sm text-gray-400 mb-5">
              Follow me for insights, tips, and motivation on personal growth and success.
            </p>
            <div className="flex space-x-4">
              {socials.map((s, idx) => (
                <motion.a
                  key={idx}
                  href={s.href}
                  whileHover={{ scale: 1.2, rotate: 3 }}
                  className="text-gray-400 hover:text-orange-400 bg-gray-800 p-2 rounded-full"
                >
                  <FaceSmileIcon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            &copy; {new Date().getFullYear()} {storeFormData.name || "YourCoach"} — All Rights Reserved.  
            <br />
            <span className="text-orange-400 font-semibold">
              Empowering You to Lead with Clarity and Confidence.
            </span>
          </motion.p>
        </div>
      <div className="flex items-center gap-1.5 px-4 py-2 justify-center mt-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
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
