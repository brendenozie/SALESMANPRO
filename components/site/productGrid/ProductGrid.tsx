'use client';

import React from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import Section from '../Section/Section';
import ProductCard from '../layouts/EcommerceLayout/body/components/ProductCard';

export default function ProductGrid( { products } : any) {

  return (
    <Section background="none">
      <div className="max-w-7xl py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {products && products.map((product: any, idx: number) => {
          return <ProductCard key={product.id} product={product} />
        })}
      </div>
    </Section>
  );
}
