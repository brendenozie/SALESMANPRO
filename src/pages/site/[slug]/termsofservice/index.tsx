
// 4. Terms of Service (terms-of-service.tsx)
import React from 'react';
import Header from '@/components/site/header/Header';
import Footer from '@/components/site/footer/Footer';
import Section from '@/components/site/Section/Section';
import { motion } from 'framer-motion';

const TermsPage: React.FC = () => (
  <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
    <Header />
    <Section title="Terms of Service" background="none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto space-y-4 text-sm">
        <h3 className="font-semibold text-lg">Acceptance of Terms</h3>
        <p>Users agree to comply with these terms.</p>
        {/* Add rest of clauses */}
      </motion.div>
    </Section>
    <Footer />
  </div>
);
export default TermsPage;
