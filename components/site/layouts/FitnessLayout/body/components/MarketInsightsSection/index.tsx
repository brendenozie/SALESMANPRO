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
import { useStoreContext } from "@/contexts/StoreContext";
import { IBlog } from "@/types/typings";

const loader = ({ src }: { src: string }) => src;

// Map categories to high-tech minimalist icons with dynamic color states
const getIconForCategory = (category?: string, active?: boolean, primaryColor?: string) => {
  const iconClass = "h-5 w-5 transition-colors duration-300";
  const style = active ? { color: "#ffffff" } : { color: primaryColor };
  
  switch (category?.toLowerCase()) {
    case "article":
      return <DocumentTextIcon className={iconClass} style={style} />;
    case "tool":
      return <BeakerIcon className={iconClass} style={style} />;
    case "guide":
      return <ChartBarIcon className={iconClass} style={style} />;
    case "report":
      return <BookOpenIcon className={iconClass} style={style} />;
    default:
      return <SparklesIcon className={iconClass} style={style} />;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
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
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";

  // Demo Data to showcase the high-end look
  const data: Array<IBlog & { id: string; title: string; slug: string; category: string; excerpt: string; coverImage: string; }> = blogs.length > 0 ? (blogs as any) : [
    { id: '1', title: 'The Circadian Protocol', slug: 'circadian-protocol', category: 'report', excerpt: 'Strategic light exposure and nutrient timing to optimize executive performance.', coverImage: 'https://images.unsplash.com/photo-1507398941214-57f516d901ca?q=80&w=2000' } as IBlog & { id: string; title: string; slug: string; category: string; excerpt: string; coverImage: string; },
    { id: '2', title: 'V02 Max Calculator', slug: 'v02-calculator', category: 'tool', excerpt: 'Proprietary algorithm for determining cardiovascular threshold and recovery zones.', coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000' } as IBlog & { id: string; title: string; slug: string; category: string; excerpt: string; coverImage: string; },
    { id: '3', title: 'Neuro-Strength Guide', slug: 'neuro-strength', category: 'guide', excerpt: 'How neural drive influences maximal voluntary contraction and athletic output.', coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000' } as IBlog & { id: string; title: string; slug: string; category: string; excerpt: string; coverImage: string; },
  ];

  return (
    <section id="intel" className="py-24 sm:py-32 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200/60 dark:border-neutral-900/40 transition-colors duration-500 relative overflow-hidden">
      {/* Background Tech-grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="font-black tracking-[0.3em] uppercase text-xs"
              style={{ color: primaryColor }}
            >
              Performance Intel
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase leading-[0.85]"
            >
              The Science <br /> <span className="text-neutral-300 dark:text-neutral-800 transition-colors">of Peak</span>
            </motion.h2>
          </div>
          <p className="max-w-xs text-neutral-500 dark:text-neutral-400 font-medium text-sm leading-relaxed uppercase transition-colors">
            Data-backed methodologies and proprietary tools for the modern high-performer.
          </p>
        </div>

        {/* Intelligence Grid Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {data.map((blog) => (
            <motion.a
              key={blog.id}
              href={`/fitness/blog/${blog.slug}`}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="group relative bg-white dark:bg-neutral-900/30 p-8 sm:p-10 flex flex-col h-[460px] sm:h-[500px] rounded-[2.5rem] overflow-hidden border border-neutral-200/80 dark:border-neutral-900/60 shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {/* Cover Image (Reveals seamlessly on Hover) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-15 dark:group-hover:opacity-20 transition-opacity duration-700 z-0 pointer-events-none">
                <Image decoding="async"
                  src={blog.coverImage || "https://images.unsplash.com/photo-1507398941214-57f516d901ca?q=80&w=2000"}
                  alt={blog.title}
                  fill
                  className="object-cover grayscale mix-blend-luminosity"
                />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                {/* Top: Category Icon & Index */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl transition-colors duration-300 group-hover:!border-transparent"
                      style={{ ['--hover-bg' as any]: primaryColor }}
                      data-hover-bg
                    >
                      {/* CSS variable handler block for dynamic Tailwind hover backgrounds */}
                      <style>{`
                        .group:hover [data-hover-bg] {
                          background-color: ${primaryColor};
                        }
                      `}</style>
                      {getIconForCategory(blog.category || "article", false, primaryColor)}
                    </div>
                    <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.25em] group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      {blog.category ?? "Article"}
                    </span>
                  </div>
                  <span className="text-neutral-200 dark:text-neutral-800 font-black text-2xl tracking-tighter italic transition-colors">
                    0{data.indexOf(blog) + 1}
                  </span>
                </div>

                {/* Middle: Title & Excerpt */}
                <div className="space-y-4 my-auto">
                  <h3 
                    className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-tight transition-colors"
                    style={{ ['--hover-color' as any]: primaryColor }}
                  >
                    <style>{`
                      .group:hover h3 {
                        color: ${primaryColor};
                      }
                    `}</style>
                    {blog.title}
                  </h3>
                  <div className="h-[2px] w-12 transition-all duration-500 group-hover:w-24" style={{ backgroundColor: primaryColor }} />
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium leading-relaxed line-clamp-3 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                    {blog.excerpt}
                  </p>
                </div>

                {/* Bottom: Interactive Read Link */}
                <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900/60 transition-colors">
                  <span className="text-[10px] font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-[0.35em]">
                    Read Briefing
                  </span>
                  <div 
                    className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center transition-all duration-300 group-hover:text-white"
                    style={{ ['--hover-border' as any]: primaryColor }}
                  >
                    <style>{`
                      .group:hover .rounded-full {
                        background-color: ${primaryColor};
                        border-color: ${primaryColor};
                      }
                    `}</style>
                    <ArrowRightIcon className="w-4 h-4 text-neutral-700 dark:text-neutral-300 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Global Hub CTA Anchor */}
        <motion.div
          className="mt-20 flex flex-col items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <a
            href="/fitness/blog"
            className="group flex flex-col items-center gap-4"
          >
            <div 
              className="px-6 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 dark:text-neutral-500 transition-all"
              style={{ ['--hover-all' as any]: primaryColor }}
            >
              <style>{`
                .group:hover .rounded-full {
                  border-color: ${primaryColor};
                  color: ${primaryColor};
                }
              `}</style>
              Access Full Archive
            </div>
            <div className="h-12 w-[1px] bg-gradient-to-b to-transparent" style={{ from: primaryColor }} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}