import React from 'react';
import {FaceSmileIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { StoreForm } from '../../../../../types/typings';

interface FooterProps {
  storeFormData: StoreForm;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

const Footer :React.FC<FooterProps> = ({ storeFormData }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-12">

        {/* About Us */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">About Us</h3>
          <p className="text-sm leading-relaxed text-gray-400">
          {storeFormData.description || "Discover everything you need from our trusted marketplace. Fast delivery, great deals, and top-notch service—trusted by thousands every day."}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href={`/about`} className="hover:text-white transition-colors">About</a></li>
            <li><a href={`/contact`} className="hover:text-white transition-colors">Contact</a></li>
            <li><a href={`/privacy`} className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href={`/terms`} className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Customer Care</h3>
          <ul className="space-y-2 text-sm">
            <li><a href={`/help`} className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href={`/returns`} className="hover:text-white transition-colors">Returns</a></li>
            <li><a href={`/shipping`} className="hover:text-white transition-colors">Shipping</a></li>
            <li><a href={`/track`} className="hover:text-white transition-colors">Track Order</a></li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
          {/* {storeFormData.socialLinks.map((s) => (
            <motion.a whileHover={{ scale: 1.1 }} href="#" className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full">
              <FaceSmileIcon className="h-5 w-5" />
            </motion.a>
          ))} */}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {storeFormData.name}. All rights reserved.
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
  );
};

export default Footer;
