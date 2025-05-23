// app/[slug]/contact/page.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import { useStore } from '../../../../contexts/StoreContext';

export default function ContactPage() {
  const store = useStore();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate submission (e.g. API call)
    alert('Message sent!');
    setForm({ name: '', email: '', message: '' });
  };

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <Section title="Contact Us">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4"
        >
          {['name', 'email'].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium capitalize">{field}</label>
              <input
                type={field}
                name={field}
                value={(form as any)[field]}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          >
            Send Message
          </button>
        </motion.form>
      </Section>
    </div>
  );
}
