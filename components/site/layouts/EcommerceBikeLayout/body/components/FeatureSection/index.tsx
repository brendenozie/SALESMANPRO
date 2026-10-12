'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EditableElement } from '@/contexts/EditableContentContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function BikeFeatureSection() {
  const racingOrange = '#FF5733'; // High-visibility performance orange
  const carbonBlack = '#121212';

  const sectionData = {
    tag: "Engineering Excellence",
    title: "built for the wild, tuned for the city",
    description: "With over a decade of precision assembly in Nairobi, we don't just sell bikes; we engineer experiences. From carbon-fiber frames to professional-grade groupsets.",
    subDescription: "Every ride is clinically tested for peak torque and aerodynamic efficiency. Whether you're conquering the Ngong Hills or navigating CBD traffic, we ensure your stride is unbreakable.",
    ctaText: "Explore the Fleet",
    ctaLink: "/bikeecommerce/products",
    imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80", 
  };

  return (
    <section className="bg-white dark:bg-zinc-950 py-24 lg:py-40 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          
          {/* IMAGE PANEL - The "Showroom" Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: -30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-zinc-100 dark:bg-zinc-900 group"
          >
            <EditableElement
              targetId="home.feature.image"
              label="Feature Showcase Image"
              type="image"
              defaultValue={sectionData.imageUrl}
            >
              <div className="relative w-full h-full">
                <Image decoding="async"
                  src={sectionData.imageUrl}
                  alt="High performance road bike"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale hover:grayscale-0"
                />
              </div>
            </EditableElement>
            {/* Speed Lines Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent pointer-events-none" />
            
            {/* Floating Technical Spec Badge */}
            <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20">
              <EditableElement
                targetId="home.feature.specLabel"
                label="Spec Label"
                type="text"
                defaultValue="Frame Weight"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FF5733]">Frame Weight</p>
              </EditableElement>
              <EditableElement
                targetId="home.feature.specValue"
                label="Spec Value"
                type="text"
                defaultValue="850g Carbon"
              >
                <p className="text-2xl font-black text-zinc-900 italic">850g <span className="text-sm font-medium text-zinc-400 not-italic">Carbon</span></p>
              </EditableElement>
            </div>
          </motion.div>

          {/* CONTENT PANEL - Technical & Bold */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <EditableElement
                targetId="home.feature.tag"
                label="Feature Tag"
                type="text"
                defaultValue={sectionData.tag}
              >
                <span className="text-[#FF5733] text-xs font-black uppercase tracking-[0.4em] mb-6 block">
                  {sectionData.tag}
                </span>
              </EditableElement>
              <EditableElement
                targetId="home.feature.title"
                label="Feature Title"
                type="text"
                defaultValue={sectionData.title}
              >
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] uppercase tracking-tighter mb-10">
                  {sectionData.title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 !== 0 ? "italic text-zinc-300 dark:text-zinc-800" : ""}>
                      {word}{' '}
                    </span>
                  ))}
                </h2>
              </EditableElement>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6 text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed max-w-lg mb-12 font-medium"
            >
              <EditableElement
                targetId="home.feature.description"
                label="Feature Description"
                type="textarea"
                defaultValue={sectionData.description}
              >
                <p>{sectionData.description}</p>
              </EditableElement>
              <EditableElement
                targetId="home.feature.subDescription"
                label="Feature Sub-Description"
                type="textarea"
                defaultValue={sectionData.subDescription}
              >
                <p className="text-sm opacity-80 border-l-2 border-[#FF5733] pl-6 italic">
                  {sectionData.subDescription}
                </p>
              </EditableElement>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-8"
            >
              <EditableElement
                targetId="home.feature.ctaText"
                label="Feature CTA Button"
                type="button"
                defaultValue={sectionData.ctaText}
              >
                <Link
                  href={sectionData.ctaLink}
                  className="group relative inline-flex items-center gap-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-widest text-xs px-12 py-6 rounded-full overflow-hidden transition-all hover:pr-16"
                >
                  <span className="relative z-10">{sectionData.ctaText}</span>
                  <div className="absolute inset-0 bg-[#FF5733] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  <svg className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </EditableElement>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}