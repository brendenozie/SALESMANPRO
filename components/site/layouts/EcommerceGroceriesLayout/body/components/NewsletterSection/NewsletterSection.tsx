'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  // Dynamic values sourced from context with elegant defaults
  const emailVal = storeFormData?.contactEmail || 'support@yourstore.com';
  const phoneVal = storeFormData?.contactPhone || '+254 700 000 000';
  const addressVal = storeFormData?.address || 'Nairobi, Kenya';

  const contactChannels = [
    { icon: EnvelopeIcon, label: "Email Us", value: emailVal },
    { icon: PhoneIcon, label: "Call Us", value: phoneVal },
    { icon: MapPinIcon, label: "Our Headquarters", value: addressVal }
  ];

  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://127.0.0.1:3000/api';


  // State Management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) return;
    
        setStatus('loading');
        setErrorMessage('');
    
        try {
          const response = await fetch('/api/conversations/send-to-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storeId: storeFormData?._id || storeFormData?.id,
              ...formData,
            }),
          });
    
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.message || 'Failed to dispatch message. Please try again.');
          }
    
          setStatus('success');
          setFormData({ name: '', email: '', message: '' });
        } catch (err: any) {
          console.error('Contact Submission Error:', err);
          setStatus('error');
          setErrorMessage(err?.message || 'Inquiry delivery failed.');
        }
      };

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative grid grid-cols-1 lg:grid-cols-2 bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl"
        >
          {/* Left Side: Contact Methods & Context */}
          <div className="p-12 md:p-16 lg:p-20 flex flex-col justify-center space-y-10">
            <div className="space-y-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6"
                style={{ backgroundColor: primary, color: '#fff' }}
              >
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Let’s start a <br />
                <span className="italic font-light text-gray-400">conversation.</span>
              </h2>
              <p className="text-gray-500 font-medium max-w-sm">
                Have questions about our products or custom orders? Drop us a line and our team will get back to you within 24 hours.
              </p>
            </div>

            <ul className="space-y-6">
              {contactChannels.map((channel, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-2 rounded-xl bg-gray-100 mt-1">
                    <channel.icon className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{channel.label}</h4>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{channel.value}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right Side: Interactive Input Form */}
          <div className="relative bg-gray-900 p-12 md:p-16 lg:p-20 flex flex-col justify-center overflow-hidden min-h-[550px]">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px]" style={{ backgroundColor: primary }} />
            </div>

            <div className="relative z-10 w-full">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.form 
                    key="contact-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 outline-none focus:border-white/20 transition-all text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="johndoe@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 outline-none focus:border-white/20 transition-all text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                      <textarea
                        name="message"
                        rows={4}
                        placeholder="How can we help you today?"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 outline-none focus:border-white/20 transition-all text-sm font-medium resize-none"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full mt-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: primary, color: '#fff' }}
                    >
                      {status === 'submitting' ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowRightIcon className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success-message"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center space-y-6"
                  >
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircleIcon className="w-8 h-8" style={{ color: primary }} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Message Received</h3>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                        We have successfully parsed your message. A team member will reach out to you shortly.
                      </p>
                    </div>
                    <button
                      onClick={() => setStatus('idle')}
                      className="text-xs font-black uppercase tracking-widest underline decoration-2 transition-all hover:opacity-80"
                      style={{ color: primary }}
                    >
                      Send another message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}