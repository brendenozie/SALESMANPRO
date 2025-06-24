import React from 'react';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'; // Added ArrowRightIcon
import { motion } from 'framer-motion';

const SchoolSection = () => {
  // Animation variants for staggered appearance
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.2
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      },
    },
  };

  return (
    // Section with a captivating gradient background
    <motion.section
      className="relative text-black py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }} // Animate when 30% of the section is in view
      variants={containerVariants}
    >
      {/* Abstract geometric background elements (optional, but adds visual flair) */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1440 700" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="1200" cy="150" r="250" fill="url(#paint0_radial)" />
          <circle cx="100" cy="550" r="300" fill="url(#paint1_radial)" />
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1200 150) rotate(90) scale(250)">
              <stop stopColor="#F97316" />
              <stop offset="1" stopColor="#6D28D9" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 550) rotate(90) scale(300)">
              <stop stopColor="#FFDE00" />
              <stop offset="1" stopColor="#6D28D9" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
        {/* Left Image Section */}
        <motion.div
          className="flex-shrink-0 w-full lg:w-5/12 perspective-1000" // Added perspective for subtle 3D effect on hover
          variants={itemVariants}
        >
          <motion.img
            src="https://placehold.co/600x400/805AD5/FFFFFF?text=Student+Learning" // Placeholder image
            alt="Student learning smarter way"
            className="rounded-2xl w-full h-auto object-cover shadow-2xl transition-all duration-500
                       hover:rotate-x-3 hover:rotate-y-3 hover:scale-105" // Subtle rotation and scale on hover
            style={{ transformStyle: 'preserve-3d' }} // Required for 3D transforms
          />
        </motion.div>

        {/* Right Content Section */}
        <div className="w-full lg:w-7/12 text-center lg:text-left">
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-black"
            variants={itemVariants}
          >
            Smarter Way to go Through Your School
          </motion.h2>

          <motion.p
            className="mb-6 text-indigo-800 leading-relaxed text-lg" // Softer text color, slightly larger font
            variants={itemVariants}
          >
            Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you
            master complex subjects, ace exams, and unlock your full potential with ease and efficiency.
          </motion.p>

          {/* Bullet Points */}
          <ul className="space-y-4 mb-8"> {/* Increased spacing */}
            {[
              'Achieve your academic goals with tailored learning experiences.',
              'Gain profound understanding with intuitive and engaging content.',
              'Connect with expert tutors for personalized guidance and support.',
              'Simplify complex topics with easy-to-understand explanations.',
            ].map((text, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-4 text-black font-medium" // Adjusted spacing and font weight
                variants={itemVariants}
              >
                <CheckCircleIcon className="text-yellow-400 flex-shrink-0 mt-1 w-6 h-6 animate-pulse-once" /> {/* Vibrant color, larger icon, pulse animation */}
                <span>{text}</span>
              </motion.li>
            ))}
          </ul>

          <motion.p
            className="mb-8 text-indigo-800 leading-relaxed text-lg" // Softer text color, slightly larger font
            variants={itemVariants}
          >
            Our comprehensive resources are designed to seamlessly integrate with your existing curriculum, providing
            a supportive environment for growth and success. From interactive lessons to real-time progress tracking,
            we're here to make your educational path smoother and more rewarding.
          </motion.p>

          {/* Call to Action Button */}
          <motion.button
            className="inline-flex items-center bg-yellow-400 text-indigo-900 font-bold py-3 px-8 rounded-full shadow-lg
                       hover:shadow-xl transform hover:scale-105 transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-75"
            variants={itemVariants}
            onClick={() => console.log('Learn More clicked!')} // Replace with actual navigation
          >
            Learn More
            <ArrowRightIcon className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default SchoolSection;
