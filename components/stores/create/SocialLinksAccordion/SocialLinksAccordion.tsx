import React, { ChangeEvent, useEffect } from 'react';
import { PlusIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';

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

const predefinedPlatforms = ['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKED', 'YOUTUBE', 'TIKTOK'];

export default function SocialLinksAccordion({
  socialLinks,
  onUpdateLink,
  onAddLink,
  onRemoveLink,
}: SocialLinksAccordionProps) {
  const isValid = socialLinks.every(link => link.channel && link.url);

  // Ensure at least one link always exists
  useEffect(() => {
    if (socialLinks.length === 0) {
      onAddLink();
    }
  }, [socialLinks, onAddLink]);

  const handleAddLink = () => {
    if (!isValid) return;

    const existingChannels = socialLinks.map(link => link.channel);
    const firstAvailable = predefinedPlatforms.find(p => !existingChannels.includes(p)) || predefinedPlatforms[0];

    onAddLink();
    onUpdateLink(socialLinks.length, 'channel', firstAvailable); // prefill with available channel
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header Button */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md">
        <span className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Social Links
        </span>
        <span className="text-lg">{socialLinks.length > 0 ? '✅' : <PlusIcon className="h-5 w-5" />}</span>
      </div>

      {/* Link Cards */}
      <div className="mt-6 space-y-6">
        {socialLinks.map((link, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 sm:grid-cols-6 gap-4 p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md"
          >
            {/* Platform Dropdown */}
            <select
              value={link.channel}
              onChange={(e) => onUpdateLink(idx, 'channel', e.target.value)}
              className="sm:col-span-2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
            >
              {predefinedPlatforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>

            {/* URL Input */}
            <input
              placeholder="Profile URL"
              value={link.url}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateLink(idx, 'url', e.target.value)}
              className="sm:col-span-3 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemoveLink(idx)}
              disabled={socialLinks.length === 1} // prevent removing the last one
              className="sm:col-span-1 flex justify-center items-center text-red-500 hover:text-red-700 transition disabled:opacity-50"
              title="Remove link"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}

        {/* Add Another Button */}
        {isValid && socialLinks.length < predefinedPlatforms.length && (
          <button
            type="button"
            onClick={handleAddLink}
            className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-indigo-500 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition"
          >
            <PlusIcon className="h-5 w-5" />
            Add Another Link
          </button>
        )}

        {/* Guidance Text */}
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>Add links to your social media profiles. You can include multiple platforms.</p>
          <p>
            Platforms:{" "}
            {predefinedPlatforms.map(p => (
              <code key={p} className="bg-gray-100 px-1 mx-0.5 rounded">{p}</code>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
