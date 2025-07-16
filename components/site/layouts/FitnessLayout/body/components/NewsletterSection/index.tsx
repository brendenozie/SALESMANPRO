"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image from next/image
import { ArrowRightIcon, ScaleIcon, CurrencyDollarIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// New variants for the feature icons
const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "backOut",
    },
  },
};

 


 
// ----------------------------------------------------------------------------
// Newsletter: collects email subscriptions
// ----------------------------------------------------------------------------
export default function  Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    // TODO: integrate subscription API
    setSubscribed(true);
  };

  return (
    <section className="py-12 px-4 md:px-8 bg-primary text-white rounded-2xl mx-4 md:mx-8 lg:mx-16 mt-12">
      <div className="max-w-md mx-auto text-center">
        <motion.h2
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Stay Updated
        </motion.h2>
        <p className="mb-6">Get weekly tips, deals, and new program alerts.</p>

        {subscribed ? (
          <p className="text-lg font-semibold">Thank you for subscribing!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <motion.input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              aria-label="Email address"
            />
            <motion.button
              type="submit"
              className="px-6 py-3 bg-white text-primary rounded-full font-semibold hover:bg-gray-100 transition"
              whileHover={{ scale: 1.05 }}
            >
              Subscribe
            </motion.button>
          </form>
        )}
      </div>
    </section>
  );
}