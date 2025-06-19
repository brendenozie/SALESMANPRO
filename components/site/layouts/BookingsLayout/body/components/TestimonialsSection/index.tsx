'use client';

import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";

// Image loader for Next.js
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const testimonials = [
  {
    name: "Sarah L.",
    text: "Booking my massage through Ducun Vijed is a breeze! I can easily find the perfect therapist and schedule my appointment whenever it suits me. It’s so convenient!",
    rating: 5,
    image: "/avatars/sarah.png",
  },
  {
    name: "James K.",
    text: "The platform is super intuitive and fast. I found an amazing therapist and booked within minutes. Game changer!",
    rating: 5,
    image: "/avatars/james.png",
  },
  {
    name: "Amara N.",
    text: "I love the flexibility and professionalism. Every session has been amazing so far. Highly recommended!",
    rating: 5,
    image: "/avatars/amara.png",
  },
];

const settings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 6000,
  adaptiveHeight: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export default function TestimonialsSection() {
  return (
    <section className="relative bg-gray-950 py-24 px-6 lg:px-12 text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-black to-gray-950" />

      <div className="max-w-6xl mx-auto text-center">
        <motion.span
          className="inline-block bg-emerald-400/10 text-emerald-300 text-sm font-semibold px-4 py-1.5 rounded-full"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Testimonials
        </motion.span>

        <motion.h2
          className="text-4xl sm:text-5xl font-bold mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Hear From Our Happy Clients
        </motion.h2>

        <motion.p
          className="text-gray-300 max-w-2xl mx-auto mt-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Discover how Ducun Vijed is transforming the wellness experience for
          both clients and therapists.
        </motion.p>
      </div>

      {/* Mobile Carousel */}
      <div className="mt-12 block md:hidden">
        <Slider {...settings}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="px-4"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-lg">
                <p className="text-gray-100 mb-6">“{t.text}”</p>
                <div className="flex items-center gap-3">
                  <Image
                    loader={loader}
                    src={t.image}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <div className="flex text-yellow-400">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <StarIcon key={idx} className="w-4 h-4" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </Slider>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * i }}
            viewport={{ once: true }}
          >
            <p className="text-gray-100 mb-6">“{t.text}”</p>
            <div className="flex items-center gap-3">
              <Image
                src={t.image}
                loader={loader}
                alt={t.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <div className="flex text-yellow-400">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <StarIcon key={idx} className="w-4 h-4" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
