import React, { useEffect, useState } from 'react';
import {
  CalendarIcon, // Changed from TrophyIcon to a more relevant icon for booking
  PlusCircleIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon, // Added for removing booking slots, as seen in the provided JSX
} from '@heroicons/react/24/outline';

// Define the type for a single Booking Slot
interface BookingSlotType {
  date: string;
  time: string;
  capacity: number;
}

// Define the type for the form data that this component will manage/update
interface ServiceFormData {
  quantity?: number;
  serviceSchedule?: string;
  hourlyRate?: number;
  minimumHours?: number;
  minNoticePeriod?: string;
  maxBookingAhead?: string;
  totalCapacity?: number;
  deliveryMethod?: string;
  fulfillmentStatus?: string;
  providerRating?: number;
  bookingSlots?: BookingSlotType[]; // Array of booking slots
}

interface Props {
  formData: ServiceFormData;
  setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
}

const deliveryMethods = [
  "In-person",
  "Online",
  "Hybrid",
];

export const ServiceSpecifics: React.FC<Props> = ({ formData, setFormData }) => {
  const [open, setOpen] = useState(true);

  // Initialize bookingSlots if it's undefined
  useEffect(() => {
    if (!formData.bookingSlots || formData.bookingSlots.length === 0) {
      setFormData(prev => ({
        ...prev,
        bookingSlots: [{ date: '', time: '', capacity: 1 }],
      }));
    }
  }, [formData.bookingSlots, setFormData]);

  

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white" // Changed color for booking
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-6 w-6" /> {/* Changed icon */}
          <h3 className="text-lg font-semibold">Service Specifics</h3> {/* Updated title */}
        </div>
        <span className="flex items-center">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6">

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-2xl font-semibold mb-4 text-gray-800">Service Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Quantity (e.g., number of seats)</span>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="1"
                />
              </label>
              {/* <label className="block">
                <span className="text-gray-700 font-medium text-sm">General Service Schedule (e.g., "Mon-Fri, 9am-5pm")</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.serviceSchedule || ""}
                  onChange={(e) => setFormData({ ...formData, serviceSchedule: e.target.value })}
                  placeholder="Mon-Fri, 9am-5pm"
                />
              </label> */}
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Hourly Rate ($)</span>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.hourlyRate || ''}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Minimum Hours</span>
                <input
                  type="number"
                  step="1"
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.minimumHours || ''}
                  onChange={(e) => setFormData({ ...formData, minimumHours: Number(e.target.value) })}
                  placeholder="1"
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Min. Notice Period (e.g., "24 hours", "3 days")</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.minNoticePeriod || ""}
                  onChange={(e) => setFormData({ ...formData, minNoticePeriod: e.target.value })}
                  placeholder="24 hours"
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Max Booking Ahead (e.g., "3 months")</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.maxBookingAhead || ""}
                  onChange={(e) => setFormData({ ...formData, maxBookingAhead: e.target.value })}
                  placeholder="3 months"
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Total Capacity</span>
                <input
                  type="number"
                  step="1"
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.totalCapacity || ''}
                  onChange={(e) => setFormData({ ...formData, totalCapacity: Number(e.target.value) })}
                  placeholder="100"
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Delivery Method</span>
                <select
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.deliveryMethod || ""}
                  onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value || undefined })}
                >
                  <option value="">Select Method</option>
                  {deliveryMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Fulfillment Status</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.fulfillmentStatus || ""}
                  onChange={(e) => setFormData({ ...formData, fulfillmentStatus: e.target.value })}
                  placeholder="e.g., PENDING_CONFIRMATION"
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Provider Rating (Read-only for now)</span>
                <input
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full rounded-xl border-gray-300 p-3 bg-gray-100 cursor-not-allowed"
                  value={formData.providerRating || ''}
                  readOnly
                  placeholder="N/A"
                />
              </label>
            </div>
          </section>

        </div>
      )}
    </section>
  );
};