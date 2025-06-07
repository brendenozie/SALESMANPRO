'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function GetStartedSection() {
  return (
    <section className="relative z-10 -mb-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl px-8 py-10 md:py-14 md:px-16 flex flex-col md:flex-row items-center justify-between overflow-hidden"
        >
          {/* Text */}
          <div className="max-w-md text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-snug">
              Get Started on Your<br />
              <span className="text-teal-900">Journey to a Cleaner Home Today!</span>
            </h2>
            <Link
              href="/contact"
              className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Let's Dive In
            </Link>
          </div>

          {/* Image */}
          <div className="relative w-[280px] h-[180px] md:w-[340px] md:h-[200px]">
            <Image
            loader={loader}
              src="/images/cta-cleaning-hand.png" // Use your real image path
              alt="Hand cleaning with cloth"
              fill
              className="object-contain"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
