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



interface ContactAccordionProps {
  openingHours: OpeningHours;
  contactEmail: string;
  contactPhone: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleDay: (dayKey: string) => void; 
}

export default function ContactAccordion({
  openingHours,
  contactEmail,
  contactPhone,
  onChange,
  onToggleDay,   
}: ContactAccordionProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleDay = (key: string) => {
    onToggleDay(key);
  };

  return (
    <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        onClick={() => setExpanded(x => !x)}
        className="w-full flex justify-between items-center bg-indigo-100 px-6 py-4"
      >
        <span className="text-lg font-medium text-indigo-700">
          Contact & Opening Hours
        </span>
        <span className="text-indigo-700 text-2xl">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="px-6 py-8 space-y-8">
          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Email Address
              </span>
              <input
                type="email"
                name="contactEmail"
                value={contactEmail}
                onChange={onChange}
                placeholder="you@domain.com"
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Phone Number
              </span>
              <input
                type="tel"
                name="contactPhone"
                value={contactPhone}
                onChange={onChange}
                placeholder="123-456-7890"
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </label>
          </div>

          {/* Opening Hours */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
              Opening Hours
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {weekdays.map(({ key, label }) => {
                const day = openingHours[key] || { open: '', close: '' };
                const isClosed = !day.open && !day.close;
                return (
                  <div
                    key={key}
                    className="bg-white p-4 rounded-xl border border-indigo-200 flex flex-col items-center space-y-3"
                  >
                    {/* Day Label */}
                    <span className="font-medium text-gray-600">{label}</span>

                    {/* Open/Closed Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleDay(key)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isClosed
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isClosed ? 'Closed' : 'Open'}
                    </button>

                    {/* Time Inputs */}
                    {!isClosed && (
                      <div className="w-full flex flex-col space-y-2">
                        <label className="flex flex-col text-xs text-gray-600">
                          Open
                          <input
                            type="time"
                            name={`openingHours.${key}.open`}
                            value={day.open}
                            onChange={onChange}
                            className="mt-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                          />
                        </label>
                        <label className="flex flex-col text-xs text-gray-600">
                          Close
                          <input
                            type="time"
                            name={`openingHours.${key}.close`}
                            value={day.close}
                            onChange={onChange}
                            className="mt-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
