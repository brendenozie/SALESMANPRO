import React, { ChangeEvent } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

export interface BasicInfoProps {
  name: string;
  slug: string;
  category: string;
  description: string;
  tagline: string;
  domain: string;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const SITE_CATEGORIES = [
  "E-commerce",
  "Service Provider",
  "Booking & Appointments",
  "Portfolio & Personal Branding",
  "Blog & Content",
  "Directory & Listings",
  "Educational & Online Courses",
  "Nonprofit & Community",
  "Restaurant & Food Delivery",
  "Event & Ticketing",
  "Real Estate",
  "Healthcare & Clinics",
  "SaaS & Web Apps",
  "Media & Entertainment",
  "Finance & Legal",
  "Automotive",
  "Travel & Tourism",
  "Fitness & Wellness",
  "Marketplace",
  "Other",
];

export default function BasicInfo({
  name,
  slug,
  category,
  description,
  tagline,
  domain,
  handleChange,
}: BasicInfoProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Basic Info</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Form Field Reusable Block */}
        {[
          { label: 'Name', name: 'name', value: name, placeholder: 'My Awesome App', type: 'text', tooltip: 'Friendly, readable name displayed in headings.' },
          { label: 'Slug', name: 'slug', value: slug, placeholder: 'my-awesome-app', type: 'text', tooltip: 'URL-friendly identifier, lowercase, no spaces.' },
          { label: 'Tagline', name: 'tagline', value: tagline, placeholder: 'Empower Your Workflow', type: 'text', tooltip: 'A brief, catchy description (2–3 words).' },
          { label: 'Domain', name: 'domain', value: domain, placeholder: 'app.example.com', type: 'text', tooltip: 'Your custom domain or subdomain.' },
        ].map(({ label, name, value, placeholder, type, tooltip }) => (
          <div key={name} className="flex flex-col">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {label}
              <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-pointer" title={tooltip} />
            </label>
            <input
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className="mt-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}

        {/* Category Select */}
        <div className="sm:col-span-2 flex flex-col">
          <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Category
            <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-pointer" title="Select a category for your app." />
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={handleChange}
            className="mt-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SITE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="sm:col-span-2 flex flex-col">
          <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Description
            <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-pointer" title="Short description (1–2 sentences)." />
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={description}
            onChange={handleChange}
            placeholder="Write a short description or tagline..."
            className="mt-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
