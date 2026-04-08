'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import { useStore } from '@/contexts/StoreContext';
import { EnvelopeIcon, MapIcon, PhoneIcon, UserCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { UsersIcon } from '@heroicons/react/24/solid';

export default function ContactPage() {
  const store = useStore();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // TODO: Replace with actual API call to your backend

      setSubmitMessage('Message sent successfully! Thank you for reaching out.');
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitMessage('Failed to send message. Please try again later.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-800 dark:text-gray-200">Store not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen py-16">
      <Section title="Get in Touch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
        >
          {/* Left Column: Contact Information and Socials */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              We'd love to hear from you! 👋
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Whether you have a question about a product, need help with an order, or just want to say hi, our team is ready to help.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapIcon className="text-blue-500 text-2xl" />
                <span className="text-lg">123 E-Commerce St, Suite 456, City, State 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="text-blue-500 text-2xl" />
                <a href="mailto:support@yourstore.com" className="text-lg hover:underline">
                  support@yourstore.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="text-blue-500 text-2xl" />
                <span className="text-lg">+1 (555) 123-4567</span>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Follow Us</h3>
              <div className="flex space-x-4 mt-2">
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <UserCircleIcon className='text-blue-500 w-8 h-8' />
                </a>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <UserGroupIcon className='text-blue-500 w-8 h-8' />
                </a>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <UsersIcon className='text-blue-500 w-8 h-8' />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-xl shadow-inner">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </motion.button>

              {submitMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-4 text-center ${submitMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}
                >
                  {submitMessage}
                </motion.p>
              )}
            </form>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}