import React, { useState, ChangeEvent } from 'react';
import { OpeningHours } from '../../../../types/typings';

const weekdays = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

/* ================================
    WhatsApp helpers (Kenya)
================================ */

const COUNTRY_CODE = '254';

/** 
 * Isolate the true subscriber digits and normalize to E.164 (+254XXXXXXXXX)
 * Supports both traditional 7XXXXXXXX and newer 1XXXXXXXX Kenyan prefixes.
 */
function normalizeWhatsAppNumber(input: string): string {
  if (!input) return '';

  let digits = input.replace(/\D/g, '');

  // Look past any stacked combinations of 254 and 0 to extract the 9-digit subscriber window
  const match = digits.match(/^(?:254|0)+([71]\d*)$/) || digits.match(/^([71]\d*)$/);

  if (match && match[1].length === 9) {
    return `+254${match[1]}`;
  }

  return '';
}

/** Format beautifully while typing without swallowing keystrokes or duplicating 254 */
function formatWhileTyping(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (!digits) return '';

  // Match leading combinations of 254/0 followed by a valid subscriber start (7 or 1)
  const match = digits.match(/^(?:254|0)+([71]\d*)$/) || digits.match(/^([71]\d*)$/);
  
  let subscriber = '';
  if (match) {
    subscriber = match[1];
  } else {
    // If they haven't typed a 7 or 1 yet (e.g. typing '2', '25', or '0' manually),
    // preserve their progress instead of wiping the field clean
    if (digits.startsWith('254')) {
      subscriber = digits.slice(3);
    } else if (digits.startsWith('0')) {
      subscriber = digits.slice(1);
    } else {
      subscriber = digits;
    }
  }

  // Limit to Kenyan subscriber body length (9 digits)
  subscriber = subscriber.slice(0, 9);

  // Avoid text jump glitches if they just cleared down to a single zero prefix
  if (!subscriber && digits) {
    if (input.endsWith('0')) return '+254 0';
    return '+254 ';
  }

  // Display Format Mask: +254 7XX XXX XXX or +254 1XX XXX XXX
  return `+254 ${subscriber.replace(
    /(\d{1})(\d{0,2})(\d{0,3})(\d{0,3})/,
    (_, a, b, c, d) => [a + b, c, d].filter(Boolean).join(' ')
  )}`;
}

// Accepts valid +2547XXXXXXXX and +2541XXXXXXXX formats
export const isValidWhatsAppNumber = (phone: string) =>
  /^\+254[71]\d{8}$/.test(phone);

/* ================================
    Props
================================ */

interface ContactAccordionProps {
  openingHours: OpeningHours | null;
  contactEmail: string;
  contactPhone: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleDay: (dayKey: string) => void;
}

/* ================================
    Component
================================ */

export default function ContactAccordion({
  openingHours,
  contactEmail,
  contactPhone,
  onChange,
  onToggleDay,
}: ContactAccordionProps) {
  const [expanded, setExpanded] = useState(true);
  const [displayPhone, setDisplayPhone] = useState(
    contactPhone ? formatWhileTyping(contactPhone) : ''
  );

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // 1. Instantly compute the visual mask presentation
    const formatted = formatWhileTyping(raw);
    setDisplayPhone(formatted);

    // 2. Safely normalize to standard clean E.164 string format
    const normalized = normalizeWhatsAppNumber(raw);

    // 3. Forward state up to the parent form context handler
    onChange({
      ...e,
      target: {
        ...e.target,
        name: 'contactPhone',
        value: normalized || '',
      },
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <section className="max-w-3xl mx-auto overflow-hidden border border-gray-200 rounded-2xl shadow-xs bg-white">
      <button
        type="button"
        onClick={() => setExpanded(x => !x)}
        className="w-full flex justify-between items-center bg-indigo-50 px-6 py-5 transition-colors hover:bg-indigo-100/70"
      >
        <span className="text-base font-semibold text-indigo-900 tracking-wide">
          Contact Details & Opening Hours
        </span>
        <span className="text-indigo-600 text-xl font-bold">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="px-6 py-8 space-y-8">
          {/* Contact Info Grid Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Email Address
              </span>
              <input
                type="email"
                name="contactEmail"
                value={contactEmail}
                onChange={onChange}
                placeholder="you@domain.com"
                className="mt-2 block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-hidden transition-all text-sm"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Phone Number (WhatsApp)
              </span>
              <input
                type="tel"
                value={displayPhone}
                onChange={handlePhoneChange}
                placeholder="+254 7XX XXX XXX"
                className="mt-2 block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-hidden transition-all text-sm"
              />

              {contactPhone && (
                <div className="mt-3 text-xs font-medium">
                  {!isValidWhatsAppNumber(contactPhone) ? (
                    <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
                      Enter a valid mobile number
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-200 inline-block">
                      <span>WhatsApp Active:</span>
                      <a
                        href={`https://wa.me/${contactPhone.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 font-bold hover:underline"
                      >
                        {contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </label>
          </div>

          {/* Opening Hours Panel */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
            <h3 className="text-sm font-bold tracking-wider text-slate-700 uppercase mb-4">
              Weekly Business Timelines
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {weekdays.map(({ key, label }) => {
                const day = openingHours?.[key] || { open: '', close: '' };
                const isClosed = !day.open && !day.close;

                return (
                  <div
                    key={key}
                    className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center space-y-3 shadow-xs"
                  >
                    <span className="text-xs font-bold text-gray-600">{label}</span>

                    <button
                      type="button"
                      onClick={() => onToggleDay(key)}
                      className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${
                        isClosed
                          ? 'bg-gray-100 text-gray-500 border border-gray-200'
                          : 'bg-indigo-600 text-white shadow-xs'
                      }`}
                    >
                      {isClosed ? 'Closed' : 'Open'}
                    </button>

                    {!isClosed && (
                      <div className="w-full space-y-2 pt-1">
                        <input
                          type="time"
                          name={`openingHours.${key}.open`}
                          value={day.open}
                          onChange={onChange}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-hidden"
                        />
                        <input
                          type="time"
                          name={`openingHours.${key}.close`}
                          value={day.close}
                          onChange={onChange}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-hidden"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// import React, { useState, ChangeEvent } from 'react';
// import { OpeningHours } from '../../../../types/typings';

// const weekdays = [
//   { key: 'mon', label: 'Monday' },
//   { key: 'tue', label: 'Tuesday' },
//   { key: 'wed', label: 'Wednesday' },
//   { key: 'thu', label: 'Thursday' },
//   { key: 'fri', label: 'Friday' },
//   { key: 'sat', label: 'Saturday' },
//   { key: 'sun', label: 'Sunday' },
// ];

// /* ================================
//    WhatsApp helpers (Kenya)
// ================================ */

// const COUNTRY_CODE = '254';

// /** Normalize to E.164 (+2547XXXXXXXX) */
// function normalizeWhatsAppNumber(input: string): string {
//   if (!input) return '';

//   let digits = input.replace(/\D/g, '');

//   // Already valid: 2547XXXXXXXX
//   if (digits.startsWith(COUNTRY_CODE) && digits.length === 12) {
//     return `+${digits}`;
//   }

//   // 07XXXXXXXX → 2547XXXXXXXX
//   if (digits.startsWith('0') && digits.length === 10) {
//     return `+${COUNTRY_CODE}${digits.slice(1)}`;
//   }

//   // 7XXXXXXXX → 2547XXXXXXXX
//   if (digits.startsWith('7') && digits.length === 9) {
//     return `+${COUNTRY_CODE}${digits}`;
//   }

//   return '';
// }

// /** Format nicely while typing (not final value) */
// function formatWhileTyping(input: string): string {
//   let digits = input.replace(/\D/g, '');

//   if (digits.startsWith(COUNTRY_CODE)) {
//     digits = digits.slice(COUNTRY_CODE.length);
//   } else if (digits.startsWith('0')) {
//     digits = digits.slice(1);
//   }

//   // Limit to Kenyan mobile length
//   digits = digits.slice(0, 9);

//   if (!digits) return '';

//   // Display: +254 7XX XXX XXX
//   return `+254 ${digits.replace(
//     /(\d{1})(\d{0,2})(\d{0,3})(\d{0,3})/,
//     (_, a, b, c, d) => [a + b, c, d].filter(Boolean).join(' ')
//   )}`;
// }

// export const isValidWhatsAppNumber = (phone: string) =>
//   /^\+2547\d{8}$/.test(phone);

// /* ================================
//    Props
// ================================ */

// interface ContactAccordionProps {
//   openingHours: OpeningHours | null;
//   contactEmail: string;
//   contactPhone: string | null;
//   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
//   onToggleDay: (dayKey: string) => void;
// }

// /* ================================
//    Component
// ================================ */

// export default function ContactAccordion({
//   openingHours,
//   contactEmail,
//   contactPhone,
//   onChange,
//   onToggleDay,
// }: ContactAccordionProps) {
//   const [expanded, setExpanded] = useState(true);
//   const [displayPhone, setDisplayPhone] = useState(
//     contactPhone ? formatWhileTyping(contactPhone) : ''
//   );

//   const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const raw = e.target.value;

//     // Show formatted version while typing
//     setDisplayPhone(formatWhileTyping(raw));

//     const normalized = normalizeWhatsAppNumber(raw);

//     // Only save normalized when valid
//     onChange({
//       ...e,
//       target: {
//         ...e.target,
//         name: 'contactPhone',
//         value: normalized || '',
//       },
//     } as ChangeEvent<HTMLInputElement>);
//   };

//   return (
//     <section className="max-w-3xl mx-auto overflow-hidden">
//       <button
//         onClick={() => setExpanded(x => !x)}
//         className="w-full flex justify-between items-center bg-indigo-100 px-6 py-4"
//       >
//         <span className="text-lg font-medium text-indigo-700">
//           Contact & Opening Hours
//         </span>
//         <span className="text-indigo-700 text-2xl">
//           {expanded ? '−' : '+'}
//         </span>
//       </button>

//       {expanded && (
//         <div className="px-6 py-8 space-y-8">
//           {/* Contact Info */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <label className="block">
//               <span className="text-sm font-medium text-gray-700">
//                 Email Address
//               </span>
//               <input
//                 type="email"
//                 name="contactEmail"
//                 value={contactEmail}
//                 onChange={onChange}
//                 placeholder="you@domain.com"
//                 className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//               />
//             </label>

//             <label className="block">
//               <span className="text-sm font-medium text-gray-700">
//                 Phone Number (WhatsApp)
//               </span>
//               <input
//                 type="tel"
//                 value={displayPhone}
//                 onChange={handlePhoneChange}
//                 placeholder="+254 7XX XXX XXX"
//                 className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//               />

//               {contactPhone && (
//                 <div className="mt-2 text-sm">
//                   {!isValidWhatsAppNumber(contactPhone) ? (
//                     <span className="text-amber-600">
//                       Enter a valid WhatsApp number
//                     </span>
//                   ) : (
//                     <div className="flex items-center gap-2">
//                       <span className="text-green-600">WhatsApp ready:</span>
//                       <a
//                         href={`https://wa.me/${contactPhone.replace('+', '')}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-green-700 font-medium hover:underline"
//                       >
//                         {contactPhone}
//                       </a>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </label>
//           </div>

//           {/* Opening Hours */}
//           <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
//             <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
//               Opening Hours
//             </h3>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {weekdays.map(({ key, label }) => {
//                 const day = openingHours?.[key] || { open: '', close: '' };
//                 const isClosed = !day.open && !day.close;

//                 return (
//                   <div
//                     key={key}
//                     className="bg-white p-4 rounded-xl border border-indigo-200 flex flex-col items-center space-y-3"
//                   >
//                     <span className="font-medium text-gray-600">{label}</span>

//                     <button
//                       type="button"
//                       onClick={() => onToggleDay(key)}
//                       className={`px-3 py-1 rounded-full text-sm ${
//                         isClosed
//                           ? 'bg-gray-200 text-gray-600'
//                           : 'bg-indigo-600 text-white'
//                       }`}
//                     >
//                       {isClosed ? 'Closed' : 'Open'}
//                     </button>

//                     {!isClosed && (
//                       <div className="w-full space-y-2">
//                         <input
//                           type="time"
//                           name={`openingHours.${key}.open`}
//                           value={day.open}
//                           onChange={onChange}
//                           className="w-full px-2 py-1 border rounded"
//                         />
//                         <input
//                           type="time"
//                           name={`openingHours.${key}.close`}
//                           value={day.close}
//                           onChange={onChange}
//                           className="w-full px-2 py-1 border rounded"
//                         />
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }