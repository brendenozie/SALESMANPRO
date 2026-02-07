// app/admin/[slug]/properties/PropertyCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  HomeModernIcon,
  TruckIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

import { MarketListingForm } from '@/types/typings';

// Helper Functions (Extracted from original page.tsx)
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
};

// Image Loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

const getStatusBadgeClass = (status: MarketListingForm['status']) => {
    switch (status) {
        case 'Available': return 'bg-green-100 text-green-800 ring-green-600/20';
        case 'Under_Offer': return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
        case 'Sold': return 'bg-red-100 text-red-800 ring-red-600/20';
        case 'Draft': return 'bg-gray-100 text-gray-800 ring-gray-600/20';
        default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
};

const getProductTypeIcon = (category: MarketListingForm['category']) => {
    switch (category) {
        case 'property': return <HomeModernIcon className="h-5 w-5 text-indigo-600" />;
        case 'vehicle': return <TruckIcon className="h-5 w-5 text-emerald-600" />;
        case 'book': return <BookOpenIcon className="h-5 w-5 text-rose-600" />;
        default: return <TagIcon className="h-5 w-5 text-gray-500" />;
    }
};

interface PropertyCardProps {
  property: MarketListingForm;
  companyId: string; 
  onEdit: (property: MarketListingForm) => void;
  onDelete: (property: MarketListingForm) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, companyId, onEdit, onDelete }) => {
  
  const statusClasses = getStatusBadgeClass(property.status);
  const typeIcon = getProductTypeIcon(property.category);
  const imageUrl = property.images && property.images.length > 0 ? property.images[0].url : '/images/placeholder-listing.jpg';

  // Fallback for Next/Image loader if needed, but using a simple img tag for maximum compatibility with dynamic URLs
  const ImageComponent = property.images && property.images.length > 0 ? 
    <Image 
      src={imageUrl || 'http://unsplash.it/400/300?random'} 
      alt={property.name} 
      loader={loader}
      fill 
      sizes="(max-width: 640px) 100vw, 33vw"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.closest('.image-container')?.querySelector('.placeholder-icon')?.classList.remove('hidden');
      }}
    /> 
    : 
    <div className="placeholder-icon absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
        <PhotoIcon className="h-10 w-10" />
    </div>;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative group overflow-hidden">
      
      {/* Image Container */}
      <div className="image-container relative h-48 w-full overflow-hidden border-b border-gray-100 bg-gray-50">
        {ImageComponent}
        {/* Price Tag */}
        <span className="absolute bottom-3 left-3 px-4 py-1.5 text-lg font-extrabold text-white bg-teal-600 rounded-full shadow-lg z-10 flex items-center">
            <CurrencyDollarIcon className='h-5 w-5 mr-1' />
            {formatPrice(property.finalPrice || 0)}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        
        {/* Title & Status */}
        <div className="flex justify-between items-start space-x-2">
            <h3 className="text-xl font-bold text-gray-900 truncate pr-4">{property.name}</h3>
            <span className={`flex-shrink-0 px-3 py-1 text-xs leading-5 font-bold rounded-full shadow-sm ring-1 ring-inset ${statusClasses}`}>
                {property.status}
            </span>
        </div>

        {/* Location & Category */}
        <div className='flex justify-between items-center text-sm text-gray-600 pt-1'>
            <span className="flex items-center truncate max-w-[60%]">
                <MapPinIcon className="h-4 w-4 text-indigo-400 mr-2 flex-shrink-0" /> 
                {property.locationName || 'N/A'}
            </span>
            <span className="flex items-center font-medium text-gray-800">
                {typeIcon} 
                <span className='ml-1.5'>{property.type}</span>
            </span>
        </div>

        {/* Key Details based on Category */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-sm">
            {property.category === 'property' && (
                <>
                    <DetailBadge icon={<HomeModernIcon className='h-4 w-4' />} label={`${property.bedrooms ?? 'N/A'} Beds`} />
                    <DetailBadge icon={<HomeModernIcon className='h-4 w-4' />} label={`${property.bathrooms ?? 'N/A'} Baths`} />
                    <DetailBadge icon={<HomeModernIcon className='h-4 w-4' />} label={`${property.area ?? 'N/A'} SqFt`} />
                </>
            )}
            {property.category === 'vehicle' && (
                <>
                    <DetailBadge icon={<TruckIcon className='h-4 w-4' />} label={property.make ?? 'N/A'} />
                    <DetailBadge icon={<TruckIcon className='h-4 w-4' />} label={property.model ?? 'N/A'} />
                    <DetailBadge icon={<TruckIcon className='h-4 w-4' />} label={`${property.mileage ?? 'N/A'} mi`} />
                </>
            )}
            {property.category === 'book' && (
                <>
                    <DetailBadge icon={<BookOpenIcon className='h-4 w-4' />} label={property.author ? 'Author' : 'N/A'} />
                    <DetailBadge icon={<BookOpenIcon className='h-4 w-4' />} label={property.publisher ? 'Publisher' : 'N/A'} />
                    <DetailBadge icon={<BookOpenIcon className='h-4 w-4' />} label={property.isbn ? 'ISBN' : 'N/A'} />
                </>
            )}
            {property.category !== 'property' && property.category !== 'vehicle' && property.category !== 'book' && (
                <DetailBadge icon={<TagIcon className='h-4 w-4' />} label={`Agent: ${property.contactName}`} className="col-span-3"/>
            )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex justify-around p-3 bg-gray-50 border-t border-gray-100">
        <Link
            href={`/admin/${companyId}/properties/${property.id}`}
            className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition-all duration-200 flex items-center text-sm font-medium"
            title="View Details"
        >
            <EyeIcon className="h-5 w-5" />
        </Link>
        <button
          onClick={() => onEdit(property)}
          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-all duration-200 flex items-center text-sm font-medium"
          title="Edit Listing"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(property)}
          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-all duration-200 flex items-center text-sm font-medium"
          title="Delete Listing"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Simple utility component for a cleaner card layout
const DetailBadge: React.FC<{ icon: React.ReactNode, label: string, className?: string }> = ({ icon, label, className }) => (
    <div className={`flex flex-col items-center p-2 rounded-lg bg-gray-50 border border-gray-200 ${className}`}>
        <div className='flex items-center text-gray-500'>
            {icon}
        </div>
        <p className="text-xs font-semibold text-gray-700 mt-1 truncate w-full px-1">{label}</p>
    </div>
);