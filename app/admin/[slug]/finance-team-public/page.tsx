// app/experts/page.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

// Placeholder data for experts and testimonials
// In a real application, this data would be fetched from your database via an API
const expertsData = [
  {
    id: 'exp1',
    name: 'Dr. Emily Carter',
    title: 'Senior Financial Advisor',
    expertise: ['Finance', 'Investment', 'Wealth Management'],
    image: 'https://placehold.co/150x150/2563eb/ffffff?text=EC',
    bio: 'Specializing in personalized investment strategies and long-term financial planning for high-net-worth individuals.',
  },
  {
    id: 'exp2',
    name: 'Michael Chen, Esq.',
    title: 'Corporate Legal Counsel',
    expertise: ['Legal', 'Corporate Law', 'Mergers & Acquisitions'],
    image: 'https://placehold.co/150x150/16a34a/ffffff?text=MC',
    bio: 'With over 15 years of experience, Michael provides strategic legal advice to tech startups and large corporations.',
  },
  {
    id: 'exp3',
    name: 'Sarah Rodriguez',
    title: 'Marketing Strategy Consultant',
    expertise: ['Marketing', 'Digital Strategy', 'Brand Development'],
    image: 'https://placehold.co/150x150/eab308/000000?text=SR',
    bio: 'Helps businesses craft compelling brand stories and execute data-driven digital marketing campaigns.',
  },
  {
    id: 'exp4',
    name: 'David Lee',
    title: 'Technology & IT Solutions',
    expertise: ['Technology', 'Cloud Computing', 'Cybersecurity'],
    image: 'https://placehold.co/150x150/dc2626/ffffff?text=DL',
    bio: 'Expert in developing scalable and secure IT infrastructure, from small business networks to enterprise-level solutions.',
  },
  {
    id: 'exp5',
    name: 'Jane Doe',
    title: 'Head of Analytics',
    expertise: ['Finance', 'Data Science'],
    image: 'https://placehold.co/150x150/6d28d9/ffffff?text=JD',
    bio: 'Passionate about leveraging data to drive financial success.',
  },
  {
    id: 'exp6',
    name: 'Peter Smith',
    title: 'Senior Tax Advisor',
    expertise: ['Legal', 'Tax Advisory'],
    image: 'https://placehold.co/150x150/0ea5e9/ffffff?text=PS',
    bio: 'Specializes in complex tax law and compliance for individuals and corporations.',
  },
];

const testimonialsData = [
  {
    id: 'test1',
    text: 'Dr. Carter’s investment advice was a game-changer for my portfolio. Her insights are truly invaluable!',
    author: 'John P.',
    rating: 5,
  },
  {
    id: 'test2',
    text: 'Working with Michael Chen was a pleasure. He navigated our complex legal issues with ease and professionalism.',
    author: 'Maria S.',
    rating: 4,
  },
  {
    id: 'test3',
    text: 'Sarah completely transformed our digital presence. We saw a 200% increase in leads within three months.',
    author: 'Alex T.',
    rating: 5,
  },
];

// Reusable components
const ExpertCard = ({ expert }:any) => (
  <motion.div
    className="bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform border border-gray-700"
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-blue-500">
      <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-xl font-bold text-white mb-1">{expert.name}</h3>
    <p className="text-sm text-blue-400 font-semibold mb-2">{expert.title}</p>
    <p className="text-sm text-gray-400 mb-4 h-12 overflow-hidden">{expert.bio}</p>
    <div className="flex flex-wrap justify-center gap-2">
      {expert.expertise.map((tag:any) => (
        <span key={tag} className="bg-blue-900/50 text-blue-300 text-xs px-3 py-1 rounded-full">{tag}</span>
      ))}
    </div>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="mt-6 px-6 py-3 bg-green-600 text-white rounded-full font-bold shadow-lg hover:bg-green-700 transition-colors flex items-center"
    >
      Book a Session <ArrowRightIcon className="h-4 w-4 ml-2" />
    </motion.button>
  </motion.div>
);

const TestimonialCard = ({ testimonial }:any) => (
  <motion.div
    className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
      ))}
    </div>
    <p className="text-gray-300 italic mb-4">"{testimonial.text}"</p>
    <p className="text-white font-semibold">- {testimonial.author}</p>
  </motion.div>
);

export default function ExpertPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // const expertiseCategories = ['All', ...new Set(expertsData.flatMap(e => e.expertise))];
  const expertiseCategories = ['All', ...Array.from(new Set(
    expertsData.flatMap(e => e.expertise)
  ))];

  const filteredExperts = expertsData.filter(expert => {
    const matchesCategory = selectedCategory === 'All' || expert.expertise.includes(selectedCategory);
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          expert.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Hero Section */}
      <motion.section
        className="relative bg-gradient-to-r from-blue-900 to-indigo-900 text-center py-20 px-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-expert-hero opacity-30" />
        <motion.div
          className="relative z-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-md">
            Meet Our Experts
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Connect with top professionals who can help you achieve your goals. Our team of seasoned experts is ready to provide tailored advice and solutions.
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          >
            Find Your Expert
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Main Content Area */}
      <main className="container mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar for Filters (Desktop View) */}
          <aside className="md:col-span-1">
            <motion.div
              className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 sticky top-10"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <MagnifyingGlassIcon className="h-6 w-6 mr-2 text-blue-400" />
                Find an Expert
              </h3>

              {/* Search Input */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-2">Search by Name or Title</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Emily Carter"
                  />
                </div>
              </div>

              {/* Expertise Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Filter by Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {expertiseCategories.map(category => (
                    <motion.button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                        ${selectedCategory === category
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Expert Cards Grid */}
          <section className="md:col-span-3">
            <h2 className="text-3xl font-bold text-white mb-6">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredExperts.length > 0 ? (
                  filteredExperts.map(expert => (
                    <ExpertCard key={expert.id} expert={expert} />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center p-10 bg-gray-800 rounded-xl text-gray-400"
                  >
                    No experts found matching your criteria.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      {/* Testimonials Section */}
      <motion.section
        className="bg-gray-800 py-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">What Our Clients Say</h2>
          <p className="text-center text-gray-400 mb-12">Hear from those who have already benefited from our expertise.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        className="bg-blue-600 text-white text-center py-16 px-4"
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your expert?</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Our team is committed to your success. Schedule a consultation today and take the first step towards achieving your goals.
          </p>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#1e40af' }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300"
          >
            Schedule a Consultation
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
