import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";

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
    name: "Sarah L.",
    text: "Booking my massage through Ducun Vijed is a breeze! I can easily find the perfect therapist and schedule my appointment whenever it suits me. It’s so convenient!",
    rating: 5,
    image: "/avatars/sarah.png",
    bgColor: "bg-green-100",
    rotate: "rotate-2",
  },
  {
    name: "Sarah L.",
    text: "Booking my massage through Ducun Vijed is a breeze! I can easily find the perfect therapist and schedule my appointment whenever it suits me. It’s so convenient!",
    rating: 5,
    image: "/avatars/sarah.png",
    bgColor: "bg-orange-100",
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
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
      },
    },
    {
      breakpoint: 1024,
      settings: "unslick" as const, // Destroys slick on larger screens (grid layout instead)
    },
  ],
};

const TestimonialsSection = () => {
  return (
    <section className="bg-[#f8f1eb] py-20 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto text-center">
        <motion.span
          className="inline-block bg-green-100 text-green-600 text-sm font-medium px-3 py-1 rounded-full mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Testimonials
        </motion.span>

        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Hear From Our Happy Clients <br /> and Therapists
        </motion.h2>

        <motion.p
          className="text-gray-600 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Discover how Ducun Vijed is making massage booking and therapy sessions
          easier, more secure, and more rewarding for everyone.
        </motion.p>

        {/* Carousel on mobile, grid on desktop */}
        <div className="block md:hidden">
          <Slider {...settings}>
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className={`relative p-6 shadow-md rounded-2xl ${t.bgColor} ${t.rotate} mx-4`}>
                  <p className="text-md font-medium text-gray-900 mb-6">“{t.text}”</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <div className="flex text-yellow-500">
                        {"★".repeat(t.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:flex gap-6 justify-center mt-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              className={`w-80 p-6 shadow-md rounded-2xl ${t.bgColor} ${t.rotate}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <p className="text-md font-medium text-gray-900 mb-6">“{t.text}”</p>
              <div className="flex items-center gap-3">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <div className="flex text-yellow-500">
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


{/* FAQs */}
{/* <section id="faq" className="py-32 bg-gradient-to-b from-white via-slate-50 to-white">
<div className="container mx-auto px-6 max-w-4xl">
  <h2 className="text-4xl md:text-5xl font-extrabold text-center text-slate-800 mb-16">
    Frequently Asked Questions
  </h2>

  <div className="space-y-6">
    {faqs.map((q, i) => (
      <Reveal key={i}>
        <motion.details
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="group bg-white/60 backdrop-blur-lg border border-slate-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all"
        >
          <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-slate-800">
            {q.question}
            <svg
              className="w-5 h-5 ml-2 text-slate-500 group-open:rotate-180 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="mt-4 text-slate-600 leading-relaxed">{q.answer}</p>
        </motion.details>
      </Reveal>
    ))}
  </div>
</div>
</section> */}