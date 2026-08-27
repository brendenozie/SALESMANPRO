'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Banner {
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
  bgColor: string;
  textColor?: string;
  href: string;
}

interface Props {
  primaryColor?: string;
  secondaryColor?: string;
}

export default function PromoBanners({
  primaryColor = '#F59E0B',
  secondaryColor = '#2563EB',
}: Props) {
  const banners: Banner[] = [
    {
      title: 'A pet lovers paradise',
      subtitle: 'We have everything for pet lovers!',
      buttonText: 'Shop Now',
      image:
        'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=600&q=80',
      bgColor: primaryColor,
      textColor: '#ffffff',
      href: '/petsecommerce/products',
    },
    {
      title: 'Adopt Give them Home',
      subtitle: 'We have everything for pet lovers!',
      buttonText: 'See More',
      image:
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      bgColor: secondaryColor,
      textColor: '#ffffff',
      href: '/petsecommerce/categories',
    },
  ];

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

          {banners.map((banner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="relative rounded-3xl overflow-hidden shadow-xl min-h-[260px] md:min-h-[300px] flex items-center p-8 md:p-10"
              style={{ backgroundColor: banner.bgColor }}
            >
              {/* Content */}
              <div className="relative z-10 max-w-sm space-y-4">
                <h3
                  className="text-2xl md:text-3xl font-extrabold leading-tight"
                  style={{ color: banner.textColor }}
                >
                  {banner.title}
                </h3>

                <p
                  className="text-sm md:text-base opacity-90"
                  style={{ color: banner.textColor }}
                >
                  {banner.subtitle}
                </p>

                <Link
                  href={banner.href}
                  className="inline-block mt-2 px-6 py-3 bg-white text-black font-bold rounded-xl shadow-md hover:scale-105 transition-all"
                >
                  {banner.buttonText}
                </Link>
              </div>

              {/* Image */}
              <div className="absolute right-0 bottom-0 h-full w-1/2 md:w-2/5">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-contain object-bottom scale-110"
                  sizes="(max-width: 768px) 50vw, 40vw"
                  loader={({ src }) => `${src}?w=600&q=80`}
                />
              </div>

              {/* Decorative soft overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}