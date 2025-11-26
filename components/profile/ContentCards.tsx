// components/profile/ContentCards.tsx
// Shared card components for blog, product, event, and media content
'use client';

import React from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  TagIcon,
  EyeIcon,
  HeartIcon,
  TicketIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import { BlogDTO, EventDTO, ProductDTO, PhotoDTO, VideoDTO } from '@/types/dto';

// ============================================================================
// BLOG CARD
// ============================================================================

interface BlogCardProps {
  blog: BlogDTO;
  onClick?: () => void;
}

export function BlogCard({ blog, onClick }: BlogCardProps) {
  const publishDate = blog.publishedAt 
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <article 
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">{blog.title.charAt(0)}</span>
          </div>
        )}
        {/* Category Badge */}
        {blog.categories.length > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-white/90 dark:bg-gray-900/90 text-indigo-600 dark:text-indigo-400 rounded-full">
            {blog.categories[0]}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {blog.excerpt}
          </p>
        )}
        
        {/* Meta */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            {publishDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                {publishDate}
              </span>
            )}
            {blog.authorName && (
              <span>by {blog.authorName}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <EyeIcon className="w-3.5 h-3.5" />
              {blog.views}
            </span>
            <span className="flex items-center gap-1">
              <HeartIcon className="w-3.5 h-3.5" />
              {blog.likes}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// EVENT CARD
// ============================================================================

interface EventCardProps {
  event: EventDTO;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const eventDate = new Date(event.startDateTime);
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
  const day = eventDate.getDate();
  const time = eventDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    POSTPONED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <article 
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex">
        {/* Date Badge */}
        <div className="flex flex-col items-center justify-center w-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
          <span className="text-xs font-bold uppercase">{month}</span>
          <span className="text-2xl font-bold">{day}</span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {event.title}
            </h3>
            <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[event.eventStatus] || statusColors.SCHEDULED}`}>
              {event.eventStatus}
            </span>
          </div>
          
          {event.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
              {event.description}
            </p>
          )}
          
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {time}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5" />
                {event.location}
              </span>
            )}
            {event.isPaid && event.price !== null && event.price > 0 && (
              <span className="flex items-center gap-1">
                <TicketIcon className="w-3.5 h-3.5" />
                ${event.price}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// PRODUCT CARD
// ============================================================================

interface ProductCardProps {
  product: ProductDTO;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const primaryImage = Array.isArray(product.images) && product.images.length > 0 
    ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any)?.url)
    : null;

  return (
    <article 
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <span className="text-gray-400 text-4xl font-bold">{product.name.charAt(0)}</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500 text-white rounded">
              Featured
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded">
              New
            </span>
          )}
          {product.discount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded">
              -{product.discount}%
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {product.category && (
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {product.category}
          </span>
        )}
        <h3 className="mt-1 font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${product.finalPrice.toFixed(2)}
          </span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ${product.sellingPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <TagIcon className="w-3 h-3" />
            <span className="truncate">{product.tags.slice(0, 2).join(', ')}</span>
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// MEDIA CARDS
// ============================================================================

interface PhotoCardProps {
  photo: PhotoDTO;
  onClick?: () => void;
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  return (
    <article 
      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <img
        src={photo.imageUrl}
        alt={photo.altText || photo.title || 'Photo'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
      {photo.title && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm font-medium truncate">{photo.title}</p>
        </div>
      )}
    </article>
  );
}

interface VideoCardProps {
  video: VideoDTO;
  onClick?: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <article 
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title || 'Video'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <PlayCircleIcon className="w-16 h-16 text-white/50" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <PlayCircleIcon className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        
        {/* Duration */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-medium bg-black/70 text-white rounded">
            {video.duration}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {video.title && (
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {video.title}
          </h3>
        )}
        {video.description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {video.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <EyeIcon className="w-3.5 h-3.5" />
            {video.views} views
          </span>
        </div>
      </div>
    </article>
  );
}
