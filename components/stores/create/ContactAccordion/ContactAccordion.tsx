import React, { useState, ChangeEvent } from 'react';
import { OpeningHours } from '../../../../types/typings';

const weekdays = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

/* ================================
    WhatsApp helpers (International)
================================ */

function normalizeWhatsAppNumber(input: string): string {
  if (!input) return '';
  // Extract only the digits
  const digits = input.replace(/\D/g, '');
  // Save with a leading + for standard international E.164 format
  return digits ? `+${digits}` : '';
}

function formatWhileTyping(input: string): string {
  if (!input) return '';
  // Allow leading +, digits, spaces, hyphens, and parentheses
  let cleaned = input.replace(/[^\d\s\-+()]/g, '');
  
  // Ensure the '+' sign only appears at the very beginning
  const hasPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/\+/g, '');
  if (hasPlus) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

// A standard international number is between 7 and 15 digits long
export const isValidWhatsAppNumber = (phone: string) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

/* ================================
    Props
================================ */

interface ContactAccordionProps {
  openingHours: OpeningHours | null;
  contactEmail: string;
  contactPhone: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleDay: (dayKey: string) => void;
}

/* ================================
    Component
================================ */

export default function ContactAccordion({
  openingHours,
  contactEmail,
  contactPhone,
  onChange,
  onToggleDay,
}: ContactAccordionProps) {
  const [expanded, setExpanded] = useState(true);
  const [displayPhone, setDisplayPhone] = useState(
    contactPhone ? formatWhileTyping(contactPhone) : ''
  );

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatWhileTyping(raw);
    setDisplayPhone(formatted);

    const normalized = normalizeWhatsAppNumber(raw);

    onChange({
      ...e,
      target: {
        ...e.target,
        name: 'contactPhone',
        value: normalized || '',
      },
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <section className="max-w-4xl mx-auto overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md bg-white dark:bg-slate-900 transition-all duration-300">
      {/* Accordion Trigger Header */}
      <button
        type="button"
        onClick={() => setExpanded(x => !x)}
        className="w-full flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-5 py-4 sm:px-6 sm:py-5 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <span className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-wide text-left">
            Contact Details & Opening Hours
          </span>
        </div>
        <div className={`p-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* Accordion Content Panel */}
      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-4 py-6 sm:p-6 lg:p-8 space-y-8">
            
            {/* Contact Info Grid Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Email Input Field */}
              <div className="flex flex-col">
                <label className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="contactEmail"
                    value={contactEmail}
                    onChange={onChange}
                    placeholder="you@domain.com"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Phone Input Field */}
              <div className="flex flex-col">
                <label className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Phone Number (WhatsApp)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.28-5.116-3.573-6.397-1.397l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={displayPhone}
                    onChange={handlePhoneChange}
                    placeholder="+1 (555) 000-0000"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                {contactPhone && (
                  <div className="mt-2.5 text-xs font-medium self-start">
                    {!isValidWhatsAppNumber(contactPhone) ? (
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        Enter a valid international number
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          WhatsApp Active:
                        </span>
                        <a
                          // Ensures proper formatting for WhatsApp link by stripping out any whitespace or extra characters
                          href={`https://wa.me/${contactPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold hover:underline underline-offset-2 text-emerald-700 dark:text-emerald-300"
                        >
                          {contactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Opening Hours Panel */}
            <div className="bg-slate-50/70 dark:bg-slate-800/30 p-4 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Weekly Business Timelines
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {weekdays.map(({ key, label }) => {
                  const day = openingHours?.[key] || { open: '', close: '' };
                  const isClosed = !day.open && !day.close;

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border flex flex-col items-center space-y-3.5 shadow-xs transition-all duration-200 ${
                        isClosed 
                          ? 'bg-slate-100/40 dark:bg-slate-800/10 border-slate-200/50 dark:border-slate-800/50 opacity-75' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>

                      <button
                        type="button"
                        onClick={() => onToggleDay(key)}
                        className={`w-full max-w-[110px] py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 border ${
                          isClosed
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 shadow-xs'
                        }`}
                      >
                        {isClosed ? 'Closed' : 'Open'}
                      </button>

                      {!isClosed && (
                        <div className="w-full space-y-2 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Opens</span>
                            <input
                              type="time"
                              name={`openingHours.${key}.open`}
                              value={day.open}
                              onChange={onChange}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Closes</span>
                            <input
                              type="time"
                              name={`openingHours.${key}.close`}
                              value={day.close}
                              onChange={onChange}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}