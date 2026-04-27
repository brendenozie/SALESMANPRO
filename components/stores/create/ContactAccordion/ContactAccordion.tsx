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

/** Normalize to E.164 (+2547XXXXXXXX) */
function normalizeWhatsAppNumber(input: string): string {
  if (!input) return '';

  let digits = input.replace(/\D/g, '');

  // Already valid: 2547XXXXXXXX
  if (digits.startsWith(COUNTRY_CODE) && digits.length === 12) {
    return `+${digits}`;
  }

  // 07XXXXXXXX → 2547XXXXXXXX
  if (digits.startsWith('0') && digits.length === 10) {
    return `+${COUNTRY_CODE}${digits.slice(1)}`;
  }

  // 7XXXXXXXX → 2547XXXXXXXX
  if (digits.startsWith('7') && digits.length === 9) {
    return `+${COUNTRY_CODE}${digits}`;
  }

  return '';
}

/** Format nicely while typing (not final value) */
function formatWhileTyping(input: string): string {
  let digits = input.replace(/\D/g, '');

  if (digits.startsWith(COUNTRY_CODE)) {
    digits = digits.slice(COUNTRY_CODE.length);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Limit to Kenyan mobile length
  digits = digits.slice(0, 9);

  if (!digits) return '';

  // Display: +254 7XX XXX XXX
  return `+254 ${digits.replace(
    /(\d{1})(\d{0,2})(\d{0,3})(\d{0,3})/,
    (_, a, b, c, d) => [a + b, c, d].filter(Boolean).join(' ')
  )}`;
}

export const isValidWhatsAppNumber = (phone: string) =>
  /^\+2547\d{8}$/.test(phone);

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

    // Show formatted version while typing
    setDisplayPhone(formatWhileTyping(raw));

    const normalized = normalizeWhatsAppNumber(raw);

    // Only save normalized when valid
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
    <section className="max-w-3xl mx-auto overflow-hidden">
      <button
        onClick={() => setExpanded(x => !x)}
        className="w-full flex justify-between items-center bg-indigo-100 px-6 py-4"
      >
        <span className="text-lg font-medium text-indigo-700">
          Contact & Opening Hours
        </span>
        <span className="text-indigo-700 text-2xl">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="px-6 py-8 space-y-8">
          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Email Address
              </span>
              <input
                type="email"
                name="contactEmail"
                value={contactEmail}
                onChange={onChange}
                placeholder="you@domain.com"
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Phone Number (WhatsApp)
              </span>
              <input
                type="tel"
                value={displayPhone}
                onChange={handlePhoneChange}
                placeholder="+254 7XX XXX XXX"
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              />

              {contactPhone && (
                <div className="mt-2 text-sm">
                  {!isValidWhatsAppNumber(contactPhone) ? (
                    <span className="text-amber-600">
                      Enter a valid Kenyan WhatsApp number
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">WhatsApp ready:</span>
                      <a
                        href={`https://wa.me/${contactPhone.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 font-medium hover:underline"
                      >
                        {contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </label>
          </div>

          {/* Opening Hours */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
              Opening Hours
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {weekdays.map(({ key, label }) => {
                const day = openingHours?.[key] || { open: '', close: '' };
                const isClosed = !day.open && !day.close;

                return (
                  <div
                    key={key}
                    className="bg-white p-4 rounded-xl border border-indigo-200 flex flex-col items-center space-y-3"
                  >
                    <span className="font-medium text-gray-600">{label}</span>

                    <button
                      type="button"
                      onClick={() => onToggleDay(key)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isClosed
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isClosed ? 'Closed' : 'Open'}
                    </button>

                    {!isClosed && (
                      <div className="w-full space-y-2">
                        <input
                          type="time"
                          name={`openingHours.${key}.open`}
                          value={day.open}
                          onChange={onChange}
                          className="w-full px-2 py-1 border rounded"
                        />
                        <input
                          type="time"
                          name={`openingHours.${key}.close`}
                          value={day.close}
                          onChange={onChange}
                          className="w-full px-2 py-1 border rounded"
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