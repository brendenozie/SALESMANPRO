import React from "react";
import { motion } from "framer-motion";

// --- MOCK DEPENDENCIES START ---
interface ICoreValue {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  order: number;
}

const storeFormDatas = {
  name: "A-B Consulting",
  CoreValues: [
    {
      id: "feat-1",
      title: "Trusted Expertise",
      description:
        "Benefit from over two decades of combined legal and financial mastery, ensuring your matters are handled with precision.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12">
          <path
            fillRule="evenodd"
            d="M3.75 4.5a.75.75 0 01.75-.75h.75c.189 0 .37.056.526.162L7.34 5.75H16.66l1.594-1.838a.75.75 0 01.526-.162h.75a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V4.5z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "#2563EB", // blue-600
      order: 1,
    },
    {
      id: "feat-2",
      title: "Tailored Strategies",
      description:
        "Receive personalized solutions meticulously crafted to align with your unique objectives and intricate requirements.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12">
          <path
            fillRule="evenodd"
            d="M12 21a9 9 0 00-7.838-4.787c.074-.326.242-.64.484-.946l2.164-2.164-2.164-2.164a3.75 3.75 0 01-.484-.946A9 9 0 0012 3a9 9 0 007.838 4.787c-.074.326-.242.64-.484.946l-2.164 2.164 2.164 2.164a3.75 3.75 0 01.484.946A9 9 0 0012 21z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "#D97706", // amber-600
      order: 2,
    },
    {
      id: "feat-3",
      title: "Proactive Communication",
      description:
        "Experience prompt responses and transparent updates, keeping you informed and confident at every stage.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12">
          <path
            fillRule="evenodd"
            d="M12 2.25a9.75 9.75 0 00-8.88 5.75c.34-.11.68-.21 1.02-.31a.75.75 0 01.52.12c.79.43 1.58.87 2.37 1.31a.75.75 0 01.12.52c-.11.34-.21.68-.31 1.02a.75.75 0 01-.12.52l-2.25 2.25a.75.75 0 01-1.06 0l-.38-.38a.75.75 0 010-1.06L4.56 12l-1.47-1.47a.75.75 0 010-1.06l.38-.38a.75.75 0 011.06 0l2.25 2.25c.34-.11.68-.21 1.02-.31a.75.75 0 01.52.12c.79.43 1.58.87 2.37 1.31a.75.75 0 01.12.52c-.11.34-.21.68-.31 1.02a.75.75 0 01-.12.52l-2.25 2.25a.75.75 0 01-1.06 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "#059669", // emerald-600
      order: 3,
    },
    {
      id: "feat-4",
      title: "Client-Centric Approach",
      description:
        "Your success is our priority. We are dedicated to delivering exceptional service and building lasting relationships.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12">
          <path
            fillRule="evenodd"
            d="M12 2.25a9.75 9.75 0 00-7.838 15.766c.105.155.3.267.544.267h14.792c.244 0 .439-.112.544-.267A9.75 9.75 0 0012 2.25zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "#DC2626", // red-600
      order: 4,
    },
  ],
  themeSettings: {
    primaryColor: "#004085",
    accentColor: "#2563EB",
  },
};
// --- MOCK DEPENDENCIES END ---

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};
const hoverVariants = (color: string) => ({
  hover: {
    scale: 1.05,
    y: -8,
    boxShadow: `0 10px 25px ${color}30`,
    borderColor: color,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
});

interface WhyChooseUsSectionProps {
  name?: string;
  CoreValues?: ICoreValue[];
  themeSettings?: Record<string, any> | null;
}

export default function WhyChooseUsSection({
  name,
  CoreValues = [],
  themeSettings = null,
}: WhyChooseUsSectionProps) {
  const lightBg = "#F9FAFB";
  const accentColor = themeSettings?.accentColor || "#2563EB";
  const valuesToDisplay = CoreValues.length > 0 ? CoreValues : storeFormDatas.CoreValues;
  const sectionTitle = name ? `Why Our Clients Trust ${name}` : "Why Our Clients Trust Us";

  if (valuesToDisplay.length === 0) return null;

  return (
    <section
      id="whyus"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden font-inter"
      style={{ background: `linear-gradient(to bottom, white, ${lightBg})` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(45deg, ${accentColor}, #60A5FA, #93C5FD)`,
            }}
          >
            {sectionTitle}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the <strong>core principles</strong> that guide our work, ensuring we deliver
            excellence and lasting partnerships.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {valuesToDisplay.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              variants={{ ...itemVariants, ...hoverVariants(item.color) }}
              whileHover="hover"
              className="group relative flex flex-col items-center text-center p-8 rounded-2xl shadow-md transition-all duration-300 bg-white border border-gray-200"
            >
              {/* Icon */}
              <div
                className="flex-shrink-0 p-4 rounded-full mb-6 transition-all duration-500"
                style={{
                  color: item.color,
                  backgroundColor: `${item.color}15`,
                  boxShadow: `0 0 15px ${item.color}25`,
                }}
              >
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold mb-3 leading-tight text-gray-800">{item.title}</h3>
              <p className="text-base leading-relaxed text-gray-600">{item.description}</p>

              <div
                className="absolute top-4 right-4 text-5xl font-extrabold opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                style={{ color: item.color }}
              >
                0{item.order}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
