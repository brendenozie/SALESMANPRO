
import React,{ useState, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDownIcon, HeartIcon, MagnifyingGlassCircleIcon, ShoppingBagIcon, UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, XMarkIcon, Bars3BottomLeftIcon, FaceSmileIcon, BookOpenIcon, TruckIcon, ArrowsUpDownIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import banner from '@/assets/homebanner.png';
import { BuildingLibraryIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const Footer = () => {
    return (
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-12">
          
          {/* About Us */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">About Us</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              We’re the best marketplace for everything you need. Join thousands of satisfied customers today.
            </p>
          </div>
  
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
  
          {/* Customer Care */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/returns" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="/shipping" className="hover:text-white transition-colors">Shipping</a></li>
              <li><a href="/track" className="hover:text-white transition-colors">Track Order</a></li>
            </ul>
          </div>
  
          {/* Follow Us */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
                <FaceSmileIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
                <BuildingLibraryIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
                <BookOpenIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
  
        <div className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Your Store. All rights reserved.
        </div>
      </footer>
    );
  }

export default Footer;