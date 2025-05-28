import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data
const store = {
name: "CapitalEdge Finance",
slug: "capitaledge",
bannerUrl: "/images/finance-hero.jpg",
metrics: [
{ label: "Clients Served", value: "500+" },
{ label: "Assets Managed", value: "\$10M+" },
{ label: "Expert Advisors", value: "20+" },
{ label: "Satisfaction Rate", value: "98%" },
],
services: [
{ id: "sv1", name: "Wealth Planning", imageUrl: "/services/wealth.jpg", slug: "wealth-planning" },
{ id: "sv2", name: "Investment Management", imageUrl: "/services/investment.jpg", slug: "investment-management" },
{ id: "sv3", name: "Retirement Solutions", imageUrl: "/services/retirement.jpg", slug: "retirement-solutions" },
],
testimonials: [
{ quote: "CapitalEdge guided me to financial freedom!", author: "Emily R." },
{ quote: "Professional and trustworthy advisors.", author: "Mark T." },
],
faqs: [
{ question: "How do I get started?", answer: "Schedule a free consultation using our contact form." },
{ question: "What fees do you charge?", answer: "We offer transparent, performance-based fees." },
],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function FinancSite() {
const router = useRouter();
const [metrics, setMetrics] = useState<any[]>([]);
const [services, setServices] = useState<any[]>([]);
const [testimonials, setTestimonials] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);

useEffect(() => {
setMetrics(store.metrics);
setServices(store.services);
setTestimonials(store.testimonials);
setFaqs(store.faqs);
}, []);

return ( <div className="space-y-24 font-sans">
 {/* Hero  */}
<section className="relative h-[70vh] bg-gradient-to-br from-blue-900 to-indigo-700 flex items-center justify-center text-white overflow-hidden"> <Image src={store.bannerUrl} alt="Finance Hero" fill className="object-cover opacity-30" loader={loader} />
<motion.div
className="relative z-10 text-center px-6 max-w-xl"
initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
>
<h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">{store.name}</h1> <p className="text-lg md:text-xl mb-8">Empowering your financial future with expert guidance.</p>
<motion.button
whileHover={{ scale: 1.05 }}
className="bg-green-500 hover\:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition"
onClick={() => router.push(`/${store.slug}/services`)}
>
Explore Services
</motion.button>
</motion.div> </section>


  {/* Metrics */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
      {metrics.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 * i }}
        >
          <h3 className="text-4xl font-bold text-gray-800">{m.value}</h3>
          <p className="mt-2 text-gray-600">{m.label}</p>
        </motion.div>
      ))}
    </div>
  </section>

  {/* Services */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Our Financial Services
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((svc, i) => (
          <motion.div
            key={svc.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer"
            onClick={() => router.push(`/${store.slug}/service/${svc.slug}`)}
          >
            <div className="relative h-48">
              <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" loader={loader} />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{svc.name}</h3>
              <p className="text-green-600 font-medium">View Details</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Testimonials */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-12 text-gray-800">
        Client Testimonials
      </motion.h2>
      <div className="max-w-3xl mx-auto space-y-8">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * i }}
            className="italic text-gray-700 text-lg"
          >
            “{t.quote}”<br /><span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
          </motion.blockquote>
        ))}
      </div>
    </div>
  </section>

  {/* FAQs */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6 max-w-2xl">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
        Frequently Asked Questions
      </motion.h2>
      <div className="space-y-6">
        {faqs.map((q, i) => (
          <motion.details key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + 0.1 * i }} className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer">
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
