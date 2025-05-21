// Directory: pages/site/[slug]

// 1. About Page (about.tsx)
import React from 'react';
import Header from '@/components/site/header/Header';
import Footer from '@/components/site/footer/Footer';
import Section from '@/components/site/Section/Section';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => (
  <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
    <Header />
    <Section title="About Us" background="none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto space-y-4 text-lg"
      >
        <p>Our store’s story—mission, vision, and values.</p>
        <p>What makes us unique: quality, selection, and service.</p>
        <p>Meet the team behind the scenes.</p>
      </motion.div>
    </Section>
    <Footer />
  </div>
);
export default AboutPage;

