// components/profile/ProfileHeader.tsx
// Shared profile header component for all verticals
'use client';

import React from 'react';
import { 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  GlobeAltIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export interface ProfileHeaderProps {
  name: string;
  tagline?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  contactEmail?: string;
  contactPhone?: string | null;
  address?: string | null;
  category?: string;
  socialLinks?: Array<{
    channel: string;
    url: string;
  }>;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  createdAt?: string;
  variant?: 'default' | 'minimal' | 'hero';
}

export default function ProfileHeader({
  name,
  tagline,
  description,
  logoUrl,
  bannerUrl,
  contactEmail,
  contactPhone,
  address,
  category,
  socialLinks = [],
  stats = [],
  createdAt,
  variant = 'default',
}: ProfileHeaderProps) {
  const joinDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  }) : null;

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={name}
            className="w-20 h-20 rounded-xl object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
          {tagline && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{tagline}</p>
          )}
          {category && (
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">
              {category}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-indigo-600 to-purple-600">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt={`${name} banner`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6 -mt-16">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          {/* Logo/Avatar */}
          <div className="relative">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl object-cover bg-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{name}</h1>
                {tagline && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{tagline}</p>
                )}
                {category && (
                  <span className="inline-block mt-2 px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">
                    {category}
                  </span>
                )}
              </div>

              {/* Stats */}
              {stats.length > 0 && (
                <div className="hidden md:flex gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-6 text-gray-700 dark:text-gray-300 max-w-3xl">
            {description}
          </p>
        )}

        {/* Contact & Meta */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-gray-400">
          {address && (
            <span className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" />
              {address}
            </span>
          )}
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-indigo-600">
              <EnvelopeIcon className="w-4 h-4" />
              {contactEmail}
            </a>
          )}
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="flex items-center gap-2 hover:text-indigo-600">
              <PhoneIcon className="w-4 h-4" />
              {contactPhone}
            </a>
          )}
          {joinDate && (
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Joined {joinDate}
            </span>
          )}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="mt-6 flex items-center gap-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900 dark:hover:text-indigo-400 transition-colors"
                title={link.channel}
              >
                <GlobeAltIcon className="w-5 h-5" />
              </a>
            ))}
          </div>
        )}

        {/* Mobile Stats */}
        {stats.length > 0 && (
          <div className="md:hidden mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
