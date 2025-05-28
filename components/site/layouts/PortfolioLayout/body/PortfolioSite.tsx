import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample Data (ideally from CMS/API)
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

const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality || 75}`;

export default function PortfolioSite() {
  const router = useRouter();
  const [projects, setProjects] = useState<any>([]);
  const [testimonials, setTestimonials] = useState<any>([]);
  const [faqs, setFaqs] = useState<any>([]);

  useEffect(() => {
    setProjects(store.projects);
    setTestimonials(store.testimonials);
    setFaqs(store.faqs);
  }, []);

  return (
    <div className="space-y-24 font-sans text-gray-800">

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <Image
          src={store.bannerUrl}
          alt="Hero"
          layout="fill"
          objectFit="cover"
          loader={loader}
          className="object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-bold text-white drop-shadow-xl"
          >
            {store.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-lg md:text-2xl text-gray-200 max-w-2xl"
          >
            {store.description}
          </motion.p>
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => router.push(store.heroCta.link)}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg transform transition"
          >
            {store.heroCta.text}
          </motion.button>
        </div>
      </section>

      {/* Projects Gallery */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Featured Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj :any, i:any) => (
              <motion.div
                key={proj.id}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
                onClick={() => router.push(`/${store.slug}/project/${proj.slug}`)}
                className="relative group rounded-2xl overflow-hidden shadow-xl cursor-pointer"
              >
                <Image
                  src={proj.imageUrl}
                  alt={proj.name}
                  layout="responsive"
                  width={400}
                  height={300}
                  objectFit="cover"
                  loader={loader}
                  className="group-hover:scale-110 transform transition"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold">{proj.name}</h3>
                  <p className="mt-1 text-sm">{proj.subtitle}</p>
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
            {testimonials.map((t:any, i:any) => (
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

      {/* Video Testimonials Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Client Stories</h2>
          <div className="relative max-w-3xl mx-auto">
            <AnimatePresence>
              {testimonials.map((t:any, i:any) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="mb-8"
                >
                  <video controls className="w-full rounded-2xl shadow-lg">
                    <source src={`/testimonials/video${i+1}.mp4`} type="video/mp4" />
                    Your browser does not support video.
                  </video>
                  <p className="mt-4 italic text-gray-700">“{t.quote}”</p>
                  <p className="mt-2 font-semibold text-gray-900">— {t.author}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FAQs Accordion */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq:any, i:any) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <summary className="cursor-pointer text-xl font-semibold text-gray-800">
                  {faq.question}
                </summary>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8">Ready to bring your ideas to life? Reach out for a free consultation.</p>
          <Link href={`mailto:${store.contactEmail}`}  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-10 rounded-full font-semibold shadow-lg transition">
              Contact Me
          </Link>
        </div>
      </section>

    </div>
  );
}
