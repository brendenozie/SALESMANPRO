'use client';

import React from 'react';
import FitnessProgramCard from '../layouts/FitnessLayout/body/components/FitnessProgramCard';

export default function ProductGrid({ products, slug }: { products: any[]; slug: string }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">No fitness sessions or programs found matching your selections.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <FitnessProgramCard key={product.id} product={product} slug={slug} />
      ))}
    </div>
  );
}