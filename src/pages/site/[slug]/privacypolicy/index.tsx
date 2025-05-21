
// 3. Privacy Policy (privacy-policy.tsx)
import React from 'react';
import Header from '@/components/site/header/Header';
import Footer from '@/components/site/footer/Footer';
import Section from '@/components/site/Section/Section';
import { motion } from 'framer-motion';

const PrivacyPolicyPage: React.FC = () => (
  <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
    <Header />
    <Section title="Privacy Policy" background="none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto space-y-4 text-sm"
      >
        <h3 className="font-semibold text-lg">Introduction</h3>
        <p>Explain how user data is collected and used.</p>
        <h3 className="font-semibold text-lg">Information We Collect</h3>
        <p>Details on personal and browsing data.</p>
        {/* Add all policy sections here */}
      </motion.div>
    </Section>
    <Footer />
  </div>
);
export default PrivacyPolicyPage;
