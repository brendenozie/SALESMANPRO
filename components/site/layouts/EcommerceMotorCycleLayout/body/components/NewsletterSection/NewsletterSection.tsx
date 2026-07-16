'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, GlobeAltIcon, BellAlertIcon } from '@heroicons/react/24/outline';

const INQUIRY_TOPICS = [
  { id: 'bespoke', label: 'Bespoke Commission' },
  { id: 'viewing', label: 'Private Viewing' },
  { id: 'acquisition', label: 'Acquisition' },
  { id: 'support', label: 'General Support' },
];

export default function ContactSection() {
  const [selectedTopic, setSelectedTopic] = useState('bespoke');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('submitting');

    try {
      // Package payload with the selected interactive topic
      const payload = {
        ...formData,
        topic: selectedTopic,
      };
      
      // Simulate high-security transmission delay
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setStatus('success');
    } catch (error) {
      console.error("Transmission failed:", error);
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setSelectedTopic('bespoke');
    setStatus('idle');
  };

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-zinc-950 border border-white/5 p-12 md:p-20 text-center rounded-sm"
        >
          {/* Ornamental Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-600/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-amber-600/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-amber-600/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-600/50" />

          <div className="flex justify-center mb-8">
            <div className="p-4 bg-zinc-900 rounded-full border border-white/5">
              <EnvelopeIcon className="w-8 h-8 text-amber-600 stroke-[1]" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
            Inquire with the <span className="italic">Atelier</span>
          </h2>
          
          <p className="text-zinc-400 text-sm md:text-base font-light tracking-wide max-w-lg mx-auto mb-10 leading-relaxed">
            Specify your intention below to establish direct priority routing with our dedicated concierge.
          </p>

          <div className="max-w-xl mx-auto">
            <AnimatePresence mode="wait">
              {status !== 'success' ? (
                <motion.form 
                  key="interactive-contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-8 text-left"
                >
                  {/* Topic Selector Pills */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-medium">Select Inquiry Type</span>
                    <div className="flex flex-wrap gap-2">
                      {INQUIRY_TOPICS.map((topic) => {
                        const isSelected = selectedTopic === topic.id;
                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => setSelectedTopic(topic.id)}
                            className={`px-4 py-2 text-[10px] uppercase tracking-wider font-medium border transition-all duration-300 rounded-none ${
                              isSelected
                                ? 'bg-amber-600/10 border-amber-600 text-amber-500'
                                : 'bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            {topic.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Text Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="IDENTIFIER / NAME"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white font-light text-xs tracking-widest placeholder:text-zinc-700 focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="EMAIL ADDRESS"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white font-light text-xs tracking-widest placeholder:text-zinc-700 focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Dynamic Message Box */}
                  <div className="relative">
                    <textarea
                      name="message"
                      rows={3}
                      required
                      placeholder={`PROVIDE DETAILS REGARDING YOUR ${selectedTopic.toUpperCase()} REQUEST...`}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-zinc-800 py-3 text-white font-light text-xs tracking-widest placeholder:text-zinc-700 focus:outline-none focus:border-amber-600 transition-colors resize-none"
                    />
                  </div>

                  {/* Centered Submit Action */}
                  <div className="pt-4 flex justify-center">
                    <button 
                      type="submit"
                      disabled={status === 'submitting'}
                      className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-10 py-4 hover:bg-amber-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      {status === 'submitting' ? 'Transmitting...' : 'Send Inquiry'}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-state"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="py-10 text-center space-y-6"
                >
                  <p className="text-zinc-300 text-sm font-light tracking-wide max-w-sm mx-auto leading-relaxed">
                    Thank you. Your request regarding <span className="text-amber-500 font-normal">{INQUIRY_TOPICS.find(t => t.id === selectedTopic)?.label}</span> has been securely processed.
                  </p>
                  <button
                    onClick={handleReset}
                    className="text-[9px] uppercase tracking-[0.2em] text-amber-600 hover:text-white transition-colors underline underline-offset-4"
                  >
                    Send Another Transmission
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Privacy/Trust Markers */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-white" />
              <span className="text-[9px] uppercase tracking-widest text-white">Global Access</span>
            </div>
            <div className="flex items-center gap-2">
              <BellAlertIcon className="w-4 h-4 text-white" />
              <span className="text-[9px] uppercase tracking-widest text-white">Priority Response</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative background text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.01] uppercase select-none whitespace-nowrap pointer-events-none">
        Privileged Access
      </div>
    </section>
  );
}