import React, { useEffect, useState } from 'react';
import {
  CalendarIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface BookingSlotType {
  date: string;
  time: string;
  capacity: number;
}

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
  bookingSlots?: BookingSlotType[];
}

interface Props {
  formData: ServiceFormData;
  setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
}

export const BookingSlot: React.FC<Props> = ({ formData, setFormData }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!formData.bookingSlots || formData.bookingSlots.length === 0) {
      setFormData((prev) => ({
        ...prev,
        bookingSlots: [{ date: '', time: '', capacity: 1 }],
      }));
    }
  }, [formData.bookingSlots, setFormData]);

  const handleAddBookingSlot = () => {
    setFormData((prev) => ({
      ...prev,
      bookingSlots: [...(prev.bookingSlots || []), { date: '', time: '', capacity: 1 }],
    }));
  };

  const handleUpdateBookingSlot = (
    index: number,
    field: keyof BookingSlotType,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedSlots = [...(prev.bookingSlots || [])];
      updatedSlots[index] = {
        ...updatedSlots[index],
        [field]: field === 'capacity' ? Number(value) : value,
      };
      return { ...prev, bookingSlots: updatedSlots };
    });
  };

  const handleRemoveBookingSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bookingSlots: (prev.bookingSlots || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white"
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Booking Details & Slots</h3>
        </div>
        <span className="flex items-center">
          {open ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </span>
      </button>

      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-2xl font-semibold mb-4 text-gray-800">Booking Slots</h4>

            <div className="space-y-4">
              {(formData.bookingSlots || []).map((slot, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 relative"
                >
                  <h5 className="text-md font-semibold text-gray-700 md:col-span-4">
                    Slot #{index + 1}
                  </h5>

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
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={slot.date}
                      onChange={(e) =>
                        handleUpdateBookingSlot(index, 'date', e.target.value)
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-gray-600 text-sm">Time</span>
                    <input
                      type="time"
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={slot.time}
                      onChange={(e) =>
                        handleUpdateBookingSlot(index, 'time', e.target.value)
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-gray-600 text-sm">Capacity</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={slot.capacity}
                      onChange={(e) =>
                        handleUpdateBookingSlot(index, 'capacity', Number(e.target.value))
                      }
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleAddBookingSlot}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Booking Slot
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};
