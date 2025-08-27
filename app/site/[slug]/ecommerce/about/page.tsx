'use client';

import React from 'react';
import { motion } from 'framer-motion';



export default function About() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-12"
      >
        {/* Our Story Section */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Our Story 📖
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Welcome! We're so glad you're here. We started this store with a simple idea: to create a place where you can find unique, high-quality products that bring joy and inspiration to your everyday life.
          </p>
          <p className="mt-2 text-lg text-gray-500">
            It all began with a big dream. We spent countless hours searching for products that were not only beautiful and functional but also had a story behind them. We wanted to connect you with artisans, creators, and brands that share our values of craftsmanship, sustainability, and authenticity. Every item in our collection is hand-picked with care, and we hope you'll feel the passion we pour into our work.
          </p>
        </div>

        {/* Our Values Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Our Values ✨
            </h2>
            <ul className="text-lg text-gray-600 space-y-3">
              <li className="flex items-center">
                <span className="mr-2 text-2xl">🌿</span>
                <p>
                  <strong>Conscious Curation:</strong> We're committed to sourcing from brands that prioritize ethical and sustainable practices. We care about where our products come from and how they're made.
                </p>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-2xl">💎</span>
                <p>
                  <strong>Quality First:</strong> We believe in products that are built to last. We focus on durable materials and timeless designs so you can love your purchase for years to come.
                </p>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-2xl">🤝</span>
                <p>
                  <strong>Exceptional Service:</strong> Your satisfaction is our top priority. We're here to help you every step of the way, from finding the perfect item to ensuring a smooth delivery.
                </p>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-2xl">❤️</span>
                <p>
                  <strong>Community & Connection:</strong> We're grateful for every customer who supports our small business. We love seeing how you incorporate our products into your life.
                </p>
              </li>
            </ul>
          </div>
          <div className="relative h-64 sm:h-80 md:h-96">
            <img
              src="https://images.unsplash.com/photo-1542435503-956c469947f6?fit=crop&w=800&q=80"
              alt="Artisans at work, representing craftsmanship"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Meet the Team Section */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Meet the Team 🧑‍🤝‍🧑
          </h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Founder's Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a7dd7803e20?fit=crop&w=300&q=80"
                alt="Founder's profile picture"
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-indigo-500"
              />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                [Founder's Name]
              </h3>
              <p className="text-indigo-600">Founder & Chief Curator</p>
              <p className="mt-2 text-gray-500">
                With an eye for detail and a passion for discovering hidden gems, [Founder's Name] is the heart of our store. They are always on the hunt for the next great find.
              </p>
            </motion.div>

            {/* Team Member 1 Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1544723795-3fb6469f5b80?fit=crop&w=300&q=80"
                alt="Team member profile picture"
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-indigo-500"
              />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                [Team Member's Name]
              </h3>
              <p className="text-indigo-600">[Their Title]</p>
              <p className="mt-2 text-gray-500">
                As our Customer Experience Lead, [Team Member's Name] ensures every interaction you have with us is a positive one. They believe that great service is the key to building lasting relationships.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}