// app/[slug]/page.tsx
'use client';

import React from 'react';
import { useStore } from '../../../contexts/StoreContext';
import BookingsSite from './BookingsSite';
import DefaultSite from './DefaultSite';
import EcommerceSite from './EcommerceSite';
import ServicesSite from './ServicesSite';

// "E-commerce",
// "Service Provider",
// "Booking & Appointments",
// "Portfolio & Personal Branding",
// "Blog & Content",
// "Directory & Listings",
// "Educational & Online Courses",
// "Nonprofit & Community",
// "Restaurant & Food Delivery",
// "Event & Ticketing",
// "Real Estate",
// "Healthcare & Clinics",
// "SaaS & Web Apps",
// "Media & Entertainment",
// "Finance & Legal",
// "Automotive",
// "Travel & Tourism",
// "Fitness & Wellness",
// "Marketplace",
// "Other",

export default function StorePage() {
  const store  = useStore();

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  const type = store?.category ?? 'default'

  switch (type) {
        case 'services':    return <ServicesSite store={store} />;
        case 'booking':     return <BookingsSite store={store} />;
        case 'ecommerce':   return <EcommerceSite store={store} />;
        
        default:           return <DefaultSite store={store} />;
  }
  
}
