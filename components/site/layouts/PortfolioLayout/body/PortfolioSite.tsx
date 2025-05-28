import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample Data
const store = {
  name: "CreativeSpark Portfolio",
  slug: "creativespark",
  description: "Showcasing innovative design and development projects.",
  bannerUrl: "/images/portfolio-hero.jpg",
  heroCta: { text: "View My Work", link: "/projects" },
  projects: [
    { id: "pr1", name: "E-commerce Redesign", subtitle: "Boosting sales with UI/UX", imageUrl: "/projects/shop.jpg", slug: "ecommerce-redesign" },
    { id: "pr2", name: "Brand Identity Revamp", subtitle: "Logo & visual style guide", imageUrl: "/projects/brand.jpg", slug: "brand-identity" },
    { id: "pr3", name: "Mobile App Prototype", subtitle: "Task management app", imageUrl: "/projects/mobile.jpg", slug: "mobile-prototype" },
    { id: "pr4", name: "Landing Page Campaign", subtitle: "Lead gen optimization", imageUrl: "/projects/landing.jpg", slug: "landing-page" },
    { id: "pr5", name: "Interactive Dashboard", subtitle: "Data visualization tool", imageUrl: "/projects/dashboard.jpg", slug: "interactive-dashboard" },
    { id: "pr6", name: "Animated Explainer", subtitle: "2D motion graphics", imageUrl: "/projects/explainer.jpg", slug: "animated-explainer" },
  ],
  testimonials: [
    { quote: "Truly exceptional design thinking!", author: "Alex P." },
    { quote: "Our brand feels reinvigorated.", author: "Taylor S." },
    { quote: "The dashboard tool is a game changer.", author: "Jordan L." },
  ],
  faqs: [
    { question: "What services do you offer?", answer: "UI/UX design, branding, front-end development, and motion graphics." },
    { question: "What is your process?", answer: "Discovery, wireframing, prototyping, feedback, and delivery." },
    { question: "How can I hire you?", answer: "Contact via email for a free consultation." },
  ],
  contactEmail: "hello@creativespark.com",
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function PortfolioSite() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setProjects(store.projects);
    setTestimonials(store.testimonials);
    setFaqs(store.faqs);
  }, []);

  return (
    <div className="space-y-20 font-sans">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <Image src={store.bannerUrl} alt="Hero" fill className="object-cover opacity-40" loader={loader} />
        <div className="relative z-10 text-center px-6 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => router.push(store.heroCta.link)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg transition"
            >
              {store.heroCta.text}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Projects Gallery */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Featured Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj, i) => (
              <motion.div
                key={proj.id}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => router.push(`/${store.slug}/project/${proj.slug}`)}
              >
                <div className="relative h-64">
                  <Image src={proj.imageUrl} alt={proj.name} fill className="object-cover" loader={loader} />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{proj.name}</h3>
                  <p className="text-gray-700">{proj.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">What Clients Say</h2>
          <div className="space-y-8 max-w-2xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * i }}
                className="italic text-gray-700 text-lg"
              >
                “{t.quote}”<br />
                <span className="font-semibold text-gray-900">— {t.author}</span>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-gray-100 p-6 rounded-2xl shadow-lg"
              >
                <summary className="cursor-pointer text-lg font-semibold text-gray-800">{faq.question}</summary>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Let's Work Together</h2>
          <p className="text-gray-600 mb-8">Interested in collaborating? Reach out for a free consultation.</p>
          <Link href={`mailto:${store.contactEmail}`}>  
            <a className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg transition">
              Contact Me
            </a>
          </Link>
        </div>
      </section>
    </div>
  );
}