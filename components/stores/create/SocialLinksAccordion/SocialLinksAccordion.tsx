import React, { useState, ChangeEvent, useEffect } from 'react';
import { PlusIcon, TrashIcon, LinkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { SocialLink } from '@/types/typings';

export interface SocialLinksAccordionProps {
  socialLinks: SocialLink[];
  onUpdateLink: (index: number, field: keyof SocialLink, value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
}

const PLATFORMS = [
  'FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'TIKTOK'
];

// Helper to make screaming headers look human-readable in the UI
const formatPlatformName = (name: string) => {
  return name.charAt(0) + name.slice(1).toLowerCase();
};

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
    <section className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between p-5 text-gray-900 bg-white hover:bg-gray-50/70 focus:outline-none border-b border-gray-100 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-semibold text-gray-900">Social Profiles</h2>
            <p className="text-xs text-gray-500 hidden sm:block">Link your digital ecosystem to your bio</p>
          </div>
        </div>
        <div className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="p-5 space-y-4 bg-gray-50/50">
          {socialLinks.map((link, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm hover:border-gray-300 transition-all duration-200"
            >
              {/* Platform Selector */}
              <div className="w-full sm:w-1/3">
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1 sm:hidden">
                  Platform
                </label>
                <div className="relative">
                  <select
                    value={link.channel}
                    onChange={e => onUpdateLink(idx, 'channel', e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option disabled hidden value="">
                      Select platform
                    </option>
                    {PLATFORMS.map(p => (
                      <option key={p} value={p}>
                        {formatPlatformName(p)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div className="w-full sm:flex-1">
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1 sm:hidden">
                  Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://yourprofile.com/username"
                  value={link.url}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onUpdateLink(idx, 'url', e.target.value)
                  }
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              {/* Delete Action */}
              <div className="flex justify-end pt-2 sm:pt-0 border-t border-gray-100 sm:border-none">
                <button
                  type="button"
                  onClick={() => onRemoveLink(idx)}
                  disabled={socialLinks.length === 1}
                  className="flex items-center gap-1.5 sm:block p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  title="Remove Link"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="text-xs font-medium sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}

          {/* Action Footer Button Group */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={onAddLink}
              disabled={!isValid || socialLinks.length >= PLATFORMS.length}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 font-medium text-sm rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-200"
            >
              <PlusIcon className="w-4 h-4 text-gray-500" />
              Add profile link
            </button>

            {/* Micro-Copy Context */}
            <p className="text-xs text-center text-gray-400 font-normal px-4">
              Supported channels include Facebook, Twitter, Instagram, LinkedIn, YouTube, and TikTok. 
            </p>
          </div>
        </div>
      )}
    </section>
  );
}