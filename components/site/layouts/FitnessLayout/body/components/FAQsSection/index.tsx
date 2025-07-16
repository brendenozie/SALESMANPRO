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
export default function  FaqsSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    // TODO: integrate subscription API
    setSubscribed(true);
  };

  return (
    <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6 max-w-2xl">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl font-bold text-center mb-10 text-gray-800"
              >
                FAQs
              </motion.h2>
              <div className="space-y-6">
                {faqs.map((q:any, i:any) => (
                  <motion.details
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + 0.1 * i }}
                    className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer"
                  >
                    <summary className="font-semibold text-gray-800">{q.question}</summary>
                    <p className="mt-2 text-gray-600">{q.answer}</p>
                  </motion.details>
                ))}
              </div>
            </div>
          </section>
  );
}