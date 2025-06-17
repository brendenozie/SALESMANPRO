import React, { useEffect, useState } from 'react';
import { Award } from '../../../../types/typings';
import {
  TrophyIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface Props {
  awards: Award[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Award, value: any) => void;
  onRemove: (index: number) => void;
}

const isFilled = (award: Award) => award.name.trim() && award.iconUrl.trim();

export const BookingSlot: React.FC<Props> = ({ awards, onAdd, onUpdate, onRemove }) => {
  const [open, setOpen] = useState(true);
  const canAdd = awards.length === 0 || isFilled(awards[awards.length - 1]);


      const handleAddPricingTier = () => {
          setFormData({
              ...formData,
              pricingTiers: [...(formData.pricingTiers || []), { name: '', price: 0, features: [] }],
          });
      };
  
      const handleUpdatePricingTier = (index: number, field: string, value: string | number) => {
          const updatedTiers = [...(formData.pricingTiers || [])];
          if (field === "features") {
               updatedTiers[index] = { ...updatedTiers[index], [field]: (value as string).split(',').map(f => f.trim()).filter(f => f !== '') };
          } else {
              updatedTiers[index] = { ...updatedTiers[index], [field]: value };
          }
          setFormData({ ...formData, pricingTiers: updatedTiers });
      };
  
      const handleRemovePricingTier = (index: number) => {
          setFormData({
              ...formData,
              pricingTiers: (formData.pricingTiers || []).filter((_, i) => i !== index),
          });
      };

  useEffect(() => {
    if (!awards.length) onAdd();
  }, [awards, onAdd]);

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-300 text-white"
      >
        <div className="flex items-center space-x-3">
          <TrophyIcon className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Awards</h3>
        </div>
        <span className="flex items-center">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6">

          <div className="space-y-6">
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
                                                  <label className="block">
                                                      <span className="text-gray-700 font-medium text-sm">General Service Schedule (e.g., "Mon-Fri, 9am-5pm")</span>
                                                      <input
                                                          type="text"
                                                          className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                          value={formData.serviceSchedule || ""}
                                                          onChange={(e) => setFormData({ ...formData, serviceSchedule: e.target.value })}
                                                          placeholder="Mon-Fri, 9am-5pm"
                                                      />
                                                  </label>
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











          {/* Awards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {awards.map((award, idx) => (
              <div key={idx} className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 sm:p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-yellow-800">Award {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="text-red-500 hover:text-red-600 focus:outline-none"
                    aria-label="Remove award"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller 2023"
                    value={award.name}
                    onChange={e => onUpdate(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
                  />

                  {/* Icon URL */}
                  <label className="block text-sm font-medium text-gray-700">Icon URL</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder="https://cdn.example.com/icon.png"
                      value={award.iconUrl}
                      onChange={e => onUpdate(idx, 'iconUrl', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
                    />
                    {award.iconUrl && (
                      <img
                        src={award.iconUrl}
                        alt="icon preview"
                        className="h-12 w-12 object-contain rounded self-start sm:self-auto"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <button
              type="button"
              onClick={onAdd}
              disabled={!canAdd}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Add Award</span>
            </button>
            <span className="text-sm text-gray-600 italic text-center sm:text-left">
              🏆 Tip: Use icons from <code className="bg-gray-100 px-1 rounded">https://icons8.com/icons</code>
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
