import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const companyLogos = [
  '/logos/yamaha.png',
  '/logos/pandora.png',
  '/logos/gardena.png',
  '/logos/sentinel.png',
  '/logos/sunway.png',
];

const images = [
  '/images/cleaning1.png',
  '/images/cleaning2.png',
  '/images/cleaning3.png',
];

export default function ExcellenceSection() {
  return (
    <section className="bg-white py-12">
      {/* Logos */}
      <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap px-6 gap-4 mb-12">
        {companyLogos.map((logo, index) => (
          <Image
            key={index}
            loader={loader}
            src={logo}
            alt="Company Logo"
            width={100}
            height={40}
            className="object-contain h-10 w-auto"
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-teal-900 text-white max-w-6xl mx-auto rounded-3xl shadow-xl px-8 py-12 grid md:grid-cols-2 gap-10 items-center">
        {/* Text Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight mb-4">
            Our Commitment to <br />
            <span className="text-orange-400">Excellence Experiences</span>
          </h2>
          <p className="text-gray-200 mb-6">
            Explore the core mission and vision that drives us every day. At Behind the Stories Company, we're not just about cleaning homes; we're about making a difference in the lives of our clients and our community.
          </p>
          <Link href="/services" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow mb-6">
            Request Service
          </Link>

          {/* Perks */}
          <ul className="space-y-4 text-sm">
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-orange-400 mr-3" />
              Eco-Friendly Cleaning Products
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-orange-400 mr-3" />
              Customized Cleaning Packages
            </li>
          </ul>
        </div>

        {/* Image Collage */}
        <motion.div
          className="relative w-full h-full flex justify-center items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative w-full max-w-md mx-auto">
            <Image
              src={images[0]}              
              loader={loader}
              alt="Main"
              width={400}
              height={300}
              className="rounded-xl shadow-lg mb-4"
            />
            <div className="absolute top-2/3 left-0 transform -translate-y-1/2 -translate-x-8">
              <Image
                src={images[1]}
                loader={loader}
                alt="Secondary"
                width={160}
                height={120}
                className="rounded-lg shadow-xl rotate-[-10deg]"
              />
            </div>
            <div className="absolute top-2/3 right-0 transform -translate-y-1/2 translate-x-8">
              <Image
                src={images[2]}
                loader={loader}
                alt="Tertiary"
                width={160}
                height={120}
                className="rounded-lg shadow-xl rotate-[10deg]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
