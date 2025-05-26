import React, { ChangeEvent } from 'react';

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
    <div className="max-w-3xl mx-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
            <span title="Friendly, readable name displayed in headings." className="ml-1 cursor-help">?</span>
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            required
            placeholder="My Awesome App"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
            <span title="URL-friendly identifier, lowercase, no spaces." className="ml-1 cursor-help">?</span>
          </label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={handleChange}
            placeholder="my-awesome-app"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category */}
        <div className="sm:col-span-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
            <span title="Select a category for your app." className="ml-1 cursor-help">?</span>
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SITE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
            <span title="Short description (1–2 sentences)." className="ml-1 cursor-help">?</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={description}
            onChange={handleChange}
            placeholder="Write a short description or tagline..."
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Tagline */}
        <div className="sm:col-span-2">
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
            Tagline
            <span title="A brief, catchy description (2–3 words)." className="ml-1 cursor-help">?</span>
          </label>
          <input
            id="tagline"
            name="tagline"
            value={tagline}
            onChange={handleChange}
            placeholder="Empower Your Workflow"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Domain */}
        <div className="sm:col-span-2">
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
            Domain
            <span title="Your custom domain or subdomain." className="ml-1 cursor-help">?</span>
          </label>
          <input
            id="domain"
            name="domain"
            value={domain}
            onChange={handleChange}
            placeholder="app.example.com"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
