import React from 'react';
import { motion } from 'framer-motion';

// SVG Icons for the feature cards
const Icon = ({ pathData, className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d={pathData} />
  </svg>
);

const PenNibIcon = () => (
  <Icon
    className="w-10 h-10 text-white"
    pathData="M20.25 6.75a5.25 5.25 0 0 1 0 10.5h-1.5a.75.75 0 0 0 0 1.5h1.5a6.75 6.75 0 0 0 0-13.5h-1.5a.75.75 0 0 0 0 1.5h1.5z"
  />
);

const GlobeIcon = () => (
  <Icon
    className="w-10 h-10 text-white"
    pathData="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
  />
);

const ChartBarIcon = () => (
  <Icon
    className="w-10 h-10 text-white"
    pathData="M12 11.25a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 .75.75zM15.75 11.25a.75.75 0 0 0 .75-.75V3a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 .75.75zM8.25 11.25a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .75.75z"
  />
);

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const App = () => {
  return (
    <section className="bg-slate-950 py-20 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          variants={variants}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Join Our Community of Writers
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-12">
            Share your voice, grow your audience, and connect with a passionate community. We provide the tools you need to create, publish, and thrive.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Card 1 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variants={variants}
            className="bg-slate-800 p-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-slate-700"
          >
            <PenNibIcon />
            <h3 className="text-2xl font-bold text-white mt-4 mb-2">
              Powerful Editor
            </h3>
            <p className="text-slate-400">
              Our intuitive and powerful editor makes writing a breeze. Focus on your content, not the formatting.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            variants={variants}
            className="bg-slate-800 p-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-slate-700"
          >
            <GlobeIcon />
            <h3 className="text-2xl font-bold text-white mt-4 mb-2">
              Global Audience
            </h3>
            <p className="text-slate-400">
              Reach readers from all over the world and establish yourself as an authority in your niche.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            variants={variants}
            className="bg-slate-800 p-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-slate-700"
          >
            <ChartBarIcon />
            <h3 className="text-2xl font-bold text-white mt-4 mb-2">
              Track Your Impact
            </h3>
            <p className="text-slate-400">
              Get real-time analytics on your articles to understand your audience and optimize your content.
            </p>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.a
          href="/join" // Placeholder link
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          variants={variants}
          className="inline-block px-10 py-5 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          style={{
            background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
            color: 'white',
          }}
        >
          Start Writing Today
        </motion.a>
      </div>
    </section>
  );
}

export default App;
