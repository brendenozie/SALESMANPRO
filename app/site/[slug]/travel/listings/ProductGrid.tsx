// components/site/productGrid/ProductGrid.tsx
'use client';
import React from 'react';
import ProductCard from './ProductCard';
import Section from '@/components/site/Section/Section';

export default function ProductGrid({ products }: { products: any[] }) {
  return (
    <Section background="none">
      <div className="max-w-7xl py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products && products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500">No products found.</div>
        )}
      </div>
    </Section>
  );
}
