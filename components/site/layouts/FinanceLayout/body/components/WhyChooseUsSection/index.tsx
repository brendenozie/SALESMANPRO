import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// --- MOCK for useStoreContext to make the file self-contained ---
// const useStoreContext = () => {
  const storeFormDatas = {
    name: 'A-B Consulting',
    CoreValues: [
      {
        id: "feat-1",
        title: "Trusted Expertise",
        description: "Benefit from over two decades of combined legal and financial mastery, ensuring your matters are handled with precision.",
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12"><path fillRule="evenodd" d="M3.75 4.5a.75.75 0 01.75-.75h.75c.189 0 .37.056.526.162L7.34 5.75H16.66l1.594-1.838a.75.75 0 01.526-.162h.75a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V4.5zm1.5-1.5a.75.75 0 00-.75.75v.75H5.25a.75.75 0 000-1.5zM17.25 3h.75a.75.75 0 010 1.5h-.75V3zM3.75 6.75V19.5h16.5V6.75H3.75z" clipRule="evenodd" /></svg>,
        color: '#3B82F6', // Blue-500
        order: 1,
      },
      {
        id: "feat-2",
        title: "Tailored Strategies",
        description: "Receive personalized solutions meticulously crafted to align with your unique objectives and intricate requirements.",
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12"><path fillRule="evenodd" d="M12 21a9 9 0 00-7.838-4.787c.074-.326.242-.64.484-.946l2.164-2.164-2.164-2.164a3.75 3.75 0 01-.484-.946A9 9 0 0012 3a9 9 0 007.838 4.787c-.074.326-.242.64-.484.946l-2.164 2.164 2.164 2.164a3.75 3.75 0 01.484.946A9 9 0 0012 21z" clipRule="evenodd" /></svg>,
        color: '#F59E0B', // Amber-500
        order: 2,
      },
      {
        id: "feat-3",
        title: "Proactive Communication",
        description: "Experience prompt responses and transparent updates, keeping you informed and confident at every stage.",
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12"><path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 00-8.88 5.75c.34-.11.68-.21 1.02-.31a.75.75 0 01.52.12c.79.43 1.58.87 2.37 1.31a.75.75 0 01.12.52c-.11.34-.21.68-.31 1.02a.75.75 0 01-.12.52l-2.25 2.25a.75.75 0 01-1.06 0l-.38-.38a.75.75 0 010-1.06L4.56 12l-1.47-1.47a.75.75 0 010-1.06l.38-.38a.75.75 0 011.06 0l2.25 2.25c.34-.11.68-.21 1.02-.31a.75.75 0 01.52.12c.79.43 1.58.87 2.37 1.31a.75.75 0 01.12.52c-.11.34-.21.68-.31 1.02a.75.75 0 01-.12.52l-2.25 2.25a.75.75 0 01-1.06 0l-.38-.38a.75.75 0 010-1.06l1.47-1.47L12 18.94c.34-.11.68-.21 1.02-.31a.75.75 0 01.52.12l2.25 2.25a.75.75 0 011.06 0l.38.38a.75.75 0 010 1.06l-1.47 1.47a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 01-.12-.52c.11-.34.21-.68.31-1.02a.75.75 0 01.12-.52l2.25-2.25a.75.75 0 011.06 0l.38.38a.75.75 0 010 1.06l-1.47 1.47a.75.75 0 011.06 0l1.47-1.47c.34-.11.68-.21 1.02-.31a.75.75 0 01.52.12l2.25 2.25a.75.75 0 011.06 0l.38.38a.75.75 0 010 1.06l-1.47 1.47a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 01-.12-.52c.11-.34.21-.68.31-1.02a.75.75 0 01.12-.52l2.25-2.25a.75.75 0 011.06 0l.38.38a.75.75 0 010 1.06l-1.47 1.47a.75.75 0 011.06 0l1.47-1.47a.75.75 0 010-1.06l-.38-.38a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 01-.12-.52c.11-.34.21-.68.31-1.02a.75.75 0 01.12-.52l2.25-2.25a.75.75 0 011.06 0l.38.38a.75.75 0 010 1.06L12 18.94c.34-.11.68-.21 1.02-.31a.75.75 0 01.52.12l2.25 2.25a.75.75 0 011.06 0l.38.38a.75.75 0 010 1.06l-1.47 1.47a.75.75 0 011.06 0l1.47-1.47a.75.75 0 010-1.06l-.38-.38a.75.75 0 01-1.06 0L12 12.06z" clipRule="evenodd" /></svg>,
        color: '#10B981', // Emerald-500
        order: 3,
      },
      {
        id: "feat-4",
        title: "Client-Centric Approach",
        description: "Your success is our priority. We are dedicated to delivering exceptional service and building lasting relationships.",
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12"><path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 00-7.838 15.766c.105.155.3.267.544.267h14.792c.244 0 .439-.112.544-.267A9.75 9.75 0 0012 2.25zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg>,
        color: '#EF4444', // Red-500
        order: 4,
      },
    ],
    themeSettings: {
      primaryColor: '#004085',
    },
  };
//   return { storeFormData };
// };

// SVG Icons to replace Heroicons for self-containment
// const BriefcaseIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0v3.75a.75.75 0 01-1.5 0V6a3 3 0 10-6 0v3.75a.75.75 0 01-1.5 0V6z" clipRule="evenodd" /><path fillRule="evenodd" d="M3.522 17.5a.75.75 0 01.536-.707l16.5-4.5a.75.75 0 01.815.426 1.5 1.5 0 00.329.405l2.25 2.25a1.5 1.5 0 01.405.33l1.886 3.144a.75.75 0 01-1.25.668l-4.5-2.75a.75.75 0 01-.668 0l-4.5 2.75a.75.75 0 01-1.25-.668l1.886-3.144a1.5 1.5 0 01.405-.33l2.25-2.25a1.5 1.5 0 00.329-.405z" clipRule="evenodd" /></svg>;

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export default function App() {
  const { storeFormData } = useStoreContext();
  const { name, themeSettings = {}, CoreValues = [] } = storeFormData || storeFormDatas;
  // const primaryColor = themeSettings?.primaryColor || '#004085';

  const darkBackground = "#0A192F";
  const cardBackground = "#1B2A41";

  const valuesToDisplay = CoreValues.length > 0 ? CoreValues : [];

  const sectionTitle = name ? `Why Our Clients Trust ${name}` : "Why Our Clients Trust Us";

  if (valuesToDisplay.length === 0) {
    return null; // Do not render the section if there are no core values
  }

  return (
    <section
      id="why-choose-us"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden font-sans"
      style={{ background: `linear-gradient(to right, ${darkBackground}, ${cardBackground})` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            {sectionTitle}
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Discover the core principles that set us apart and consistently deliver outstanding results.
          </p>
        </motion.div>

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
              variants={itemVariants}
              className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-[#1B2A41] to-[#122033] rounded-3xl shadow-xl border border-transparent hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] cursor-default"
            >
              <div
                className="flex-shrink-0 p-4 rounded-full mb-6 transition-colors duration-300 group-hover:bg-blue-500/30"
                // style={{ backgroundColor: `${item.color}30`, color: item.color }}
              >
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-blue-200 transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-blue-100/80 text-base leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
