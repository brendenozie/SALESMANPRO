"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TagIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";

//----------------------------------------------
// Image loader (same as elsewhere)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

//----------------------------------------------
// EventsSite component, using StoreContext
//----------------------------------------------
export default function EventsSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    bannerUrl,
    storeCategories: categories,
    marketplaceListings: upcoming,
    testimonials,
    faqs,
  } = storeFormData;

  return (
    <div className="font-sans">
      {/* Hero */}
      <HeroComponent name={name} bannerUrl={bannerUrl} />

      {/* About */}
      <AboutSection description={description} />

      {/* Features */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Live Events */}
      <LiveEventsSection upcoming={upcoming} slug={slug} />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* Pricing (for event organizers) */}
      <PricingSection />

      {/* FAQ */}
      <FAQSection faqs={faqs} />

      {/* Call To Action */}
      <section className="bg-indigo-600 text-white py-16 text-center relative">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Host With Us</h3>
        <p className="text-lg mb-6">
          Planning an event? Let us help you make it extraordinary.
        </p>
        <Link
          href={`/${slug}/host`}
          className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-indigo-100 transition"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
}

function HeroComponent({
  name,
  bannerUrl,
}: {
  name: string;
  bannerUrl: string;
}) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-20 px-4 sm:px-10 min-h-screen flex items-center justify-center before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-600/20 before:to-purple-700/20 before:blur-3xl before:z-0"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Welcome to <span className="text-yellow-300">{name}</span>
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-white/90">
            Discover the most exciting events around you. Browse, book, and
            enjoy!
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300">
              Browse Events
            </button>
            <button
              className="border-white text-white hover:bg-white hover:text-indigo-700 font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300"
              onClick={() =>
                window.open("https://example.com/learn-more", "_blank")
              }
            >
              Learn More <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="relative"
        >
          <Image
            priority
            src={bannerUrl}
            loader={loader}
            width={600}
            height={400}
            alt="Hero"
            className="w-full max-w-md mx-auto md:mx-0 drop-shadow-xl"
          />
        </motion.div>
      </div>

      {/* Decorative Blurs */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-pink-500/20 rounded-full filter blur-3xl z-0"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-yellow-400/10 rounded-full filter blur-2xl z-0"></div>
    </section>
  );
}

function AboutSection({ description }: { description?: string }) {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <img
            src="/images/events-about.jpg"
            alt="About Us"
            className="w-full rounded-3xl shadow-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">We Are</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {description ||
              "We’re dedicated to bringing you the best events—music, art, tech, and wellness. Explore, connect, and celebrate with us."}
          </p>
          <ul className="space-y-3 text-gray-700 dark:text-gray-200">
            <li className="flex items-start">
              <span className="mr-3 text-indigo-500">✔</span> Curated
              experiences in every category
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-indigo-500">✔</span> Trusted ticketing
              and secure payments
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-indigo-500">✔</span> 24/7 support and
              reminders
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: <CalendarIcon className="w-8 h-8 text-indigo-600" />,
    title: "Easy Event Booking",
    description:
      "Find and reserve your spot at events in just a few clicks.",
  },
  {
    icon: <MapPinIcon className="w-8 h-8 text-indigo-600" />,
    title: "Local & Global Listings",
    description:
      "Browse events near you or explore happenings around the world instantly.",
  },
  {
    icon: <TicketIcon className="w-8 h-8 text-indigo-600" />,
    title: "Secure Ticketing",
    description:
      "Buy, store, and scan your tickets with confidence on our secure platform.",
  },
  {
    icon: <BellIcon className="w-8 h-8 text-indigo-600" />,
    title: "Real-Time Reminders",
    description:
      "Get notified before events start so you never miss out on the action.",
  },
];

function FeaturesSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4"
        >
          Why Choose Our Platform?
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Whether you're an attendee or an organizer, we’ve built tools to make
          your events smooth, exciting, and unforgettable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: <MagnifyingGlassIcon className="w-8 h-8 text-purple-600" />,
    title: "Find Events",
    description:
      "Browse trending, upcoming, and local events tailored to your interests.",
  },
  {
    icon: <CalendarIcon className="w-8 h-8 text-purple-600" />,
    title: "Book or Create",
    description:
      "Easily book your spot or create your own event in minutes using our intuitive dashboard.",
  },
  {
    icon: <FaceSmileIcon className="w-8 h-8 text-purple-600" />,
    title: "Enjoy the Experience",
    description:
      "Attend, network, or host—our tools make every step of the event journey seamless and fun.",
  },
];

function HowItWorksSection() {
  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6"
        >
          How It Works
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Getting started is easy. Whether you're here to discover or organize,
          we’ve got you covered in three simple steps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveEventsSection({
  upcoming,
  slug,
}: {
  upcoming: Array<{
    id: string;
    title?: string;
    name?: string;
    date?: string;
    location?: string;
    image?: string;
    subtitle?: string;
  }>;
  slug: string;
}) {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-10"
        >
          Featured Live Events
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {upcoming.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <img
                src={event.image || "/images/placeholder-event.jpg"}
                alt={event.name || event.title}
                className="h-52 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {event.name || event.title}
                </h3>
                {event.date && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="inline w-4 h-4 mr-1" />
                    {event.date}
                  </p>
                )}
                {event.location && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <MapPinIcon className="inline w-4 h-4 mr-1" />
                    {event.location}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {event.subtitle}
                </p>
                <a
                  href={`/${slug}/event/${event.id}`}
                  className="inline-block mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  View Event
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({
  testimonials,
}: {
  testimonials: Array<{ quote: string; author: string }>;
}) {
  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6"
        >
          What People Are Saying
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-xl mx-auto">
          Real stories from attendees and organizers who’ve used our platform to create memorable experiences.
        </p>

        <div className="grid gap-10 md:grid-cols-2 text-left">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-md transition"
            >
              <TagIcon className="text-purple-600 w-6 h-6 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                “{testimonial.quote}”
              </p>
              <footer className="mt-4 text-right font-semibold text-gray-900 dark:text-white">
                — {testimonial.author}
              </footer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    title: "Starter",
    price: "Free",
    description: "Perfect for new organizers testing the platform.",
    features: [
      "Host up to 1 event/month",
      "100 RSVPs",
      "Basic analytics",
      "Email support",
    ],
    highlighted: false,
  },
  {
    title: "Pro",
    price: "$29/mo",
    description: "For active organizers hosting multiple events.",
    features: [
      "Unlimited events",
      "Up to 5,000 RSVPs/month",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
    highlighted: true,
  },
  {
    title: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for agencies or enterprises.",
    features: [
      "Unlimited everything",
      "Dedicated account manager",
      "API access",
      "White-label solution",
    ],
    highlighted: false,
  },
];

function PricingSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6"
        >
          Flexible Plans for Every Organizer
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 mb-14 max-w-2xl mx-auto">
          Whether you're just starting out or managing major festivals, our
          pricing is built to scale with you.
        </p>

        <div className="grid gap-10 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`rounded-2xl p-8 shadow-lg border ${
                plan.highlighted
                  ? "bg-indigo-600 text-white border-indigo-700"
                  : "bg-white dark:bg-gray-900 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
              <p className="text-3xl font-semibold mb-4">{plan.price}</p>
              <p className="text-sm mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`inline-block w-full py-2 px-4 rounded-md text-center font-medium transition ${
                  plan.highlighted
                    ? "bg-white text-indigo-600 hover:bg-gray-100"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {plan.title === "Enterprise" ? "Contact Us" : "Get Started"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12">
          Everything you need to know about using our platform.
        </p>

        <div className="space-y-6 text-left">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-200 dark:border-gray-800 pb-4"
            >
              <button
                onClick={() => toggle(index)}
                className="flex items-center justify-between w-full text-left text-lg font-medium text-gray-800 dark:text-white focus:outline-none"
              >
                {faq.question}
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="mt-3 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
