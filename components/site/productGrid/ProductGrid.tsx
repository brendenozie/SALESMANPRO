'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '../../../contexts/ContextProvider';
import { useStoreContext } from '../../../contexts/StoreContext';
import Section from '../Section/Section';
import { MarketplaceListingForm } from '@/types/typings';
import ProductCard from '../layouts/EcommerceLayout/body/components/ProductCard';

// Next/Image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function ProductGrid({ title }: any) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug, marketplaceListings = [], themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  const getQuantity = (id: string) => cart.find((item: any) => item.id === id)?.quantity || 0;

  return (
    <Section background="none">
      <div className="max-w-7xl py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {marketplaceListings.map((product: any, idx: number) => {
          return <ProductCard key={product.id} product={product} primary={primary}/>
        })}
      </div>
    </Section>
  );
}
