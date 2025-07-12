// app/[slug]/products/[productId]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import Image from 'next/image';
import Section from '@/components/site/Section/Section';
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { StarIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { StoreContextProvider, useStore } from '@/contexts/StoreContext';
import { useState } from 'react';
import { StoreForm } from '@/types/typings';

interface PageProps {
  params: { slug: string; productId: string };
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: PageProps) {
  const { slug, productId } = params;

  // Fetch store data for context
  const rawStore = await prisma.company.findUnique({ where: { slug } });
  if (!rawStore) notFound();



  // Fetch product and related items
  const product = await prisma.marketplaceListing.findFirst({
    where: { id: productId, company: { slug } },
    // include: { images: true },
  });
  if (!product) notFound();

  const related = await prisma.marketplaceListing.findMany({
    where: {
      companyId: product.companyId,
      productCategoryId: product.productCategoryId,
      NOT: { id: product.id },
    },
    take: 4,
    // include: { images: true },
  });

  // Render inside context provider
  return (
    <>
      <ProductDetail product={product} related={related} />
    </>
  );
}

function ProductDetail({ product, related }: {
  product: any;
  related: any[];
}) {
  const { addToCart, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const quantity = cart.find((c: any) => c.id === product.id)?.quantity || 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-md">
            <Image
              src={product.images[mainIndex]?.url || '/placeholder.png'}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex mt-4 space-x-2">
            {product.images.map((img: any, idx: number) => (
              <button key={idx} onClick={() => setMainIndex(idx)} className={idx === mainIndex ? 'ring-2 ring-blue-500 rounded' : ''}>
                <div className="relative w-20 h-20 rounded overflow-hidden">
                  <Image src={img.url} alt={`${product.title}-${idx}`} fill className="object-cover" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className={`h-5 w-5 ${product.rating > i ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
            <span className="ml-2 text-gray-600">({product.rating ?? 0})</span>
          </div>
          <p className="text-2xl font-semibold text-blue-600">${product.finalPrice.toFixed(2)}</p>
          <p className="leading-relaxed">{product.description}</p>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center space-x-4">
            <button onClick={() => addToCart(product)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Add to Cart</button>
            {quantity > 0 && (
              <div className="flex items-center space-x-2">
                <button onClick={() => addToCart(product)}><PlusIcon className="h-5 w-5" /></button>
                <span>{quantity}</span>
                <button onClick={() => addToCart({ ...product, quantity: -1 })}><MinusIcon className="h-5 w-5" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <Section title="You might also like">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(r => (
              <ProductGrid key={r.id} products={[{ id: r.id, name: r.title, slug: r.slug, price: r.finalPrice, imageUrl: r.images[0]?.url }]} />
            ))}
          </div>
        </Section>
      )}

      <NewsletterSection />
    </div>
  );
}
