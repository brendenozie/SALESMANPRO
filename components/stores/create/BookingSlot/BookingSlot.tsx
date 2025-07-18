'use client'; // For Next.js App Router

import React, { useEffect, useState, useCallback } from 'react';
import {
  CalendarIcon,
  PlusCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ProductForm } from '@/components/AddProductModal';
// import { ProductForm } from '@/types/typings'; // Assuming ProductForm is the comprehensive type for your main form data

interface BookingSlotType {
  date: string;
  time: string;
  capacity: number;
}

interface BookingSlotProps { // Renamed from Props for better clarity
  formData: ProductForm; // Use the actual comprehensive form type
  setFormData: (name: string, value: any) => void; // Matches the signature from useProductForm
}

export const BookingSlot: React.FC<BookingSlotProps> = ({ formData, setFormData }) => {
  const [open, setOpen] = useState(true);

  // Initialize bookingSlots with a default slot if empty
  useEffect(() => {
    if (!formData.bookingSlots || formData.bookingSlots.length === 0) {
      setFormData('bookingSlots', [{ date: '', time: '', capacity: 1 }]);
    }
  }, [formData.bookingSlots, setFormData]); // Depend on updateField and memoized function

  // Add a new booking slot
  const handleAddBookingSlot = useCallback(() => {
    const currentSlots = formData.bookingSlots || [];
    const newSlot: BookingSlotType = { date: '', time: '', capacity: 1 };
    setFormData('bookingSlots', [...currentSlots, newSlot]);
  }, [formData.bookingSlots, setFormData]);

  // Update an existing booking slot
  const handleUpdateBookingSlot = useCallback(
    (index: number, field: keyof BookingSlotType, value: string | number) => {
      const currentSlots = formData.bookingSlots || [];
      const updatedSlots = [...currentSlots]; // Create a shallow copy for immutability

      if (!updatedSlots[index]) {
        console.warn(`Attempted to update non-existent slot at index ${index}. This might indicate a timing issue.`);
        return;
      }

      updatedSlots[index] = {
        ...updatedSlots[index],
        // Ensure capacity is a number, other fields are strings
        [field]: field === 'capacity' ? Number(value) : value,
      };
      setFormData('bookingSlots', updatedSlots); // Update the parent state
    },
    [formData.bookingSlots, setFormData]
  );

  // Remove a booking slot
  const handleRemoveBookingSlot = useCallback(
    (index: number) => {
      const currentSlots = formData.bookingSlots || [];
      const filteredSlots = currentSlots.filter((_, i) => i !== index); // Remove slot by index
      setFormData('bookingSlots', filteredSlots); // Update the parent state
    },
    [formData.bookingSlots, setFormData]
  );

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-t-2xl"
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Booking Slots & Availability 🗓️</h3> {/* Added emoji for flair */}
        </div>
        <span className="flex items-center">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
              <h4 className="text-2xl font-bold text-gray-800">Manage Your Booking Slots</h4>
              <button
                type="button"
                onClick={handleAddBookingSlot}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Add New Slot
              </button>
            </div>

            <div className="space-y-4">
              {(formData.bookingSlots || []).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No booking slots added yet. Click "Add New Slot" to define available times.
                </p>
              )}
              {(formData.bookingSlots || []).map((slot, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 relative shadow-sm"
                >
                  <h5 className="text-lg font-semibold text-gray-800 md:col-span-3 mb-2">
                    Slot #{index + 1}
                  </h5>

                  <button
                    type="button"
                    onClick={() => handleRemoveBookingSlot(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                    aria-label="Remove booking slot"
                    title="Remove this booking slot"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>

                  <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Date</span>
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={slot.date}
                      onChange={(e) =>
                        handleUpdateBookingSlot(index, 'date', e.target.value)
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Time</span>
                    <input
                      type="time"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={slot.time}
                      onChange={(e) =>
                        handleUpdateBookingSlot(index, 'time', e.target.value)
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Capacity for this slot</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={slot.capacity}
                      onChange={(e) =>
                        handleUpdateBookingSlot(index, 'capacity', Number(e.target.value))
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
};