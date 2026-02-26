'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Gourmet Tastings',
    image: 'https://images.unsplash.com/photo-1590080875515-8a03b1447d19?auto=format&fit=crop&w=800&q=80',
    features: ['Flavor profile analysis', 'Texture sampling', 'Nutritional deep-dive', 'Pairing suggestions'],
    cta: 'Book Tasting'
  },
  {
    title: 'Wholesale Inquiry',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    features: ['Bulk pricing tiers', 'Custom labeling options', 'Supply chain logistics', 'Inventory management'],
    cta: 'Request Quote'
  },
  {
    title: 'Culinary Workshops',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    features: ['Recipe development', 'Cooking with nut butter', 'Kitchen efficiency', 'Menu integration'],
    cta: 'Join Workshop'
  }
];

export default function AppointmentSection() {
  const darkTeal = '#004743';

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-12 lg:px-20">
        <div className="mb-16">
          <h2 className="text-4xl font-black uppercase tracking-tight" style={{ color: darkTeal }}>
            Connect With Our Experts
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Book your consultation online fast and easy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col"
            >
              <div className="relative aspect-video mb-6 overflow-hidden rounded-sm">
                <Image src={service.image} alt={service.title} fill className="object-cover" loader={({ src }) => src} />
              </div>
              <h3 className="text-xl font-black uppercase mb-4" style={{ color: darkTeal }}>{service.title}</h3>
              <ul className="grid grid-cols-2 gap-y-2 mb-8">
                {service.features.map((feature, fIdx) => (
                  <li key={fIdx} className="text-xs text-gray-600 flex items-center gap-1">
                    <span className="text-lg leading-none mt-[-2px]">•</span> {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 border border-gray-300 font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-colors">
                {service.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}