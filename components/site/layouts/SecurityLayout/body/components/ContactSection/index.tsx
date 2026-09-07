'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

interface GeoLocation {
  lat: number;
  lng: number;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

interface StoreFormData {
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  geoLocation?: GeoLocation;
  themeSettings?: ThemeSettings;
  name?: string;
}

export default function ContactSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const {
    contactEmail,
    contactPhone,
    address,
    geoLocation,
    themeSettings = {},
    name,
  } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#00A880'; 

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  

  const sanitizedPhone = contactPhone ? contactPhone.replace(/\D/g, '') : '';
  const whatsappHref = sanitizedPhone ? `https://wa.me/${sanitizedPhone}` : '';

  let mapSrc = '';
  if (geoLocation && typeof geoLocation.lat === 'number' && typeof geoLocation.lng === 'number') {
    mapSrc = `https://www.google.com/maps/embed/v1/place?q=${geoLocation.lat},${geoLocation.lng}&key=YOUR_Maps_API_KEY`;
  } else if (address) {
    mapSrc = `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(address)}&key=YOUR_Maps_API_KEY`;
  } else {
    mapSrc = `https://www.google.com/maps/embed/v1/place?q=Nairobi+CBD,+Kenya&key=YOUR_Maps_API_KEY`;
  }

  return (
    <section
      id="contact"
      className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 border-b border-gray-100 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* SECTION HEADER TELEMETRY */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-20 border-b border-gray-100 pb-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">
                COMMS_GATEWAY // SECURE
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
              Establish Communication
            </h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm lg:mt-8">
            Initialize an encrypted session link with {name || 'our architecture group'}. Our distributed support desk monitors all routing tags continuously.
          </p>
        </div>

        {/* PRIMARY INTERFACE SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* TERMINAL TRANSMISSION FORM (7 Columns) */}
          <div className="lg:col-span-7">
            <div className="border border-gray-100 bg-gray-50/40 p-8 rounded-2xl relative">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  [MESSAGE_TRANSMISSION_PROTOCOL]
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 mb-2">
                      01 // FULL_NAME
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Identity parameter"
                      className="w-full bg-white px-4 py-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors placeholder-gray-300 font-mono"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 mb-2">
                      02 // EMAIL_ADDRESS
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Routing target destination"
                      className="w-full bg-white px-4 py-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors placeholder-gray-300 font-mono"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 mb-2">
                    03 // INQUIRY_DATA_STRING
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Enter explicit architectural specifications or parameters..."
                    className="w-full bg-white px-4 py-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors placeholder-gray-300 font-mono resize-none"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full text-white text-xs font-mono font-bold uppercase tracking-wider py-4 px-6 rounded-xl transition-all duration-200 hover:opacity-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  Dispatch Payload Data
                </button>
              </form>
            </div>
          </div>

          {/* TELEMETRY METRICS & MAP (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-12">
            
            {/* DIRECT COMMS HUB */}
            <div className="border-t border-gray-100 pt-6">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 block mb-6">
                [DIRECT_DIRECTORY_ROUTING]
              </span>
              
              <div className="divide-y divide-gray-100">
                {contactEmail && (
                  <Link
                    href={`mailto:${contactEmail}`}
                    className="flex items-center justify-between py-4 group text-xs font-mono transition-colors"
                  >
                    <span className="text-gray-500 uppercase tracking-wider flex items-center gap-3">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400 stroke-[2]" />
                      SMTP_SERVER
                    </span>
                    <span className="font-bold text-gray-900 group-hover:underline break-all max-w-[220px] text-right">
                      {contactEmail}
                    </span>
                  </Link>
                )}
                
                {contactPhone && (
                  <Link
                    href={`tel:${contactPhone}`}
                    className="flex items-center justify-between py-4 group text-xs font-mono transition-colors"
                  >
                    <span className="text-gray-500 uppercase tracking-wider flex items-center gap-3">
                      <PhoneIcon className="w-4 h-4 text-gray-400 stroke-[2]" />
                      VOICE_UPLINK
                    </span>
                    <span className="font-bold text-gray-900 group-hover:underline">
                      {contactPhone}
                    </span>
                  </Link>
                )}

                {whatsappHref && (
                  <Link
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-4 group text-xs font-mono transition-colors"
                  >
                    <span className="text-gray-500 uppercase tracking-wider flex items-center gap-3">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400 stroke-[2]" />
                      ASYNC_SIGNAL
                    </span>
                    <span className="font-bold tracking-wider uppercase text-xs" style={{ color: primaryColor }}>
                      CONNECT_LIVE →
                    </span>
                  </Link>
                )}
                
                {address && (
                  <div className="flex items-start justify-between py-4 text-xs font-mono">
                    <span className="text-gray-500 uppercase tracking-wider flex items-center gap-3 mt-0.5">
                      <MapPinIcon className="w-4 h-4 text-gray-400 stroke-[2]" />
                      GRID_LOC
                    </span>
                    <span className="font-bold text-gray-900 max-w-[200px] text-right leading-tight">
                      {address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* HIGH-DENSITY FRAME MAP EMBED */}
            <div className="border border-gray-100 p-2 rounded-2xl bg-gray-50 h-[240px] relative overflow-hidden">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="System Location Grid Map"
                className="rounded-xl grayscale filter contrast-[1.05] brightness-[0.98]"
              ></iframe>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}