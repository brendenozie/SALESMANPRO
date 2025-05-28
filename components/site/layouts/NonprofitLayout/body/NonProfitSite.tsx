import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";


// Sample data (could be fetched via getStaticProps)
const store = {
  name: "Hope Horizon Foundation",
  slug: "hope-horizon",
  bannerUrl: "/images/nonprofit-hero.jpg",
  description: "Empowering communities through education, health, and sustainable development.",
  programs: [
    { id: "pr1", name: "Education for All", subtitle: "Scholarship & mentorship", imageUrl: "/programs/education.jpg", slug: "education-for-all" },
    { id: "pr2", name: "Health Initiatives", subtitle: "Medical camps & wellness", imageUrl: "/programs/health.jpg", slug: "health-initiatives" },
    { id: "pr3", name: "Green Projects", subtitle: "Reforestation & renewable energy", imageUrl: "/programs/green.jpg", slug: "green-projects" },
    { id: "pr4", name: "Community Outreach", subtitle: "Skills training & empowerment", imageUrl: "/programs/community.jpg", slug: "community-outreach" },
  ],
  stats: [
    { label: "Students Educated", value: "5K+" },
    { label: "Patients Treated", value: "2K+" },
    { label: "Trees Planted", value: "10K+" },
  ],
  testimonials: [
    { quote: "Hope Horizon changed my life by providing education.", author: "— Alice M." },
    { quote: "Their health programs are a blessing.", author: "— David K." },
  ],
  faqs: [
    { question: "How can I volunteer?", answer: "Visit our volunteer page and fill out the form." },
    { question: "Where does my donation go?", answer: "100% of donations fund our core programs." },
    { question: "Can I visit your projects?", answer: "Yes, sign up for our next community day." },
  ],
};

const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality || 75}`;

export default function NonProfitSite() {
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setPrograms(store.programs);
    setStats(store.stats);
    setTestimonials(store.testimonials);
    setFaqs(store.faqs);
  }, []);

  const handleDonate = () => router.push(`/${store.slug}/donate`);

  return (
    <div className="font-sans text-gray-800">

      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <Image src={store.bannerUrl} alt="Hero" fill className="object-cover brightness-75" loader={loader} priority />
        </div>
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center px-6 max-w-2xl space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            {store.name}
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            {store.description}
          </p>
          <button onClick={handleDonate} className="bg-green-600 hover:bg-green-700 text-white shadow-xl">
            Donate Now <ArrowRightIcon className="ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Our Programs
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((prog, i) => (
              <motion.div
                key={prog.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="group bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer flex flex-col"
                onClick={() => router.push(`/${store.slug}/program/${prog.slug}`)}
              >
                <div className="relative h-48">
                  <Image
                    src={prog.imageUrl}
                    alt={prog.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loader={loader}
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {prog.name}
                    </h3>
                    <p className="text-gray-600">
                      {prog.subtitle}
                    </p>
                  </div>
                  <Link href={`/${store.slug}/program/${prog.slug}`} className="mt-4 inline-flex items-center text-green-600 hover:underline font-medium">
                    Learn More <ArrowRightIcon className="ml-1 w-5 h-5"   />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-green-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-around items-center space-y-8 sm:space-y-0">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * i }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-green-700">
                {stat.value}
              </h3>
              <p className="mt-2 text-lg text-gray-700">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stories of Change */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-12"
          >
            Stories of Change
          </motion.h2>

          <div className="space-y-12">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 * i }}
                className="relative bg-green-50 p-8 rounded-2xl shadow-lg italic"
              >
                <svg className="absolute top-4 left-4 w-8 h-8 text-green-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.17 6A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2h-4V6H7.17zM3 6a4.017 4.017 0 014.83-4A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2H3V6z" />
                </svg>
                <p className="text-lg text-gray-800">“{t.quote}”</p>
                <footer className="mt-4 text-right font-semibold text-gray-900">
                  {t.author}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Help & FAQs
          </motion.h2>

          <div className="space-y-4">
            {faqs.map((q, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * i }}
                className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg"
              >
                <summary className="font-medium cursor-pointer flex justify-between items-center">
                  {q.question}
                  <span className="ml-2 text-green-600 transform group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-gray-700">{q.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
