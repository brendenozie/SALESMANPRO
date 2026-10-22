'use client';

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { resolveProductMedia } from '@/lib/product-media-resolver';
import { 
  CubeIcon, 
  ChatBubbleBottomCenterIcon, 
  ArrowRightIcon 
} from "@heroicons/react/24/outline";
import { EditableElement } from "@/contexts/EditableContentContext";

// Social icons often aren't in standard Heroicons sets, 
// but we can use simple SVGs or Heroicon-styled circles for a clean look.
const SocialIcon = ({ children }: { children: React.ReactNode }) => (
  <motion.a
    href="#"
    whileHover={{ y: -5 }}
    className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 hover:bg-orange-600 hover:border-orange-600 transition-all"
  >
    {children}
  </motion.a>
);

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function TeamSection({storeFormData}: {storeFormData: any}) {

  const media = resolveProductMedia({ imageUrl: storeFormData?.founderImage });
  const {
    name = "Imevo",
    founderImage,
    founderName = "Peter Jabuya",
    founderQuote = "Efficient, Safe, and Reliable Services are the cornerstone of our operations.",
    themeSettings,
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || "#f7941d";

  // Split name for the outlined effect
  const nameParts = founderName?.split(" ");
  const firstName = nameParts?.[0] || founderName;
  const lastName = nameParts?.slice(1).join(" ") || "";

  return (
    <section className="py-24 lg:py-40 bg-white relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" 
          style={{ backgroundColor: primaryColor }}
        />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-slate-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* --- CEO IMAGE CARD --- */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl group"
            >
              <EditableElement
                targetId="home.team.founderImage"
                field="imageUrl"
                label="Founder Image"
                type="image"
                defaultContent={founderImage || "/image77.png"}
                className="w-full h-full block"
              >
                <Image decoding="async"
                  src={media.thumbnailUrl || media.originalUrl || founderImage || "/image77.png"}
                  alt={founderName || "Founder"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  placeholder={media.blurDataUrl ? "blur" : "empty"}
                  blurDataURL={media.blurDataUrl || undefined}
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  priority
                />
              </EditableElement>
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating Socials */}
              <div className="absolute bottom-10 left-10 flex gap-4">
                <SocialIcon>
                   <span className="font-bold text-xs">IN</span>
                </SocialIcon>
                <SocialIcon>
                   <span className="font-bold text-xs">TW</span>
                </SocialIcon>
                <SocialIcon>
                   <span className="font-bold text-xs">FB</span>
                </SocialIcon>
              </div>
            </motion.div>

            {/* Decorative Label */}
            <div 
              className="absolute -bottom-6 -right-6 text-white p-8 rounded-3xl shadow-xl hidden md:block"
              style={{ backgroundColor: primaryColor }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1">Founding</p>
              <p className="text-2xl font-black italic uppercase tracking-tighter leading-none">Visionary</p>
            </div>
          </div>

          {/* --- CONTENT SECTION --- */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3" style={{ color: primaryColor }}>
                <CubeIcon className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-[0.4em]">
                  <EditableElement
                    targetId="home.team.tag"
                    field="tag"
                    label="Team Tag"
                    type="text"
                    defaultContent="Our Leadership"
                  >
                    Our Leadership
                  </EditableElement>
                </span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-black text-slate-950 leading-none uppercase italic">
                <EditableElement
                  targetId="home.team.founderName"
                  field="founderName"
                  label="Founder Name"
                  type="text"
                  defaultContent={founderName}
                >
                  {firstName} <br />
                  <span 
                    className="text-transparent" 
                    style={{ WebkitTextStroke: `2px #0f172a` }}
                  >
                    {lastName}
                  </span>
                </EditableElement>
              </h2>
              <p className="font-bold uppercase tracking-widest text-sm" style={{ color: primaryColor }}>
                <EditableElement
                  targetId="home.team.founderRole"
                  field="founderRole"
                  label="Founder Role"
                  type="text"
                  defaultContent="Chief Executive Officer"
                >
                  Chief Executive Officer
                </EditableElement>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <ChatBubbleBottomCenterIcon className="absolute -top-6 -left-8 text-slate-100 w-24 h-24 -z-10" />
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium italic">
                <EditableElement
                  targetId="home.team.founderQuote"
                  field="founderQuote"
                  label="Founder Quote"
                  type="text"
                  defaultContent={founderQuote}
                >
                  &quot;Our team leader believes in <span className="text-slate-950 font-black">Efficient, Safe, and Reliable Services</span>. 
                  We understand the great value placed on time, delivering on a set budget within the scheduled time frame.&quot;
                </EditableElement>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-slate-100"
            >
              <div>
                <h4 className="font-black text-slate-950 uppercase text-xs tracking-tighter mb-2">
                  <EditableElement
                    targetId="home.team.pillar1.title"
                    field="title"
                    label="Pillar #1 Title"
                    type="text"
                    defaultContent="The Standard"
                  >
                    The Standard
                  </EditableElement>
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  <EditableElement
                    targetId="home.team.pillar1.description"
                    field="description"
                    label="Pillar #1 Description"
                    type="text"
                    defaultContent="Guided by the highest standards of professionalism, treating every customer with the respect they deserve."
                  >
                    Guided by the highest standards of professionalism, treating every customer with the respect they deserve.
                  </EditableElement>
                </p>
              </div>
              <div>
                <h4 className="font-black text-slate-950 uppercase text-xs tracking-tighter mb-2">
                  <EditableElement
                    targetId="home.team.pillar2.title"
                    field="title"
                    label="Pillar #2 Title"
                    type="text"
                    defaultContent="The Expertise"
                  >
                    The Expertise
                  </EditableElement>
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  <EditableElement
                    targetId="home.team.pillar2.description"
                    field="description"
                    label="Pillar #2 Description"
                    type="text"
                    defaultContent="Hiring only the best, with outstanding excellence and long practical experience in Transportation and Logistics."
                  >
                    Hiring only the best, with outstanding excellence and long practical experience in Transportation and Logistics.
                  </EditableElement>
                </p>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ x: 10 }}
              className="flex items-center gap-4 text-slate-950 font-black uppercase text-xs tracking-[0.3em] group"
            >
              <EditableElement
                targetId="home.team.ctaText"
                field="ctaText"
                label="Team Profile Button"
                type="text"
                defaultContent="View Full Executive Profile"
              >
                <span>View Full Executive Profile</span>
              </EditableElement>
              <span 
                className="w-10 h-10 rounded-full text-white flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#0f172a' }} // Navy for the button
              >
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </div>


        </div>
      </div>
    </section>
  );
}