import React from 'react';
import { InboxIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { PhoneIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ContactAccordion = ({ form, handleChange } : any) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
      {/* Accordion Header */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl cursor-pointer hover:from-blue-100 transition-all"
        role="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
          <PhoneIcon className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Contact Details</span>
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
            className="overflow-hidden mt-4"
          >
            <div className="space-y-6">

              {/* Opening Hours Grid */}
              <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
                <legend className="text-lg font-medium text-gray-800">Opening Hours</legend>
                {days.map(day => (
                  <div key={day} className="flex flex-col">
                    <label htmlFor={day} className="text-sm font-medium text-gray-700">{day}</label>
                    <input
                      id={day}
                      type="time"
                      name={`openingHours.${day.toLowerCase()}`}
                      value={form.openingHours[day.toLowerCase()] || ''}
                      onChange={handleChange}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ))}
              </fieldset>

              {/* Email Input */}
              <div className="flex flex-col">
                <label htmlFor="contactEmail" className="flex items-center text-sm font-medium text-gray-700">
                  <InboxIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  name="contactEmail"
                  placeholder="you@example.com"
                  required
                  value={form.contactEmail}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="mt-1 text-xs text-gray-500">User's use this email to communicate with you.</p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactAccordion;
