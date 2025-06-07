'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';


const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const tips = [
  {
    title: '55 Best Cleaning Tips for Every Room in Your Home',
    description:
      'Conducting all cleaning tasks with professionalism, including arriving on time.',
    image: '/images/cleaning1.png',
    date: '17 March 2024',
  },
  {
    title: 'Tips For Cleaning Your Home Before A Party',
    description:
      'Start up money or a decent amount of savings will get you started cleaning business.',
    image: '/images/cleaning2.png',
    date: '29 March 2024',
  },
  {
    title: '6 Cleaning Tips For When You Have Allergies',
    description:
      'Conducting all cleaning tasks with professionalism, including arriving on time.',
    image: '/images/cleaning3.png',
    date: '28 August 2024',
  },
];

export default function CleaningTipsSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Cleaning Tips, Industry News, and More
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {tips.map((tip, index) => (
          <motion.div
            key={index}
            className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative w-full h-60">
              <Image
                src={tip.image}
                alt={tip.title}
                loader={loader}
                layout="fill"
                objectFit="cover"
                className="rounded-t-xl"
              />
            </div>

            <div className="bg-white px-5 py-6 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tip.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{tip.description}</p>
              <div className="flex justify-between items-center text-sm">
                <Link
                  href="#"
                  className="text-orange-500 hover:underline font-medium"
                >
                  Discover More
                </Link>
                <span className="text-gray-400">{tip.date}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
