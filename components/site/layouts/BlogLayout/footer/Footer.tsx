import React from 'react';
import {FaceSmileIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

import Link from "next/link";
import { StoreForm } from '../../../../../types/typings';

interface FooterProps {
  storeFormData: StoreForm;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

const Footer :React.FC<FooterProps> = ({ storeFormData }) => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Insightful. All rights reserved.</p>
          <div className="space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
