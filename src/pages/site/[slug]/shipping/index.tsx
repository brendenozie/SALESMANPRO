
// 6. Returns (returns.tsx), Shipping (shipping.tsx), Track Order (track-order.tsx)
// Use a similar pattern: Hero Section, FAQs, form for tracking, etc.

// Example: Returns
// pages/site/[slug]/returns.tsx
import React from 'react';
import Header from '@/components/site/header/Header';
import Footer from '@/components/site/footer/Footer';
import Section from '@/components/site/Section/Section';
import { motion } from 'framer-motion';

const ReturnsPage: React.FC = () => (
  <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
    <Header />
    <Section title="Returns Policy" background="none">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6 }} className="max-w-3xl mx-auto space-y-4 text-sm">
        <p>Details on return window, conditions, and process.</p>
        {/* Steps or accordion for how to initiate a return */}
      </motion.div>
    </Section>
    <Footer />
  </div>
);
export default ReturnsPage;
