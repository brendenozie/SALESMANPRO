import React, { useState, ChangeEvent, useEffect } from 'react';
import { PlusIcon, TrashIcon, LinkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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

const PLATFORMS = [
  'FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'TIKTOK'
];

export default function SocialLinksAccordion({
  socialLinks,
  onUpdateLink,
  onAddLink,
  onRemoveLink,
}: SocialLinksAccordionProps) {
  const [open, setOpen] = useState(true);
  const isValid = socialLinks.every(l => l.channel && l.url);

  useEffect(() => {
    if (socialLinks.length === 0) onAddLink();
  }, [socialLinks, onAddLink]);

  return (
    <section className="w-full max-w-xl mx-auto">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 bg-indigo-600 text-white rounded-t-lg focus:outline-none"
        onClick={() => setOpen(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          <LinkIcon className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Social Links</h2>
        </div>
        <ChevronDownIcon
          className={`w-6 h-6 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="bg-white rounded-b-lg shadow-inner p-4 space-y-4">
          {socialLinks.map((link, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-gray-50 p-4 rounded-lg"
            >
              {/* Platform */}
              <select
                value={link.channel}
                onChange={e => onUpdateLink(idx, 'channel', e.target.value)}
                className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option disabled hidden value="">
                  Select platform
                </option>
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* URL */}
              <input
                type="url"
                placeholder="https://"
                value={link.url}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onUpdateLink(idx, 'url', e.target.value)
                }
                className="w-full sm:flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
              />

              {/* Remove */}
              <button
                onClick={() => onRemoveLink(idx)}
                disabled={socialLinks.length === 1}
                className="self-start sm:self-auto p-2 text-red-500 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* Add Link */}
          <button
            onClick={onAddLink}
            disabled={!isValid || socialLinks.length >= PLATFORMS.length}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition disabled:opacity-50"
          >
            <PlusIcon className="w-5 h-5" />
            Add Another Link
          </button>

          {/* Footer Guidance */}
          <p className="text-sm text-gray-500">
            Provide URLs to your social media profiles. Supported platforms:{' '}
            {PLATFORMS.map((p, i) => (
              <span key={p} className="italic">
                {p}{i < PLATFORMS.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
      )}
    </section>
  );
}
