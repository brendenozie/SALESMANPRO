import React, { useState, ChangeEvent } from 'react';
import TimePicker from 'react-time-picker';

import {
  Cog6ToothIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

const weekdays = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export default function ContactAccordion({
  openingHours,
  contactEmail,
  contactPhone,
  onChange,
}:any) {
  const [open, setOpen] = useState(true);
  const [holidayDate, setHolidayDate] = useState(new Date());

  return (
    <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <header
        onClick={() => setOpen(prev => !prev)}
        className="flex justify-between items-center px-6 py-4 cursor-pointer bg-gradient-to-r from-indigo-50 to-indigo-100"
      >
        <div className="flex items-center space-x-3">
          <Cog6ToothIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Contact & Opening Hours</h2>
        </div>
        <span className="flex items-center text-indigo-600">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </header>

      {/* Content */}
      {open && (
        <div className="px-6 py-6 space-y-8">
          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="block">
              <span className="flex items-center text-sm font-medium text-gray-700">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Email Address
              </span>
              <input
                type="email"
                name="contactEmail"
                value={contactEmail}
                onChange={onChange}
                placeholder="you@domain.com"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition"
              />
            </label>

            <label className="block">
              <span className="flex items-center text-sm font-medium text-gray-700">
                <PhoneIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Phone Number
              </span>
              <input
                type="tel"
                name="contactPhone"
                value={contactPhone}
                onChange={onChange}
                placeholder="123-456-7890"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition"
              />
            </label>
          </div>

          {/* Opening Hours */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <h3 className="text-lg font-medium text-indigo-700 mb-4">Opening Hours</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {weekdays.map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-gray-600 mb-1">{label}</span>
                  <TimePicker
                    name={key}
                    onChange={value => onChange({ target: { name: `openingHours.${key}`, value } })}
                    value={openingHours[key] || ''}
                    disableClock
                    clearIcon={null}
                    className="w-full text-sm text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {/* optional submit handler */}}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
