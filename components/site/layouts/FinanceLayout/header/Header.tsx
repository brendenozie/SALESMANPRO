'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface BannerProps {
  headline?: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  primary?: string;
  secondary?: string;
}

const Banner: React.FC<BannerProps> = ({
  headline = 'Trusted Legal & Financial Solutions',
  subline = 'Protect your assets, grow your wealth. Expert guidance at every step.',
  ctaText = 'Get a Free Consultation',
  ctaLink = '/contact',
  imageUrl = '/hero-legal.svg', // Replace with actual image
  primary = '#2563EB', // Fallback: Blue-600
  secondary = '#9333EA', // Fallback: Purple-600
}) => {
  return (
    <section
      className="relative overflow-hidden text-white py-24 sm:py-32"
      style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              {headline}
            </h1>
            <p className="text-lg sm:text-xl mb-6 text-white/90">{subline}</p>
            <a
              href={ctaLink}
              className="inline-block px-6 py-3 rounded-full font-medium bg-white text-gray-900 hover:bg-gray-100 transition"
            >
              {ctaText}
            </a>
          </motion.div>

          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <Image
                src={imageUrl}
                alt="Finance or Legal Visual"
                width={500}
                height={400}
                className="w-full h-auto object-contain"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Optional decorative SVG background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <Image
          src="/grid-light.svg"
          alt="decor"
          fill
          className="object-cover"
        />
      </div>
    </section>
  );
};

export default Banner;
