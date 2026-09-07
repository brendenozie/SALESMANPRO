'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

interface GeoLocation {
  lat: number;
  lng: number;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
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
    const encodedAddress = encodeURIComponent(address);
    mapSrc = `https://www.google.com/maps/embed/v1/place?q=${encodedAddress}&key=YOUR_Maps_API_KEY`;
  } else {
    mapSrc = `https://www.google.com/maps/embed/v1/place?q=Nairobi+CBD,+Kenya&key=YOUR_Maps_API_KEY`;
  }

  return (
    <section id="contact-routing" className="relative py-28 md:py-36 bg-white text-gray-900 overflow-hidden border-b border-gray-100">
      
      {/* STRUCTURAL BACKGROUND TELEMETRY MESHGRID */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-r border-gray-900 h-full" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* HEADER BLOCK */}
        <div className="mb-20 text-left">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
              COMM_LINK // INBOUND_ROUTING
            </p>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1] mb-6">
            ESTABLISH SECURE INTERFACE CONNECTION
          </h2>

          <p className="text-xs font-mono text-gray-500 leading-relaxed uppercase max-w-2xl">
            Initialize structural messaging components or bypass standard protocols via direct telemetry channels below. Secure processing node assigned to {name || 'SYS_CORE'}.
          </p>
        </div>

        {/* FLAT MATRIX GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 bg-white">
          
          {/* LEFT PANEL: TRANSMISSION FORM */}
          <div className="lg:col-span-6 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">[FORM_01_SECURE_COMMS]</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                  // IDENTIFICATION_STRING
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="FULL NAME / ENTERPRISE NAME"
                  className="w-full bg-gray-50 border border-gray-200 text-xs font-mono p-4 uppercase tracking-tight text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-950 focus:bg-white transition-colors"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                  // ROUTING_EMAIL_ADDRESS
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="NAME@ENTERPRISE.COM"
                  className="w-full bg-gray-50 border border-gray-200 text-xs font-mono p-4 uppercase tracking-tight text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-950 focus:bg-white transition-colors"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                  // TELEMETRY_DESCRIPTIVE_BODY
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="DESCRIBE OPERATIONAL EXPECTATIONS OR INCIDENT VULNERABILITIES..."
                  className="w-full bg-gray-50 border border-gray-200 text-xs font-mono p-4 uppercase tracking-tight text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-950 focus:bg-white transition-colors resize-none"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full text-xs font-mono font-black uppercase tracking-wider text-white bg-gray-950 hover:bg-gray-900 transition-colors py-4 px-6 border border-transparent"
              >
                DISPATCH_TRANSMISSION
              </button>
            </form>
          </div>

          {/* RIGHT PANEL: DIRECT CHANNELS & MAPS MATRIX */}
          <div className="lg:col-span-6 flex flex-col">
            
            {/* TOP RIGHT: DIRECT TELEMETRY CHANNELS */}
            <div className="p-8 md:p-12 border-b border-gray-200 flex-1">
              <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">[BYPASS_DIRECT_ROUTING]</span>
                <span className="text-[9px] font-mono font-bold text-gray-300">CTRL_Z09</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {contactEmail && (
                  <Link href={`mailto:${contactEmail}`} className="group block border-l-2 border-gray-200 hover:border-gray-950 pl-4 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <EnvelopeIcon className="w-3 h-3 text-gray-400 group-hover:text-gray-950 transition-colors" />
                      <span className="text-[10px] font-mono font-bold tracking-tight text-gray-400 uppercase">SYS_EMAIL</span>
                    </div>
                    <span className="text-xs font-mono font-bold break-all uppercase text-gray-900 tracking-tight group-hover:text-gray-600">
                      {contactEmail}
                    </span>
                  </Link>
                )}

                {contactPhone && (
                  <Link href={`tel:${contactPhone}`} className="group block border-l-2 border-gray-200 hover:border-gray-950 pl-4 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <PhoneIcon className="w-3 h-3 text-gray-400 group-hover:text-gray-950 transition-colors" />
                      <span className="text-[10px] font-mono font-bold tracking-tight text-gray-400 uppercase">SYS_PHONE</span>
                    </div>
                    <span className="text-xs font-mono font-bold uppercase text-gray-900 tracking-tight group-hover:text-gray-600">
                      {contactPhone}
                    </span>
                  </Link>
                )}

                {whatsappHref && (
                  <Link href={whatsappHref} target="_blank" rel="noopener noreferrer" className="group block border-l-2 border-gray-200 hover:border-gray-950 pl-4 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <ChatBubbleLeftRightIcon className="w-3 h-3 text-gray-400 group-hover:text-gray-950 transition-colors" />
                      <span className="text-[10px] font-mono font-bold tracking-tight text-gray-400 uppercase">SYS_WHATSAPP</span>
                    </div>
                    <span className="text-xs font-mono font-bold uppercase text-gray-900 tracking-tight group-hover:text-gray-600">
                      SECURE_STREAM_CHAT
                    </span>
                  </Link>
                )}

                {address && (
                  <div className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPinIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] font-mono font-bold tracking-tight text-gray-400 uppercase">LOC_COORDINATES</span>
                    </div>
                    <span className="text-xs font-mono font-bold uppercase text-gray-900 tracking-tight">
                      {address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM RIGHT: GRID COMPLIANT INTERACTIVE IRAME MAP */}
            <div className="p-2 bg-gray-50 h-[300px] lg:h-[340px] relative">
              <div className="w-full h-full border border-gray-200 bg-gray-100 relative overflow-hidden grayscale contrast-125 mix-blend-multiply opacity-85">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Operational Infrastructure Map Coordinates"
                />
                <div className="absolute top-3 left-3 bg-gray-950 text-[9px] font-mono font-black text-white px-2 py-0.5 uppercase tracking-widest">
                  LOC_VISUAL_MAP_v2.0
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER DIAGNOSTIC LOG */}
        <div className="mt-4 flex items-center justify-between px-1 text-[9px] font-mono text-gray-400 font-bold uppercase tracking-wider">
          <span>[SYSTEM_COMMS_MATRIX_LIVE]</span>
          <span>ROUTING_NODE_VERIFIED_100%</span>
        </div>

      </div>
    </section>
  );
}