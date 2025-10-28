"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const loader = ({ src }: { src: string }) => {
  return src;
};

export default function SteppingOutSection({ storeSlug }: { storeSlug?: string }) {
  const router = useRouter();

  const handleJoin = () => {
    router.push(`/site/${storeSlug}/programs?program=stepping-out`);
  };

  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-b from-red-50 via-orange-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="container mx-auto px-4 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT: Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            <span className="text-red-600">Stepping Out</span> – Empowering Students for Life, Learning & Leadership
          </h2>

          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            Transitioning from school to college or the professional world can be daunting.
            <span className="font-semibold text-gray-900 dark:text-white"> Stepping Out </span>
            is a transformative life skills and leadership program designed to equip young people
            with the mindset, habits, and tools to thrive through these defining seasons — with
            confidence, clarity, and purpose.
          </p>

          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li>✅ Build self-awareness & emotional intelligence</li>
            <li>✅ Strengthen communication, discipline, and time management</li>
            <li>✅ Develop healthy habits & mental resilience</li>
            <li>✅ Create a personal life map & career portfolio</li>
            <li>✅ Cultivate leadership, confidence, and clarity of purpose</li>
          </ul>

          <div className="pt-6">
            <button
              onClick={handleJoin}
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6 rounded-full shadow-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-red-300"
            >
              Enroll in “Stepping Out”
            </button>
          </div>
        </motion.div>

        {/* RIGHT: Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative w-full aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1522204502310-209ac7ad3e26?q=80&w=1000"
              alt="Stepping Out Program"
              fill
              className="object-cover"
              loader={loader}
              priority
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="absolute -bottom-8 left-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg"
          >
            <p className="text-sm text-gray-800 dark:text-gray-100 font-semibold">
              “Success is not by chance — it’s by choice, clarity, and character.”
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')]"></div>
    </section>
  );
}
