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

export const BookingSlot: React.FC<Props> = ({ formData, setFormData }) => {
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

  const handleAddBookingSlot = () => {
    setFormData({
      ...formData,
      bookingSlots: [...(formData.bookingSlots || []), { date: '', time: '', capacity: 1 }],
    });
  };

  const handleUpdateBookingSlot = (index: number, field: keyof BookingSlotType, value: string | number) => {
    const updatedSlots = [...(formData.bookingSlots || [])];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setFormData({ ...formData, bookingSlots: updatedSlots });
  };

  const handleRemoveBookingSlot = (index: number) => {
    setFormData({
      ...formData,
      bookingSlots: (formData.bookingSlots || []).filter((_, i) => i !== index),
    });
  };

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
          <h3 className="text-lg font-semibold">Booking Details & Slots</h3> {/* Updated title */}
        </div>
        <span className="flex items-center">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6">

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-2xl font-semibold mb-4 text-gray-800">Booking Slots</h4>
            <div className="space-y-4">
              {(formData.bookingSlots || []).map((slot, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg items-center border border-gray-200 relative">
                  <h5 className="text-md font-semibold text-gray-700 md:col-span-4">Slot #{index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => handleRemoveBookingSlot(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors duration-200"
                    aria-label="Remove booking slot"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  <label className="block">
                    <span className="text-gray-600 text-sm">Date</span>
                    {/* Consider a proper DatePicker component */}
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={slot.date}
                      onChange={(e) => handleUpdateBookingSlot(index, "date", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-gray-600 text-sm">Time</span>
                    {/* Consider a proper TimePicker component */}
                    <input
                      type="time"
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={slot.time}
                      onChange={(e) => handleUpdateBookingSlot(index, "time", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-gray-600 text-sm">Capacity</span>
                    <input
                      type="number"
                      step="1"
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={slot.capacity}
                      onChange={(e) => handleUpdateBookingSlot(index, "capacity", Number(e.target.value))}
                    />
                  </label>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddBookingSlot}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Booking Slot
            </button>
          </section>
        </div>
      )}
    </section>
  );
};