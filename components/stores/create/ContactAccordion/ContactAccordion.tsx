import React, { useState, ChangeEvent } from 'react';
import {
  InboxIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { PhoneIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export interface OpeningHours {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

export interface ContactAccordionProps {
  openingHours: OpeningHours;
  contactEmail: string;
  contactPhone: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const days: { label: keyof OpeningHours; display: string }[] = [
  { label: 'mon', display: 'Monday' },
  { label: 'tue', display: 'Tuesday' },
  { label: 'wed', display: 'Wednesday' },
  { label: 'thu', display: 'Thursday' },
  { label: 'fri', display: 'Friday' },
  { label: 'sat', display: 'Saturday' },
  { label: 'sun', display: 'Sunday' },
];

export default function ContactAccordion({
  openingHours,
  contactEmail,
  contactPhone,
  onChange,
}: ContactAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Accordion Header */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className="flex justify-between items-center p-5 bg-white/60 backdrop-blur border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all"
        role="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <PhoneIcon className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-semibold text-gray-900">
            Contact Details
          </span>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-6"
          >
            <div className="space-y-8">

              {/* Email Input */}
              <div className="flex flex-col">
                <label htmlFor="contactEmail" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <InboxIcon className="h-5 w-5 text-indigo-500" />
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  name="contactEmail"
                  placeholder="you@example.com"
                  required
                  value={contactEmail}
                  onChange={onChange}
                  className="mt-2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This is the email users will use to reach you.
                </p>
              </div>

              {/* Phone Input */}
              <div className="flex flex-col">
                <label htmlFor="contactPhone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5 text-indigo-500" />
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  name="contactPhone"
                  placeholder="0700 000 000"
                  required
                  value={contactPhone}
                  onChange={onChange}
                  className="mt-2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This is the phone number users will use to reach you.
                </p>
              </div>

              {/* Opening Hours */}
              <fieldset className="bg-white/60 backdrop-blur p-6 rounded-xl border border-gray-200 shadow-sm">
                <legend className="text-lg font-semibold text-gray-800 mb-4">
                  Opening Hours
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {days.map(({ label, display }) => (
                    <div key={label} className="flex flex-col">
                      <label htmlFor={label} className="text-sm text-gray-600 font-medium">
                        {display}
                      </label>
                      <input
                        id={label}
                        type="time"
                        name={`openingHours.${label}`}
                        value={openingHours[label] || ''}
                        onChange={onChange}
                        className="mt-2 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
