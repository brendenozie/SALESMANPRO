import React from 'react';
import {
  InboxIcon,
} from "@heroicons/react/24/outline";
import { PhoneIcon } from '@heroicons/react/24/solid';

type Props = {
  form: {
    contactEmail: string;
    openingHours: Record<string,string>;
    geoLocation: { lat: number; lng: number; radius: number };
  };
  handleChange: React.ChangeEventHandler;
  handleLocationChange: (loc: Partial<{lat:number;lng:number;radius:number}>) => void;
};

const ContactAccordion: React.FC<Props> = ({
  form,
  handleChange,
}) => {
  

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <details open className="group">
        <summary className="flex justify-between items-center p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
          <div className="flex items-center space-x-2">
            <PhoneIcon className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold text-gray-800">Contact</span>
          </div>
          <span className="transform transition group-open:rotate-180">▼</span>
        </summary>

        <div className="mt-6 space-y-6">
          {/* Opening Hours */}
          <fieldset className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
            <legend className="col-span-2 font-medium">Opening Hours</legend>
            {['mon','tue','wed','thu','fri','sat','sun'].map(day => (
              <div key={day}>
                <label className="block text-sm font-medium capitalize">{day}</label>
                <input
                  type="time"
                  name={`openingHours.${day}`}
                  value={form.openingHours[day] || ''}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </fieldset>

          {/* Email */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700">
              <InboxIcon className="h-5 w-5 mr-2 text-gray-600" />
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              placeholder="you@example.com"
              required
              value={form.contactEmail}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>
      </details>
    </div>
  );
};

export default ContactAccordion;
