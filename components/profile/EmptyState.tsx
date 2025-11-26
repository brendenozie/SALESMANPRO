// components/profile/EmptyState.tsx
// Empty state component for when there's no content
'use client';

import React from 'react';
import { 
  DocumentIcon,
  CalendarIcon,
  ShoppingBagIcon,
  PhotoIcon,
  VideoCameraIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

type ContentType = 'blog' | 'event' | 'product' | 'photo' | 'video' | 'media' | 'service' | 'general';

interface EmptyStateProps {
  type?: ContentType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

const icons: Record<ContentType, React.ElementType> = {
  blog: NewspaperIcon,
  event: CalendarIcon,
  product: ShoppingBagIcon,
  photo: PhotoIcon,
  video: VideoCameraIcon,
  media: PhotoIcon,
  service: WrenchScrewdriverIcon,
  general: DocumentIcon,
};

const defaultMessages: Record<ContentType, { title: string; description: string }> = {
  blog: {
    title: 'No blog posts yet',
    description: 'Check back later for articles and updates.',
  },
  event: {
    title: 'No upcoming events',
    description: 'There are no events scheduled at the moment.',
  },
  product: {
    title: 'No products available',
    description: 'Products will be listed here when available.',
  },
  photo: {
    title: 'No photos yet',
    description: 'Photos will appear here once they are uploaded.',
  },
  video: {
    title: 'No videos yet',
    description: 'Videos will appear here once they are uploaded.',
  },
  media: {
    title: 'No media content',
    description: 'Media content will appear here once uploaded.',
  },
  service: {
    title: 'No services listed',
    description: 'Services will be listed here when available.',
  },
  general: {
    title: 'Nothing here yet',
    description: 'Content will appear here once it is added.',
  },
};

export default function EmptyState({
  type = 'general',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const Icon = icons[type];
  const defaultMsg = defaultMessages[type];

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title || defaultMsg.title}
      </h3>
      
      <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-sm">
        {description || defaultMsg.description}
      </p>

      {action && (
        action.href ? (
          <a
            href={action.href}
            className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {action.label}
          </a>
        ) : action.onClick ? (
          <button
            onClick={action.onClick}
            className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {action.label}
          </button>
        ) : null
      )}
    </div>
  );
}
