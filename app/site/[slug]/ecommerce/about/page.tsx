
import React from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/site/Section/Section';


export default function About() {

  return (
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
  )
}

