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

const deliveryMethods = ['In-person', 'Online', 'Hybrid'];

export const ServiceSpecifics: React.FC<Props> = ({ formData, setFormData }) => {
  const [open, setOpen] = useState(true);

  // Initialize bookingSlots with a default slot if empty
  useEffect(() => {
    if (!formData.bookingSlots || formData.bookingSlots.length === 0) {
      setFormData((prev) => ({
        ...prev,
        bookingSlots: [{ date: '', time: '', capacity: 1 }],
      }));
    }
  }, [formData.bookingSlots, setFormData]);

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white"
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Service Specifics</h3>
        </div>
        <span className="flex items-center">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-2xl font-semibold mb-4 text-gray-800">Service Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormNumberField
                label="Quantity (e.g., number of seats)"
                placeholder="1"
                value={formData.quantity}
                onChange={(val) => setFormData({ ...formData, quantity: val })}
              />

              <FormNumberField
                label="Hourly Rate ($)"
                placeholder="0.00"
                step={0.01}
                value={formData.hourlyRate}
                onChange={(val) => setFormData({ ...formData, hourlyRate: val })}
              />

              <FormNumberField
                label="Minimum Hours"
                placeholder="1"
                step={1}
                value={formData.minimumHours}
                onChange={(val) => setFormData({ ...formData, minimumHours: val })}
              />

              <FormTextField
                label="Min. Notice Period"
                placeholder="24 hours"
                value={formData.minNoticePeriod}
                onChange={(val) => setFormData({ ...formData, minNoticePeriod: val })}
              />

              <FormTextField
                label="Max Booking Ahead"
                placeholder="3 months"
                value={formData.maxBookingAhead}
                onChange={(val) => setFormData({ ...formData, maxBookingAhead: val })}
              />

              <FormNumberField
                label="Total Capacity"
                placeholder="100"
                step={1}
                value={formData.totalCapacity}
                onChange={(val) => setFormData({ ...formData, totalCapacity: val })}
              />

              <div>
                <label className="text-gray-700 font-medium text-sm block mb-1">Delivery Method</label>
                <select
                  className="block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.deliveryMethod || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryMethod: e.target.value || undefined,
                    })
                  }
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
                label="Fulfillment Status"
                placeholder="e.g., PENDING_CONFIRMATION"
                value={formData.fulfillmentStatus}
                onChange={(val) => setFormData({ ...formData, fulfillmentStatus: val })}
              />

              <FormNumberField
                label="Provider Rating (Read-only)"
                placeholder="N/A"
                value={formData.providerRating}
                readOnly
              />
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

/* ----------------------- Reusable Field Components ----------------------- */

interface FormNumberFieldProps {
  label: string;
  value?: number;
  onChange?: (val: number) => void;
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
      value={value ?? ''}
      onChange={(e) => !readOnly && onChange?.(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500 ${
        readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
    />
  </label>
);

interface FormTextFieldProps {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const FormTextField: React.FC<FormTextFieldProps> = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <span className="text-gray-700 font-medium text-sm">{label}</span>
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
    />
  </label>
);


// import React, { useEffect, useState } from 'react';
// import {
//   CalendarIcon,
//   PlusCircleIcon,
//   TrashIcon,
//   ChevronUpIcon,
//   ChevronDownIcon,
//   XMarkIcon,
// } from '@heroicons/react/24/outline';

// interface BookingSlotType {
//   date: string;
//   time: string;
//   capacity: number;
// }

// interface ServiceFormData {
//   quantity?: number;
//   serviceSchedule?: string;
//   hourlyRate?: number;
//   minimumHours?: number;
//   minNoticePeriod?: string;
//   maxBookingAhead?: string;
//   totalCapacity?: number;
//   deliveryMethod?: string;
//   fulfillmentStatus?: string;
//   providerRating?: number;
//   bookingSlots?: BookingSlotType[];
// }

// interface Props {
//   formData: ServiceFormData;
//   setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
// }

// const deliveryMethods = ['In-person', 'Online', 'Hybrid'];

// export const ServiceSpecifics: React.FC<Props> = ({ formData, setFormData }) => {
//   const [open, setOpen] = useState(true);

//   useEffect(() => {
//     if (!formData.bookingSlots || formData.bookingSlots.length === 0) {
//       setFormData((prev) => ({
//         ...prev,
//         bookingSlots: [{ date: '', time: '', capacity: 1 }],
//       }));
//     }
//   }, [formData.bookingSlots, setFormData]);

//   const handleSlotChange = (index: number, field: keyof BookingSlotType, value: string | number) => {
//     const updatedSlots = [...(formData.bookingSlots || [])];
//     updatedSlots[index] = { ...updatedSlots[index], [field]: field === 'capacity' ? Number(value) : value };
//     setFormData({ ...formData, bookingSlots: updatedSlots });
//   };

//   const handleAddSlot = () => {
//     setFormData((prev) => ({
//       ...prev,
//       bookingSlots: [...(prev.bookingSlots || []), { date: '', time: '', capacity: 1 }],
//     }));
//   };

//   const handleRemoveSlot = (index: number) => {
//     const filtered = (formData.bookingSlots || []).filter((_, i) => i !== index);
//     setFormData({ ...formData, bookingSlots: filtered });
//   };

//   return (
//     <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
//       {/* Header */}
//       <button
//         type="button"
//         onClick={() => setOpen((prev) => !prev)}
//         className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white"
//       >
//         <div className="flex items-center space-x-3">
//           <CalendarIcon className="h-6 w-6" />
//           <h3 className="text-lg font-semibold">Service Specifics</h3>
//         </div>
//         <span className="flex items-center">
//           {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
//         </span>
//       </button>

//       {open && (
//         <div className="px-4 sm:px-6 py-6 space-y-8">
//           {/* Service Fields */}
//           <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//             <h4 className="text-2xl font-semibold mb-4 text-gray-800">Service Details</h4>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <FormNumberField label="Quantity" value={formData.quantity} onChange={(val) => setFormData({ ...formData, quantity: val })} placeholder="1" />
//               <FormNumberField label="Hourly Rate ($)" step={0.01} value={formData.hourlyRate} onChange={(val) => setFormData({ ...formData, hourlyRate: val })} placeholder="0.00" />
//               <FormNumberField label="Minimum Hours" value={formData.minimumHours} onChange={(val) => setFormData({ ...formData, minimumHours: val })} placeholder="1" />
//               <FormTextField label="Min. Notice Period" value={formData.minNoticePeriod} onChange={(val) => setFormData({ ...formData, minNoticePeriod: val })} placeholder="24 hours" />
//               <FormTextField label="Max Booking Ahead" value={formData.maxBookingAhead} onChange={(val) => setFormData({ ...formData, maxBookingAhead: val })} placeholder="3 months" />
//               <FormNumberField label="Total Capacity" value={formData.totalCapacity} onChange={(val) => setFormData({ ...formData, totalCapacity: val })} placeholder="100" />
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
//                 <select
//                   className="block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
//                   value={formData.deliveryMethod || ''}
//                   onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
//                 >
//                   <option value="">Select Method</option>
//                   {deliveryMethods.map((method) => (
//                     <option key={method} value={method}>{method}</option>
//                   ))}
//                 </select>
//               </div>
//               <FormTextField label="Fulfillment Status" value={formData.fulfillmentStatus} onChange={(val) => setFormData({ ...formData, fulfillmentStatus: val })} placeholder="e.g., CONFIRMED" />
//               <FormNumberField label="Provider Rating" value={formData.providerRating} readOnly />
//             </div>
//           </section>

//           {/* Booking Slots */}
//           <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex justify-between items-center mb-4">
//               <h4 className="text-2xl font-semibold text-gray-800">Booking Slots</h4>
//               <button
//                 type="button"
//                 onClick={handleAddSlot}
//                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
//               >
//                 <PlusCircleIcon className="w-5 h-5 mr-2" />
//                 Add Slot
//               </button>
//             </div>

//             <div className="space-y-4">
//               {(formData.bookingSlots || []).map((slot, index) => (
//                 <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4 relative grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <button
//                     onClick={() => handleRemoveSlot(index)}
//                     className="absolute top-2 right-2 text-red-500 hover:text-red-700"
//                     aria-label="Remove booking slot"
//                   >
//                     <XMarkIcon className="w-5 h-5" />
//                   </button>

//                   <label className="block">
//                     <span className="text-gray-700 text-sm">Date</span>
//                     <input
//                       type="date"
//                       className="mt-1 block w-full rounded-lg border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                       value={slot.date}
//                       onChange={(e) => handleSlotChange(index, 'date', e.target.value)}
//                     />
//                   </label>

//                   <label className="block">
//                     <span className="text-gray-700 text-sm">Time</span>
//                     <input
//                       type="time"
//                       className="mt-1 block w-full rounded-lg border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                       value={slot.time}
//                       onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
//                     />
//                   </label>

//                   <label className="block">
//                     <span className="text-gray-700 text-sm">Capacity</span>
//                     <input
//                       type="number"
//                       min={1}
//                       className="mt-1 block w-full rounded-lg border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500"
//                       value={slot.capacity}
//                       onChange={(e) => handleSlotChange(index, 'capacity', e.target.value)}
//                     />
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>
//       )}
//     </section>
//   );
// };

// /* ------------------ Reusable Input Components ------------------ */

// interface FormNumberFieldProps {
//   label: string;
//   value?: number;
//   onChange?: (val: number) => void;
//   placeholder?: string;
//   step?: number;
//   readOnly?: boolean;
// }

// const FormNumberField: React.FC<FormNumberFieldProps> = ({
//   label,
//   value,
//   onChange,
//   placeholder,
//   step = 1,
//   readOnly = false,
// }) => (
//   <label className="block">
//     <span className="text-gray-700 font-medium text-sm">{label}</span>
//     <input
//       type="number"
//       step={step}
//       value={value ?? ''}
//       readOnly={readOnly}
//       onChange={(e) => !readOnly && onChange?.(parseFloat(e.target.value) || 0)}
//       placeholder={placeholder}
//       className={`mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500 ${
//         readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
//       }`}
//     />
//   </label>
// );

// interface FormTextFieldProps {
//   label: string;
//   value?: string;
//   onChange: (val: string) => void;
//   placeholder?: string;
// }

// const FormTextField: React.FC<FormTextFieldProps> = ({ label, value, onChange, placeholder }) => (
//   <label className="block">
//     <span className="text-gray-700 font-medium text-sm">{label}</span>
//     <input
//       type="text"
//       value={value ?? ''}
//       onChange={(e) => onChange(e.target.value)}
//       placeholder={placeholder}
//       className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
//     />
//   </label>
// );
