import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { motion } from "framer-motion";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const store = {
  name: "AceTech Solutions",
  slug: "acetech",
  description: "Empowering your business with modern technology and innovative solutions.",
  bannerUrl: "/banner.jpg",
  categories: [
    { id: 1, name: "Web Development", slug: "web-dev", icon: "/icons/web.svg" },
    { id: 2, name: "Mobile Apps", slug: "mobile-apps", icon: "/icons/mobile.svg" },
    { id: 3, name: "UI/UX Design", slug: "ui-ux", icon: "/icons/design.svg" },
    { id: 4, name: "SEO Services", slug: "seo", icon: "/icons/seo.svg" },
    { id: 5, name: "Cloud Hosting", slug: "cloud", icon: "/icons/cloud.svg" },
    { id: 6, name: "Consulting", slug: "consulting", icon: "/icons/consulting.svg" },
  ],
  featuredServices: [
    {
      id: 1,
      name: "Custom Website Development",
      subtitle: "Tailored web solutions for your business",
      imageUrl: "/services/web.jpg",
    },
    {
      id: 2,
      name: "iOS & Android App Development",
      subtitle: "Mobile apps that scale and perform",
      imageUrl: "/services/mobile.jpg",
    },
    {
      id: 3,
      name: "Brand Identity & UX Design",
      subtitle: "Create an experience users love",
      imageUrl: "/services/design.jpg",
    },
  ],
  testimonials: [
    { quote: "AceTech helped transform our digital presence. Highly recommended!", author: "John Doe" },
    { quote: "Professional and efficient team with excellent results.", author: "Jane Smith" },
  ],
  faqs: [
    { question: "How long does a typical project take?", answer: "Most projects are completed within 4-8 weeks depending on complexity." },
    { question: "Do you offer support after launch?", answer: "Yes, we offer maintenance and support plans." },
  ],
};


export default function ServiceSite({ children, slug }:any) {
  const { setInquiryServiceId } = useStateContext();
  const router = useRouter();

  const handleInquiry = (serviceId:any) => {
    setInquiryServiceId(serviceId);
    router.push(`/${slug}/contact`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-600 overflow-hidden">
        {/* Decorative SVG Blobs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full opacity-30 filter blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500 rounded-full opacity-30 filter blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
        <div className="relative z-10 text-center px-6">
          <motion.h1
            className="text-6xl font-extrabold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            AceTech Solutions
          </motion.h1>
          <motion.p
            className="text-lg text-white/90 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Empowering your business with modern technology and innovative solutions.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Link
              href={`/${slug}/contact`}
              className="inline-block bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Explore Our Services
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {store.categories.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -8, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
                className="bg-white p-4 rounded-xl border border-gray-200 text-center cursor-pointer"
              >
                <Link href={`/${slug}/service-category/${cat.slug}`}>                  
                  <div className="w-16 h-16 mx-auto mb-3">
                    <Image
                      src={cat.icon}
                      alt={cat.name}
                      width={64}
                      height={64}
                      loader={loader}
                    />
                  </div>
                  <p className="text-gray-700 font-medium">{cat.name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Featured Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {store.featuredServices.map((svc) => (
              <motion.div
                key={svc.id}
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all relative"
              >
                <Image
                  src={svc.imageUrl}
                  alt={svc.name}
                  width={400}
                  height={240}
                  className="object-cover"
                  loader={loader}
                />
                <div className="p-6 bg-white">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {svc.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {svc.subtitle}
                  </p>
                  <button
                    onClick={() => handleInquiry(svc.id)}
                    className="mt-auto bg-indigo-600 text-white py-2 px-4 rounded-full hover:bg-indigo-700 transition"
                  >
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-r from-pink-100 to-indigo-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            What Clients Say
          </h2>
          <motion.div
            className="max-w-2xl mx-auto space-y-8"
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            {store.testimonials.map((t, i) => (
              <motion.blockquote key={i} className="italic text-gray-700">
                “{t.quote}”
                <div className="mt-2 font-semibold text-gray-900">— {t.author}</div>
              </motion.blockquote>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQs + Children */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Frequently Asked Questions
          </h2>
          {store.faqs.map((q, idx) => (
            <details
              key={idx}
              className="mb-4 bg-white rounded-xl p-6 shadow"
            >
              <summary className="cursor-pointer font-semibold text-gray-900">
                {q.question}
              </summary>
              <p className="mt-3 text-gray-600">
                {q.answer}
              </p>
            </details>
          ))}
        </div>
        <div className="container mx-auto px-6 mt-12">{children}</div>
      </section>
    </>
  );
}
