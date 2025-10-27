'use client'; // This directive might be for Next.js 13+ App Router

import React, { useEffect, useState, useCallback } from 'react';
import {
  CalendarIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
// import { ProductForm } from '@/components/AddProductModal';
import { ProductForm } from '@/types/typings'; // Assuming ProductForm is the comprehensive type

interface BookingSlotType {
  date: string;
  time: string;
  capacity: number;
}

// Assuming ServiceFormData is a sub-part of ProductForm.
// If not, and this component truly operates on a distinct ServiceFormData,
// you might need to adjust how it integrates with the parent's main form state.
interface ServiceSpecificsProps {
  formData: ProductForm; // Use the comprehensive form type
  handleChange: (name: string, value: any) => void; // Matches the useProductForm signature
}

const deliveryMethods = ['In-person', 'Online', 'Hybrid'];

export const ServiceSpecifics = ({ formData, handleChange }: ServiceSpecificsProps) => {
  const [open, setOpen] = useState(true);

  // Initialize bookingSlots with a default slot if empty
  useEffect(() => {
    if (!formData.bookingSlots || formData.bookingSlots.length === 0) {
      // handleChange('bookingSlots', [{ date: '', time: '', capacity: 1 }]);
    }
  }, [formData.bookingSlots, handleChange]); // Depend on handleChange

  const handleSlotChange = useCallback(
    (index: number, field: keyof BookingSlotType, value: string | number) => {
      const currentSlots = formData.bookingSlots || [];
      const updatedSlots = [...currentSlots]; // Create a shallow copy for immutability

      if (!updatedSlots[index]) {
        console.warn(`Attempted to update non-existent slot at index ${index}. This might indicate a timing issue.`);
        return;
      }

      // Update the specific field for the chosen slot
      updatedSlots[index] = {
        ...updatedSlots[index],
        [field]: field === 'capacity' ? Number(value) : value, // Ensure capacity is a number
      };
      handleChange('bookingSlots', updatedSlots); // Update the parent state
    },
    [formData.bookingSlots, handleChange]
  );

  const handleAddSlot = useCallback(() => {
    const currentSlots = formData.bookingSlots || [];
    const newSlot: BookingSlotType = { date: '', time: '', capacity: 1 };
    handleChange('bookingSlots', [...currentSlots, newSlot]); // Add new slot and update parent state
  }, [formData.bookingSlots, handleChange]);

  const handleRemoveSlot = useCallback(
    (index: number) => {
      const currentSlots = formData.bookingSlots || [];
      const filteredSlots = currentSlots.filter((_, i) => i !== index); // Remove slot by index
      handleChange('bookingSlots', filteredSlots); // Update parent state
    },
    [formData.bookingSlots, handleChange]
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
          <h3 className="text-lg font-semibold">Service Specifics 📅</h3> {/* Added emoji */}
        </div>
        <span className="flex items-center">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="p-6 space-y-8">
          {/* Service Fields */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-2xl font-bold mb-4 text-gray-800">General Service Details</h4> {/* Changed title for clarity */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Added lg:grid-cols-3 */}
              <FormNumberField
                label="Available Quantity (e.g., number of seats, items)"
                placeholder="1"
                value={formData.quantity}
                onChange={(val) => handleChange('quantity', val)} // Updated
                step={1}
              />

              <FormNumberField
                label="Hourly Rate ($) (if applicable)"
                placeholder="0.00"
                step={0.01}
                value={formData.hourlyRate || 0}
                onChange={(val) => handleChange('hourlyRate', val)} // Updated
              />

              <FormNumberField
                label="Minimum Hours (for hourly services)"
                placeholder="1"
                step={1}
                value={formData.minimumHours || 1}
                onChange={(val) => handleChange('minimumHours', val)} // Updated
              />

              <FormTextField
                label="Minimum Notice Period (e.g., 24 hours, 3 days)"
                placeholder="24 hours"
                value={formData.minNoticePeriod || ''}
                onChange={(val) => handleChange('minNoticePeriod', val)} // Updated
              />

              <FormTextField
                label="Max Booking Lead Time (e.g., 3 months, 1 year)"
                placeholder="3 months"
                value={formData.maxBookingAhead || ''}
                onChange={(val) => handleChange('maxBookingAhead', val)} // Updated
              />

              <FormNumberField
                label="Total Service Capacity (overall limit)"
                placeholder="100"
                step={1}
                value={formData.totalCapacity || 0}
                onChange={(val) => handleChange('totalCapacity', val)} // Updated
              />

              <div>
                <label className="text-gray-700 font-medium text-sm block mb-1">Service Delivery Method</label>
                <select
                  className="block w-full rounded-xl border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  value={formData.deliveryMethod || ''}
                  onChange={(e) => handleChange('deliveryMethod', e.target.value || undefined)} // Updated
                >
                  <option value="">Select Method</option>
                  {deliveryMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <FormTextField
                label="Fulfillment Status (e.g., PENDING_CONFIRMATION, CONFIRMED)"
                placeholder="e.g., PENDING_CONFIRMATION"
                value={formData.fulfillmentStatus || ''}
                onChange={(val) => handleChange('fulfillmentStatus', val)} // Updated
              />

              <FormNumberField
                label="Provider Rating (Read-only, calculated automatically)"
                placeholder="N/A"
                value={formData.providerRating || 1}
                readOnly
              />
            </div>
          </section>

          {/* Booking Slots */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
              <h4 className="text-2xl font-bold text-gray-800">Specific Booking Slots</h4>
              <button
                type="button"
                onClick={handleAddSlot}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Booking Slot
              </button>
            </div>

            <div className="space-y-4">
              {(formData.bookingSlots || []).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Define specific dates and times for your service.
                </p>
              )}
              {(formData.bookingSlots || []).map((slot, index) => (
                <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4 relative grid grid-cols-1 md:grid-cols-3 gap-4">
                  <h5 className="text-lg font-semibold text-gray-700 md:col-span-3 mb-2">Slot #{index + 1}</h5>
                  <button
                    onClick={() => handleRemoveSlot(index)}
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
                      onChange={(e) => handleSlotChange(index, 'date', e.target.value)}
                    />
                  </label>

                  <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Time</span>
                    <input
                      type="time"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={slot.time}
                      onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                    />
                  </label>

                  <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Capacity for this slot</span>
                    <input
                      type="number"
                      min={1}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={slot.capacity}
                      onChange={(e) => handleSlotChange(index, 'capacity', e.target.value)}
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

/* ----------------------- Reusable Field Components (Updated for consistency) ----------------------- */

interface FormNumberFieldProps {
  label: string;
  value?: number;
  onChange?: (val: number | undefined) => void; // Allow undefined for clearing input
  placeholder?: string;
  step?: number;
  readOnly?: boolean;
}

const FormNumberField: React.FC<FormNumberFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  step = 1,
  readOnly = false,
}) => (
  <label className="block">
    <span className="text-gray-700 font-medium text-sm">{label}</span>
    <input
      type="number"
      step={step}
      value={value ?? ''} // Use nullish coalescing to show empty string for undefined/null
      readOnly={readOnly}
      onChange={(e) => {
        if (readOnly) return;
        const val = e.target.value;
        onChange?.(val === '' ? undefined : parseFloat(val)); // Pass undefined if input is cleared
      }}
      placeholder={placeholder}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500 ${
        readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
    />
  </label>
);

interface FormTextFieldProps {
  label: string;
  value?: string;
  onChange: (val: string | undefined) => void; // Allow undefined for clearing input
  placeholder?: string;
}

const FormTextField: React.FC<FormTextFieldProps> = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <span className="text-gray-700 font-medium text-sm">{label}</span>
    <input
      type="text"
      value={value ?? ''} // Use nullish coalescing to show empty string for undefined/null
      onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)} // Pass undefined if input is cleared
      placeholder={placeholder}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </label>
);