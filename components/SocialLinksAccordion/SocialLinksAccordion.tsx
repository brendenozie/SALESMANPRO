import React, { ChangeEvent } from 'react';

export interface SocialLink {
  channel: string;
  url: string;
}

export interface SocialLinksAccordionProps {
  socialLinks: SocialLink[];
  onUpdateLink: (index: number, field: keyof SocialLink, value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
}

export default function SocialLinksAccordion({
  socialLinks,
  onUpdateLink,
  onAddLink,
  onRemoveLink,
}: SocialLinksAccordionProps) {
  const isValid = socialLinks.every(link => link.channel && link.url);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={onAddLink}
        disabled={!isValid}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Social Links</span>
        <span className="text-xl">{socialLinks.length > 0 ? '✅' : '+'}</span>
      </button>

      <div className="p-6 space-y-4">
        {socialLinks.map((link, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
            <input
              placeholder="Channel (e.g. Twitter)"
              value={link.channel}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateLink(idx, 'channel', e.target.value)}
              className="sm:col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              placeholder="URL"
              value={link.url}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateLink(idx, 'url', e.target.value)}
              className="sm:col-span-3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={() => onRemoveLink(idx)}
              className="sm:col-span-1 text-red-500 font-bold text-xl focus:outline-none"
              title="Remove link"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddLink}
          className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
        >
          Add Another Link
        </button>

        <p className="text-sm text-gray-500 mt-2">
          Add links to your social media profiles. You can add multiple links.
        </p>
        <p className="text-sm text-gray-500">
          Example: <code>Twitter</code>, <code>Facebook</code>, <code>Instagram</code>
        </p>
      </div>
    </div>
  );
}
