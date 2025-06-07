import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';


const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

type AboutSectionProps = {
  imageUrl: string;
  primary: string;
  secondary: string;
};

export default function AboutSection({
  imageUrl,
  primary,
  secondary,
}: AboutSectionProps) {
  const perks = [
    '100% Customer Satisfaction',
    'Free Collection & Delivery',
    'Affordable Prices',
    'Best Quality',
  ];

  return (
    <section className="relative py-24 bg-gray-100 overflow-hidden">
      {/* Decorative Circles */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: secondary }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.1, 0.2] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full opacity-15 blur-2xl"
        style={{ backgroundColor: primary }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.05, 0.15] }}
        transition={{ duration: 25, repeat: Infinity, delay: 3 }}
      />

      {/* Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Side */}
        <motion.div
          className="flex justify-center lg:justify-start"
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/30">
            <Image
              src={imageUrl}
              alt="Cleaning kit"
              width={400}
              height={400}
              className="object-cover w-80 h-80 sm:w-96 sm:h-96"
              loader={loader}
            />
          </div>
        </motion.div>

        {/* Text Side */}
        <div className="space-y-6 flex flex-col justify-center">
          <motion.span
            className="text-sm uppercase font-semibold tracking-wider text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            About Us
          </motion.span>

          <motion.h2
            className="text-3xl sm:text-4xl font-extrabold leading-tight text-gray-900"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Welcome To Our{' '}
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r"
              style={{ backgroundImage: `linear-gradient(to right, ${secondary}, ${primary})` }}
            >
              Pro-cleaning
            </span>{' '}
            Company!
          </motion.h2>

          <motion.p
            className="text-gray-700 text-lg max-w-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            We make your space shine! Professional and reliable cleaning services for homes and businesses—satisfaction guaranteed.
          </motion.p>

          {/* Perks List */}
          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            viewport={{ once: true }}
          >
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-center space-x-3 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow"
              >
                <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{perk}</span>
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-6 pt-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/book"
                className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition"
                style={{ backgroundColor: secondary, color: primary }}
              >
                Book Now
            </Link>
            <Link href="/about" className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-100 transition">
                Know More
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
