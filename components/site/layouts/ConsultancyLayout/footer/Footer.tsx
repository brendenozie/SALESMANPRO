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
       {/* 7. Footer */}
            {/* <footer className="bg-gray-800 text-gray-300 py-16"> */}
              <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div>
                  <span className="text-3xl font-extrabold text-white">
                    <span className="text-orange-600">Your</span>Coach
                  </span>
                  <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                    Empowering individuals and teams to achieve extraordinary success through personalized coaching and strategic guidance.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg mb-4">Quick Links</h4>
                  <ul>
                    <li className="mb-2"><a href="#hero" className="hover:text-orange-500 transition-colors">Home</a></li>
                    <li className="mb-2"><a href="#about" className="hover:text-orange-500 transition-colors">About Me</a></li>
                    <li className="mb-2"><a href="#services" className="hover:text-orange-500 transition-colors">Services</a></li>
                    <li className="mb-2"><a href="#testimonials" className="hover:text-orange-500 transition-colors">Testimonials</a></li>
                    <li className="mb-2"><a href="#" className="hover:text-orange-500 transition-colors">Blog</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg mb-4">Contact Info</h4>
                  <ul>
                    <li className="mb-2">Email: <a href="mailto:info@yourcoach.com" className="hover:text-orange-500 transition-colors">info@yourcoach.com</a></li>
                    <li className="mb-2">Phone: <a href="tel:+1-555-123-4567" className="hover:text-orange-500 transition-colors">+1 (555) 123-4567</a></li>
                    <li className="mb-2">Location: New York, NY, USA</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg mb-4">Connect With Me</h4>
                  <div className="flex space-x-4 mt-4">
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                      {/* Replace with actual social icons (e.g., from Heroicons or Font Awesome) */}
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                       <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.791-1.574 2.153-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.365 0-6.09 2.725-6.09 6.09 0 .47.054.92.134 1.353-5.071-.257-9.591-2.687-12.618-6.38-1.574 2.686-.708 6.22 1.777 8.131-1.21-.04-2.35-.374-3.34-.919v.07c0 2.966 2.102 5.435 4.897 5.99-.484.13-.996.192-1.517.192-.375 0-.74-.036-1.098-.105.773 2.43 3.012 4.207 5.676 4.256-2.095 1.64-4.664 2.624-7.493 2.624-.483 0-.958-.029-1.427-.083 2.709 1.744 5.93 2.77 9.387 2.77 11.267 0 17.408-9.317 17.408-17.408 0-.266-.007-.53-.02-.795.736-.532 1.373-1.198 1.88-1.954z"/></svg>
                    </a>
                    {/* Add more social icons as needed */}
                  </div>
                </div>
              </div>
              <div className="text-center text-gray-500 text-sm mt-12 border-t border-gray-700 pt-8">
                &copy; {new Date().getFullYear()} YourCoach. All rights reserved.
              </div>
              
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
            <li><a href={`/site/${storeFormData.slug}/about`} className="hover:text-white transition-colors">About</a></li>
            <li><a href={`/site/${storeFormData.slug}/contact`} className="hover:text-white transition-colors">Contact</a></li>
            <li><a href={`/site/${storeFormData.slug}/privacy`} className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href={`/site/${storeFormData.slug}/terms`} className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Customer Care</h3>
          <ul className="space-y-2 text-sm">
            <li><a href={`/site/${storeFormData.slug}/help`} className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href={`/site/${storeFormData.slug}/returns`} className="hover:text-white transition-colors">Returns</a></li>
            <li><a href={`/site/${storeFormData.slug}/shipping`} className="hover:text-white transition-colors">Shipping</a></li>
            <li><a href={`/site/${storeFormData.slug}/track`} className="hover:text-white transition-colors">Track Order</a></li>
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
    </footer>
  );
};

export default Footer;
