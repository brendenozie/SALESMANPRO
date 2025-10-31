'use client';

import React, { ChangeEvent, useCallback } from 'react';
import {
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Stat, Highlight } from '@/types/typings';

export interface StoreProfileInfoProps {
  partnerLogos?: { src: string; alt: string }[] | null | undefined;
  founderName?: string | null | undefined;
  founderQuote?: string | null | undefined;
  sectionSubtitle?: string | null | undefined;
  sectionTitle?: string | null | undefined;
  sectionDescription?: string | null | undefined;

  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleArrayChange: (
    field: 'partnerLogos',
    index: number,
    key: string,
    value: string | number
  ) => void;
  addItem: (field: 'partnerLogos') => void;
  removeItem: (field: 'partnerLogos', index: number) => void;
}

/* ============================
   Memoized Input Field
============================ */
const InputField = React.memo(
  ({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = 'text',
    rows = 1,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    placeholder: string;
    type?: string;
    rows?: number;
  }) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        />
      )}
    </div>
  )
);
InputField.displayName = 'InputField';

/* ============================
   Memoized Array Section
============================ */
const ArraySection = React.memo(
  ({
    title,
    description,
    items,
    field,
    itemFields,
    handleArrayChange,
    addItem,
    removeItem,
    Icon,
  }: {
    title: string;
    description: string;
    items: any[] | null | undefined;
    field: 'partnerLogos';
    itemFields: { key: string; placeholder: string; type: string }[];
    handleArrayChange: StoreProfileInfoProps['handleArrayChange'];
    addItem: StoreProfileInfoProps['addItem'];
    removeItem: StoreProfileInfoProps['removeItem'];
    Icon: React.ElementType;
  }) => {
    const handleInputChange = useCallback(
      (idx: number, key: string, value: string) => {
        handleArrayChange(field, idx, key, value);
      },
      [field, handleArrayChange]
    );

    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon className="w-6 h-6 text-indigo-500" />
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={() => addItem(field)}
            className="flex items-center px-3 py-1.5 border border-indigo-500 text-indigo-600 rounded-full hover:bg-indigo-50 transition duration-150 text-sm font-medium"
          >
            <PlusCircleIcon className="w-5 h-5 mr-1" />
            Add {field.slice(0, -1).charAt(0).toUpperCase() +
              field.slice(0, -1).slice(1)}
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{description}</p>

        <div className="space-y-4">
          {items?.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row gap-3 items-center border border-gray-200"
            >
              <span className="text-gray-500 font-medium w-6 shrink-0">
                {idx + 1}.
              </span>

              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3">
                {itemFields.map(({ key, placeholder, type }) => (
                  <input
                    key={key}
                    type={type}
                    placeholder={placeholder}
                    value={item[key] || ''}
                    onChange={(e) =>
                      handleInputChange(idx, key, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ))}
              </div>

              <button
                onClick={() => removeItem(field, idx)}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-150 shrink-0"
                aria-label={`Remove ${field.slice(0, -1)}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          {!items?.length && (
            <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              No {field} added yet. Click ‘Add{' '}
              {field.slice(0, -1).charAt(0).toUpperCase() +
                field.slice(0, -1).slice(1)}’ to begin.
            </div>
          )}
        </div>
      </div>
    );
  }
);
ArraySection.displayName = 'ArraySection';

/* ============================
   MAIN COMPONENT
============================ */
export default function StoreProfileInfo({
  partnerLogos,
  founderName,
  founderQuote,
  sectionSubtitle,
  sectionTitle,
  sectionDescription,
  handleChange,
  handleArrayChange,
  addItem,
  removeItem,
}: StoreProfileInfoProps) {
  return (
    <section className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Store Profile Settings ⚙️
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Customize your store's public appearance, statistics, and founder
          information.
        </p>
      </header>

      {/* 👤 Founder Info */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl" role="img" aria-label="person">
            👩🏽‍💼
          </span>
          <h3 className="text-xl font-semibold text-gray-800">
            Founder Information
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Add a personal touch to your store's profile with founder details.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Founder Name"
            name="founderName"
            value={founderName ?? ''}
            onChange={handleChange}
            placeholder="e.g., Coach Timon Bright"
          />

          <InputField
            label="Founder Quote"
            name="founderQuote"
            value={founderQuote ?? ''}
            onChange={handleChange}
            placeholder="e.g., A nurturing space for beautiful souls committed to flourishing."
            type="textarea"
            rows={2}
          />
        </div>
      </div>

      {/* ✍️ Section Marketing Text */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl" role="img" aria-label="pen">
            ✍️
          </span>
          <h3 className="text-xl font-semibold text-gray-800">
            Key Section Text
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Customize the subtitle, main title, and descriptive paragraph for your
          key marketing section.
        </p>

        <div className="space-y-6">
          <InputField
            label="Subtitle (e.g., Our Global Impact)"
            name="sectionSubtitle"
            value={sectionSubtitle ?? ''}
            onChange={handleChange}
            placeholder="Enter a brief, punchy subtitle here"
          />
          <InputField
            label="Main Title"
            name="sectionTitle"
            value={sectionTitle ?? ''}
            onChange={handleChange}
            placeholder="e.g., Proven Expertise, Verified Results"
          />
          <InputField
            label="Descriptive Paragraph"
            name="sectionDescription"
            value={sectionDescription ?? ''}
            onChange={handleChange}
            placeholder="Write a short paragraph summarizing your impact."
            type="textarea"
            rows={3}
          />
        </div>
      </div>

      {/* 🌐 Partner Logos */}
      <ArraySection
        title="Partner & Client Logos"
        description="Display logos of companies or clients you’ve worked with. Use full URLs for the image source."
        items={partnerLogos}
        field="partnerLogos"
        itemFields={[
          { key: 'src', placeholder: 'Image URL (e.g., https://...)', type: 'url' },
          { key: 'alt', placeholder: 'Alt text for accessibility', type: 'text' },
        ]}
        handleArrayChange={handleArrayChange}
        addItem={addItem}
        removeItem={removeItem}
        Icon={() => (
          <span className="text-2xl" role="img" aria-label="globe">
            🌐
          </span>
        )}
      />
    </section>
  );
}
