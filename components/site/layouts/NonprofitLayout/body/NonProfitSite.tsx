import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data
const store = {
  name: "Hope Horizon Foundation",
  slug: "hope-horizon",
  bannerUrl: "/images/nonprofit-hero.jpg",
  description: "Empowering communities through education, health, and sustainable development.",
  programs: [
    { id: "pr1", name: "Education for All", subtitle: "Scholarship and mentorship", imageUrl: "/programs/education.jpg", slug: "education-for-all" },
    { id: "pr2", name: "Health Initiatives", subtitle: "Medical camps and wellness", imageUrl: "/programs/health.jpg", slug: "health-initiatives" },
    { id: "pr3", name: "Green Projects", subtitle: "Reforestation and clean energy", imageUrl: "/programs/green.jpg", slug: "green-projects" },
    { id: "pr4", name: "Community Outreach", subtitle: "Skill training and empowerment", imageUrl: "/programs/community.jpg", slug: "community-outreach" },
  ],
  stats: [
    { label: "Students Educated", value: "5K+" },
    { label: "Patients Treated", value: "2K+" },
    { label: "Trees Planted", value: "10K+" },
  ],
  testimonials: [
    { quote: "Hope Horizon changed my life by providing education.", author: "Alice M." },
    { quote: "Their health programs are a blessing.", author: "David K." },
  ],
  faqs: [
    { question: "How can I volunteer?", answer: "Visit our volunteer page and fill out the form." },
    { question: "Where does my donation go?", answer: "100% of donations fund our core programs." },
    { question: "Can I visit your projects?", answer: "Yes, sign up for our next community day." },
  ],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

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
    <div className="space-y-24 font-sans">
      {/* Hero */}
      <section className="relative h-screen bg-gradient-to-br from-green-800 via-emerald-600 to-teal-500 flex items-center justify-center text-white overflow-hidden">
        <Image src={store.bannerUrl} alt="Hero" fill className="object-cover opacity-30" loader={loader} />
        <div className="relative z-10 text-center px-6 max-w-xl">
          <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl font-bold mb-4">
            {store.name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg md:text-xl mb-8">
            {store.description}
          </motion.p>
          <motion.button onClick={handleDonate} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white text-green-700 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl transition">
            Donate Now
          </motion.button>
        </div>
      </section>

      {/* Our Programs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
            Our Programs
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((prog, i) => (
              <motion.div key={prog.id} whileHover={{ scale: 1.05 }} transition={{ stiffness: 300 }} className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg cursor-pointer" onClick={() => router.push(`/${store.slug}/program/${prog.slug}`)}>
                <div className="relative h-40">
                  <Image src={prog.imageUrl} alt={prog.name} fill className="object-cover" loader={loader} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{prog.name}</h3>
                  <p className="text-gray-700">{prog.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 * i }}>
              <h3 className="text-5xl font-bold text-green-700">{stat.value}</h3>
              <p className="mt-2 text-gray-700 text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stories of Change */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-12 text-gray-800">
            Stories of Change
          </motion.h2>
          <div className="max-w-2xl mx-auto space-y-8">
            {testimonials.map((t, i) => (
              <motion.blockquote key={i} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 * i }} className="italic text-gray-700 text-lg">
                “{t.quote}”<br /><span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
            Help & FAQs
          </motion.h2>
          <div className="space-y-4">
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