"use client";

import React from "react";



// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const features = [
  {
    title: "Swedish Massage for Ultimate Relaxation",
    description:
      "Experience soothing strokes that relieve tension and promote relaxation.",
    image: "/images/swedish.jpg",
    button: true,
  },
  {
    title: "Deep Tissue Massage for Pain Relief",
    description: "Target deep muscle layers to reduce chronic pain and stiffness.",
    image: "/images/deep-tissue.jpg",
  },
  {
    title: "Hot Stone Massage for Enhanced Comfort",
    description:
      "Warm stones placed on key points to relax muscles and improve circulation.",
    image: "/images/hot-stone.jpg",
  },
  {
    title: "Aromatherapy for a Sensory Experience",
    description:
      "Combine essential oils with massage techniques for a calming effect.",
    image: "/images/aromatherapy.jpg",
  },
];

export default function MassageFeatures() {
  return (
    <section className="bg-[#f8f1eb] py-16 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            Services
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Explore Our Innovative <br /> Massage Booking Features
          </h2>
          <p className="mt-4 text-gray-700 text-lg">
            Our platform simplifies the massage booking experience for both clients
            and therapists. Enjoy seamless scheduling, easy management, and personalized profiles.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ title, description, image, button }, i) => (
            <div
              key={i}
              className="relative flex flex-col rounded-3xl bg-white/90 backdrop-blur-md shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
              style={{ minHeight: "420px" }}
            >
              <div className="relative h-64 w-full overflow-hidden rounded-t-3xl">
                <img
                  src={image}
                  alt={title}
                  className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-700 flex-grow">{description}</p>
                {button && (
                  <button
                    type="button"
                    className="mt-6 inline-block self-start bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full shadow-md transition-colors duration-300"
                  >
                    Explore More →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
