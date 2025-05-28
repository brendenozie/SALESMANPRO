import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data
const store = {
  name: "CloudCraft SaaS",
  slug: "cloudcraft",
  description: "Powerful tools to scale your business effortlessly.",
  bannerUrl: "/images/saas-hero.jpg",
  features: [
    { title: "Real-time Analytics", description: "Track metrics live to make data-driven decisions." },
    { title: "Automated Workflows", description: "Set up triggers and actions to save time." },
    { title: "Team Collaboration", description: "Work together seamlessly, from anywhere." },
    { title: "Custom Integrations", description: "Connect with the tools you already use." },
  ],
  plans: [
    { name: "Starter", price: "$29/mo", perks: ["5 Projects", "Basic Analytics", "Email Support"] },
    { name: "Growth", price: "$79/mo", perks: ["Unlimited Projects", "Advanced Analytics", "Chat Support"] },
    { name: "Scale", price: "Contact Us", perks: ["Custom Solutions", "Dedicated Support", "Onboarding"] },
  ],
  testimonials: [
    { quote: "CloudCraft transformed our workflow!", author: "Alex P." },
    { quote: "Incredible features and easy to use.", author: "Jamie L." },
  ],
  faqs: [
    { question: "Is there a free trial?", answer: "Yes, 14-day free trial with no credit card required." },
    { question: "Can I change plans anytime?", answer: "Upgrade or downgrade at any time from your dashboard." },
    { question: "Do you offer team discounts?", answer: "Yes, contact sales for volume pricing." },
  ],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function SaasSite() {
  const router = useRouter();
  const [features, setFeatures] = useState(store.features);
  const [plans, setPlans] = useState(store.plans);
  const [testimonials, setTestimonials] = useState(store.testimonials);
  const [faqs, setFaqs] = useState(store.faqs);

  const handleSignup = () => router.push(`/${store.slug}/signup`);

  return (
    <div className="space-y-24 font-sans">
      {/* Hero */}
      <section className="relative h-[70vh] bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white overflow-hidden">
        <Image
          src={store.bannerUrl}
          alt="Hero"
          fill
          className="object-cover opacity-30"
          loader={loader}
        />
        <div className="relative z-10 text-center px-6 max-w-2xl">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            {store.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl mb-8"
          >
            {store.description}
          </motion.p>
          <motion.button
            onClick={handleSignup}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl transition"
          >
            Get Started
          </motion.button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gray-50 rounded-2xl shadow-lg cursor-pointer"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
            Pricing Plans
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl p-6 flex flex-col"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{plan.name}</h3>
                <p className="text-3xl font-semibold mb-6 text-indigo-600">{plan.price}</p>
                <ul className="mb-6 space-y-2 flex-1">
                  {plan.perks.map((perk, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <span className="mr-2 text-green-500">✔️</span> {perk}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleSignup}
                  className="mt-auto bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 transition"
                >
                  Choose {plan.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-12 text-gray-800">
            What Our Users Say
          </motion.h2>
          <div className="max-w-2xl mx-auto space-y-8">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * i }}
                className="italic text-gray-700 text-lg"
              >
                “{t.quote}”<br />
                <span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
            FAQs
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
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
    </div>
  );
}