"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  BookOpenIcon,
  ChartBarIcon,
  BeakerIcon,
  SparklesIcon,
  ArrowRightIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { IBlog } from "@/types/typings";

const loader = ({ src }: { src: string }) => src;

// Map categories to high-tech minimalist icons
const getIconForCategory = (category?: string) => {
  const iconClass = "h-5 w-5 text-orange-500";
  switch (category?.toLowerCase()) {
    case "article":
      return <DocumentTextIcon className={iconClass} />;
    case "tool":
      return <BeakerIcon className={iconClass} />;
    case "guide":
      return <ChartBarIcon className={iconClass} />;
    case "report":
      return <BookOpenIcon className={iconClass} />;
    default:
      return <SparklesIcon className={iconClass} />;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function WellnessHubSection({ blogs = [] }: { blogs?: IBlog[] }) {
  // Demo Data to showcase the high-end look
  const data: Array<IBlog & { id: string; title: string; slug: string; category: string; excerpt: string; coverImage: string; }> = blogs.length > 0 ? (blogs as any) : [
    { id: '1', title: 'The Circadian Protocol', slug: 'circadian-protocol', category: 'report', excerpt: 'Strategic light exposure and nutrient timing to optimize executive performance.', coverImage: 'https://images.unsplash.com/photo-1507398941214-57f516d901ca?q=80&w=2000' } as IBlog & { id: string; title: string; slug: string; category: string; excerpt: string; coverImage: string; },
    { id: '2', title: 'V02 Max Calculator', slug: 'v02-calculator', category: 'tool', excerpt: 'Proprietary algorithm for determining cardiovascular threshold and recovery zones.', coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000' } as IBlog & { id: string; title: string; slug: string; category: string; excerpt: string; coverImage: string; },
    { id: '3', title: 'Neuro-Strength Guide', slug: 'neuro-strength', category: 'guide', excerpt: 'How neural drive influences maximal voluntary contraction and athletic output.', coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000' } as IBlog & { id: string; title: string; slug: string; category: string; excerpt: string; coverImage: string; },
  ];

  return (
    <section id="intel" className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/5">
      {/* Background Tech-grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-orange-500 font-black tracking-[0.4em] uppercase text-xs"
            >
              Performance Intel
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8]"
            >
              The Science <br /> <span className="text-white/10">of Peak</span>
            </motion.h2>
          </div>
          <p className="max-w-xs text-gray-500 font-medium text-sm leading-relaxed uppercase">
            Data-backed methodologies and proprietary tools for the modern high-performer.
          </p>
        </div>

        {/* Intelligence Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1px bg-white/10 border border-white/10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {data.map((blog) => (
            <motion.a
              key={blog.id}
              href={`/blog/${blog.slug}`}
              variants={itemVariants}
              className="group relative bg-[#050505] p-10 flex flex-col h-[500px] overflow-hidden transition-all duration-500"
            >
              {/* Cover Image (Reveals on Hover) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 z-0">
                <Image
                  src={blog.coverImage || "https://images.unsplash.com/photo-1507398941214-57f516d901ca?q=80&w=2000"}
                  alt={blog.title}
                  fill
                  className="object-cover grayscale"
                  loader={loader}
                />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Top: Category & Index */}
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 border border-white/10 rounded-lg group-hover:bg-orange-500 transition-colors duration-300">
                      {getIconForCategory(blog.category || "article")}
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                      {blog.category ?? "Article"}
                    </span>
                  </div>
                  <span className="text-white/10 font-black text-2xl tracking-tighter italic">0{data.indexOf(blog) + 1}</span>
                </div>

                {/* Middle: Title & Excerpt */}
                <div className="space-y-4 flex-grow">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-orange-500 transition-colors">
                    {blog.title}
                  </h3>
                  <div className="h-[2px] w-12 bg-orange-500 group-hover:w-24 transition-all duration-500" />
                  <p className="text-gray-500 text-sm font-medium leading-relaxed group-hover:text-gray-300 transition-colors">
                    {blog.excerpt}
                  </p>
                </div>

                {/* Bottom: Action */}
                <div className="pt-8 flex items-center justify-between">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Read Briefing</span>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ArrowRightIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Global Hub CTA */}
        <motion.div
          className="mt-20 flex flex-col items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <a
            href="/blog"
            className="group flex flex-col items-center gap-4"
          >
            <div className="px-6 py-2 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 group-hover:border-orange-500 group-hover:text-orange-500 transition-all">
              Access Full Archive
            </div>
            <div className="h-12 w-[1px] bg-gradient-to-b from-orange-500 to-transparent" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}