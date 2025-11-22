'use client';
import React from 'react';
import ProductCarCard from './ProductCarCard';

export default function ProductCarGrid({ cars }: { cars: any[] }) {
  if (!cars || cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No services found</h3>
        <p className="text-gray-500">Try adjusting your search terms or filters.</p>
      </div>
    );
  }

  return (
    <div id="inventory" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {cars.map((c) => <ProductCarCard key={c.id} service={c} />)}
    </div>
  );
}
