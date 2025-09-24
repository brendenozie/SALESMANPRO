import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon } from '@heroicons/react/24/solid';

const App = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e:any) => {
    e.preventDefault();
    // In a real application, you would handle the form submission here.
    console.log('Subscribed with email:', email);
    setEmail(''); // Clear the input field after submission
  };

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="bg-slate-950 py-20 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative bg-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between shadow-xl
                     border border-slate-700 transition-all duration-500 hover:border-violet-500 hover:shadow-[0_0_20px_0_rgba(139,92,246,0.5)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          variants={variants}
        >
          <div className="text-center md:text-left md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-500 mb-2">
              Join Our Community
            </h2>
            <p className="text-lg sm:text-xl text-slate-400 max-w-lg mx-auto md:mx-0">
              Get the latest articles, exclusive content, and insights delivered straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full md:w-1/2 flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:flex-1">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full p-4 pl-12 rounded-full bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-400 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-full font-bold text-lg text-white shadow-md transition-all duration-300 transform hover:scale-105
                         bg-gradient-to-r from-violet-600 to-pink-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default App;
