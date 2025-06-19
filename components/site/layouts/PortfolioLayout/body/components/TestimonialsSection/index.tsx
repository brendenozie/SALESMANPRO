'use client';

import React from "react";
import Slider from "react-slick";
import Image from "next/image";
import { motion } from "framer-motion";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const testimonials = [
  {
    name: "Sarah L.",
    text: "Booking my massage through Ducun Vijed is a breeze! I can easily find the perfect therapist and schedule my appointment whenever it suits me. It’s so convenient!",
    rating: 5,
    image: "/avatars/sarah.png",
    bgColor: "bg-orange-100",
    rotate: "-rotate-1",
  },
  {
    name: "James K.",
    text: "The level of professionalism and ease of scheduling blew me away. I now enjoy regular massage therapy without the stress.",
    rating: 5,
    image: "/avatars/james.png",
    bgColor: "bg-teal-100",
    rotate: "rotate-1",
  },
  {
    name: "Aisha R.",
    text: "I love how secure and personalized everything feels. I finally found my go-to wellness platform!",
    rating: 5,
    image: "/avatars/aisha.png",
    bgColor: "bg-green-100",
    rotate: "-rotate-2",
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
  autoplaySpeed: 5000,
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

const TestimonialsSection = () => {
  return (
    <section className="bg-[#f8f1eb] py-20 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto text-center">
        <motion.span
          className="inline-block bg-teal-100 text-teal-600 text-sm font-semibold px-4 py-1 rounded-full mb-4 shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Testimonials
        </motion.span>

        <motion.h2
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-snug"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          What Our Clients Are Saying
        </motion.h2>

        <motion.p
          className="text-gray-600 max-w-2xl mx-auto text-lg mb-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Trusted by thousands, Ducun Vijed is making self-care easier and more personal than ever before.
        </motion.p>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Slider {...settings}>
            {testimonials.map((t, index) => (
              <div key={index}>
                <motion.div
                  className={`mx-4 p-6 rounded-2xl shadow-md ${t.bgColor} ${t.rotate}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-gray-800 font-medium text-md mb-6">“{t.text}”</p>
                  <div className="flex items-center gap-4">
                    <Image
                      src={t.image}
                      alt={t.name}
                      loader={loader}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                      <div className="flex text-yellow-500 text-sm">
                        {"★".repeat(t.rating)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:flex justify-center gap-8 mt-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              className={`w-80 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 ${t.bgColor} ${t.rotate}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <p className="text-gray-800 font-medium text-md mb-6">“{t.text}”</p>
              <div className="flex items-center gap-4">
                <Image
                  src={t.image}
                  alt={t.name}
                  loader={loader}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <div className="flex text-yellow-500 text-sm">
                    {"★".repeat(t.rating)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
