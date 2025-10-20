'use client';
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// Image Loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Auto-advance delay
const autoAdvanceDelay = 9000;

const AboutSection: React.FC = () => {
  const { storeFormData } = useStoreContext();

  // --- Extract data from store context or fallback ---
  const {
    name = "FlourisHUb",
    tagline = "A Platform for All Beautiful Souls — Flourishing Together",
    description = `Founded by Coach Jackie Wegoki, FlourisHUb is a nurturing space for all beautiful souls committed to the art of human flourishing. Guided by compassion and purpose, Jackie envisions a world where every individual is nourished to grow and thrive in wholeness.`,
    themeSettings = { primaryColor: "#F97316", secondaryColor: "#FB923C" },
    heroSlides = [],
    bannerUrl,
  } = storeFormData || {};

  const imgSrc =
    heroSlides?.[0]?.productImageUrl ||
    heroSlides?.[0]?.imageUrl ||
    bannerUrl ||
    "/coach-about.jpg";

  const primaryColor = themeSettings?.primaryColor || "#F97316";
  const secondaryColor = themeSettings?.secondaryColor || "#FB923C";

  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const advanceSlide = useCallback(
    (direction: "next" | "prev") => {
      setCurrent((prev) =>
        direction === "next" ? (prev + 1) % 3 : (prev - 1 + 3) % 3
      );
    },
    []
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => advanceSlide("next"), autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current!);
  }, [current, advanceSlide]);

  return (
    <section
      id="about"
      className="relative py-28 bg-gradient-to-br from-orange-50 via-white to-gray-50 overflow-hidden"
    >
      {/* Decorative floating shapes */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 left-10 w-40 h-40 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"
          style={{ backgroundColor: primaryColor }}
        ></div>
        <div
          className="absolute bottom-16 right-16 w-56 h-56 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"
          style={{ backgroundColor: secondaryColor }}
        ></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Image */}
        <motion.div
          className="lg:w-1/2 relative"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="relative w-full h-[480px] rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white transform hover:scale-[1.02] transition-transform duration-500">
            <Image
              src={imgSrc}
              alt={`${name} - inspiring human flourishing`}
              layout="fill"
              objectFit="cover"
              loader={loader}
              className="object-cover"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-orange-500/20 via-transparent to-transparent"
            ></div>
          </div>
          {/* Floating bubble */}
          <div
            className="absolute -bottom-10 -left-8 w-32 h-32 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse"
            style={{ backgroundColor: primaryColor }}
          ></div>
        </motion.div>

        {/* Right: Text */}
        <motion.div
          className="lg:w-1/2 text-center lg:text-left"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span
            className="uppercase font-semibold tracking-wide text-sm mb-3 inline-block"
            style={{ color: primaryColor }}
          >
            About {name}
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {tagline?.split("—")[0]} —{" "}
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r"
              style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            >
              {tagline?.split("—")[1] || "Flourishing Together"}
            </span>
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">{description}</p>

          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Our mission is simple yet transformative — to create a global hub that uplifts individuals, families,
            and communities toward authentic growth, balance, and joy. We believe that when one soul flourishes,
            the ripple of transformation touches families, communities, and nations.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
            {[
              {
                title: "Vision – To create a hub that enables human flourishing",
              },
              {
                title: "Mission – Nourishing to flourish",
              },
              {
                title: "Values – A Flourishing Soul. A Flourishing Family. A Flourishing Nation.",
              },
              {
                title: "Community – Celebrating and uplifting others through love and purpose",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                ></span>
                <p className="text-gray-800 font-medium">{item.title}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#community"
            className="inline-flex items-center px-8 py-4 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            style={{
              backgroundColor: primaryColor,
              color: "white",
            }}
          >
            Join the {name} Movement
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
