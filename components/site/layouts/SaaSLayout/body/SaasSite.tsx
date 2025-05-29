import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, ChevronDownIcon, CheckCircleIcon, StarIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
      <EnhancedHeroSection store={store} loader={loader} handleSignup={handleSignup} />

      {/* Features */}
      <FeaturesSection features={features} />

      {/* Pricing Plans */}
      <EnhancedPricingSection plans={plans} handleSignup={handleSignup} />

      {/* Testimonials */}
      <EnhancedTestimonialsSection testimonials={testimonials} />

      {/* FAQs */}
      <EnhancedFAQsSection faqs={faqs} />
      
    </div>
  );
}

function EnhancedHeroSection({ store, loader, handleSignup }:any) {
  return (
    <section
      className="relative flex flex-col justify-center items-center h-screen overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      role="region"
      aria-label="Hero Section"
    >
      {/* Animated Background Layers */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <Image
          src={store.bannerUrl}
          alt="Store banner background"
          fill
          className="object-cover opacity-10 blur-lg brightness-75"
          loader={loader}
          priority
        />
      </motion.div>

      {/* Overlay Content */}
      <div className="relative z-20 text-center px-6 md:px-12 space-y-8 max-w-4xl">
        {/* Subtitle / Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-sm md:text-base uppercase tracking-widest text-white/70"
        >
          Your Trusted Marketplace
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          className="font-extrabold text-4xl md:text-7xl leading-tight drop-shadow-lg"
        >
          {store.name}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg md:text-xl text-white/90 mx-auto max-w-2xl"
        >
          {store.description}
        </motion.p>

        {/* Call-to-Action */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <button
            onClick={handleSignup}
            className="inline-flex items-center gap-3 bg-white text-indigo-600 hover:bg-indigo-100 font-semibold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl transition-transform transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-2"
          >
            <ArrowRightIcon className="h-6 w-6" />
            Get Started
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 flex flex-col items-center space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <ChevronDownIcon className="h-6 w-6 text-white/70 animate-bounce" />
        <p className="text-sm text-white/70">Scroll down</p>
      </motion.div>

      {/* Decorative SVG Wave */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-none rotate-180">
        <svg
          className="relative block w-[150%] h-16 md:h-24"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.92C195.74,72.13,97.19,106.94,0,120V0H1200V27.35C1085.81,59.06,970.16,46.85,852.27,32.13c-176.4-23-343.75-40.84-510.88-4.23C298.78,39.76,320.64,52.71,321.39,56.92Z"
            fill="rgba(255,255,255,0.5)"
          />
        </svg>
      </div>
    </section>
  );
}

function FeaturesSection({ features }:any) {
  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Key Features
        </motion.h2>

        {/* Features Grid */}
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f:any, i:any) => (
            <motion.div
              key={i}
              className="relative p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer flex flex-col items-start"
              whileHover={{ translateY: -5 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {/* Icon Badge */}
              <div className="absolute -top-6 left-6 bg-indigo-600 dark:bg-indigo-500 p-3 rounded-full shadow-md">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {f.title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 flex-1">
                {f.description}
              </p>

              {/* Learn More Link */}
              <motion.a
                href={f.link}
                className="mt-4 inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium"
                whileHover={{ x: 5 }}
                transition={{ type: 'tween', duration: 0.2 }}
              >
                Learn More
                <svg
                  className="h-5 w-5 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EnhancedPricingSection({ plans, handleSignup }:any) {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Pricing Plans
        </motion.h2>

        {/* Plans Grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan:any, i:any) => {
            const isPopular = plan.popular;
            return (
              <motion.div
                key={i}
                className={`relative flex flex-col p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer ${isPopular ? 'border-2 border-indigo-500 dark:border-indigo-400' : ''}`}
                whileHover={{ translateY: -5 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                    <StarIcon className="h-5 w-5" />
                    <span className="text-sm font-semibold">Popular</span>
                  </div>
                )}

                {/* Plan Header */}
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {plan.name}
                </h3>
                <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-6">
                  {plan.price}
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-400">/mo</span>
                </p>

                {/* Perks List */}
                <ul className="flex-1 space-y-4 mb-6">
                  {plan.perks.map((perk:any, idx:any) => (
                    <li key={idx} className="flex items-start">
                      <span className="mt-1 text-indigo-600 dark:text-indigo-400 mr-3">
                        ✓
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Call to Action */}
                <motion.button
                  onClick={() => handleSignup(plan.id)}
                  className="mt-auto inline-flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  Choose {plan.name}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EnhancedTestimonialsSection({ testimonials }:any) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 text-center">
        {/* Section Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-16"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          What Our Users Say
        </motion.h2>

        {/* Testimonials Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t:any, i:any) => (
            <motion.div
              key={i}
              className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col items-center text-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ perspective: 1000 }}
            >
              {/* Avatar */}
              {t.avatarUrl && (
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-indigo-500 dark:ring-indigo-400">
                  <Image src={t.avatarUrl} alt={t.author} width={80} height={80} className="object-cover" />
                </div>
              )}

              {/* Quote */}
              <p className="italic text-gray-700 dark:text-gray-200 mb-4 flex-1">
                “{t.quote}”
              </p>

              {/* Author */}
              <span className="font-semibold text-gray-900 dark:text-gray-100 mt-2">
                — {t.author}
              </span>

              {/* Rating Stars */}
              {t.rating && (
                <div className="mt-3 flex space-x-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <StarIcon
                      key={idx}
                      className={`h-5 w-5 ${idx < t.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EnhancedFAQsSection({ faqs }:any) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Section Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          FAQs
        </motion.h2>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((q:any, i:any) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-md"
              >
                <button
                  className="w-full flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {q.question}
                  </span>
                  <motion.span
                    initial={{ rotate: 0 }}
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isOpen ? (
                      <XMarkIcon className="h-6 w-6 text-indigo-600" />
                    ) : (
                      <PlusIcon className="h-6 w-6 text-indigo-600" />
                    )}
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="px-6 pb-6 bg-white dark:bg-gray-900"
                    >
                      <p className="text-gray-700 dark:text-gray-300">
                        {q.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}