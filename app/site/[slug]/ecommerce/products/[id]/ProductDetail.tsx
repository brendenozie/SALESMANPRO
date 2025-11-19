// ----------------------
// Client component (enhanced)
// ----------------------

/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
import { MarketListingForm, StoreForm } from '@/types/typings';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="w-full h-[420px] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
      <div className="flex gap-3 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function ProductDetail({
  product,
  related,
}: {
  product: MarketListingForm;
  related: MarketListingForm[];
}) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Loading states
  const [mainLoaded, setMainLoaded] = useState(false);
  const [thumbsLoaded, setThumbsLoaded] = useState<Record<number, boolean>>({});

  // Touch/swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  // Pinch-to-zoom refs
  const lastPinchDistance = useRef<number | null>(null);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxTranslate, setLightboxTranslate] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);

  const primary = '#10B981';
  const secondary = '#3B82F6';

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);

  // --- Variant handling ---
  // Expected product.variants shape (defensive):
  // [{ name: 'Color', values: ['Red','Blue'], stocks: { 'Red|S': 10 }, imagesByVariant: { 'Red': [url1,url2] } }, ...]
  // const variants = (product.variants as any[]) || [];
  // const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
  //   const init: Record<string, string> = {};
  //   (variants || []).forEach(v => {
  //     if (v?.values?.length) init[v.name] = v.values[0];
  //   });
  //   return init;
  // });

  // compute stock for current selection if product.variantStocks exists or variant stocks map
  // const computeStock = () => {
  //   // try multiple places defensively
  //   const stockMap = (product.variantStocks as Record<string, number>) || product.stocks || {};
  //   if (!stockMap || Object.keys(stockMap).length === 0) return undefined;
  //   const key = Object.values(selectedVariants).join('|');
  //   return stockMap[key] ?? stockMap[Object.entries(selectedVariants).map(([k, v]) => `${k}:${v}`).join('|')] ?? undefined;
  // };

  const stockForSelection = 500 ;//computeStock();

  // Variant-based images: look for images keyed by variant value
  // product.imagesByVariant?: { Color: { Red: [imgObj], Blue: [...] }, Size: {...} }
  // const variantImages = (product.imagesByVariant as Record<string, Record<string, ImageObj[]>>) || {};

  const currentImages = useMemo(() => {
    // prefer exact variant mapping e.g. imagesByVariant.Color.Red
    // const colorVariantName = Object.keys(variantImages)[0];
    // if (colorVariantName) {
    //   const selectedValue = selectedVariants[colorVariantName];
    //   const imgs = variantImages[colorVariantName]?.[selectedValue];
    //   if (imgs && imgs.length) return imgs;
    // }
    // fallback to product.images
    return (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder-image.png' }];
  }, [product.images]);//variantImages,selectedVariants

  useEffect(() => {
    // reset main index when images list changes
    setMainIndex(0);
  }, [currentImages]);

  const currentImage = product.images[mainIndex]?.url || '/placeholder-image.png';

  const handleAddToCart = () => {
    // include variants in payload
    addToCart({ ...product,  }); //selectedVariants
  };

  const handleDecreaseQuantity = () => decreaseQuantity(product.id);

  // --- Swipe handlers for gallery and lightbox navigation ---
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchCurrentX.current = e.touches[0].clientX;
    }
    // start pinch tracking
    if (e.touches.length === 2) {
      const d = distance(e.touches[0], e.touches[1]);
      lastPinchDistance.current = d;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartX.current != null) {
      touchCurrentX.current = e.touches[0].clientX;
    }
    if (e.touches.length === 2) {
      // pinch zoom handling
      const d = distance(e.touches[0], e.touches[1]);
      if (lastPinchDistance.current) {
        const scaleChange = d / lastPinchDistance.current;
        setLightboxScale(prev => Math.min(4, Math.max(1, prev * scaleChange)));
      }
      lastPinchDistance.current = d;
    }
  };

  const onTouchEnd = () => {
    if (touchStartX.current != null && touchCurrentX.current != null) {
      const dx = touchCurrentX.current - touchStartX.current;
      const threshold = 50; // px
      if (dx > threshold) {
        // swipe right -> previous
        setMainIndex(i => Math.max(0, i - 1));
      } else if (dx < -threshold) {
        // swipe left -> next
        setMainIndex(i => Math.min(currentImages.length - 1, i + 1));
      }
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
    lastPinchDistance.current = null;
  };

  // Helpers
  function distance(a: React.Touch, b: React.Touch) {
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

  // Lightbox pointer handlers for drag/pan
  const lbStart = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragging.current = true;
  };
  const lbMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setLightboxTranslate(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
  };
  const lbEnd = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    dragging.current = false;
  };

  // thumbnail load handler
  const onThumbLoad = (idx: number) => setThumbsLoaded(s => ({ ...s, [idx]: true }));
  const onMainLoad = () => setMainLoaded(true);

  // Related carousel scroll
  const relRef = useRef<HTMLDivElement | null>(null);
  const scrollRelated = (dir: 'left' | 'right') => {
    const el = relRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // SEO title/description (best-effort client-side; server metadata preferred)
  const title = `${product.name} — ${'Store'}`; //product.company?.name || 
  const description = product.description || `${product.name} available now.`;

  // Variants UI helper
  // const handleVariantClick = (name: string, value: string) => setSelectedVariants(prev => ({ ...prev, [name]: value }));

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={currentImage} />
      </Head>

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-600 dark:text-gray-300 mt-8">
        <ol className="flex items-center gap-2">
          <li className="cursor-pointer hover:underline">Home</li>
          <li>/</li>
          <li className="cursor-pointer hover:underline">{product.productCategory?.name || 'Category'}</li>
          <li>/</li>
          <li className="font-semibold">{product.name}</li>
        </ol>
      </nav>

      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 min-h-screen mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Gallery */}
          <div className="lg:sticky lg:top-8">
            {!mainLoaded && <GallerySkeleton />}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage + '-' + mainIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: mainLoaded ? 1 : 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28 }}
                className={`relative w-full aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${mainLoaded ? '' : 'hidden'}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onPointerDown={lbStart}
                onPointerMove={lbMove}
                onPointerUp={lbEnd}
              >
                <Image
                  src={currentImage}
                  alt={product.name}
                  loader={loader}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain"
                  priority={true}
                  onLoadingComplete={onMainLoad}
                />

                {/* open lightbox */}
                <button
                  aria-label="Open image viewer"
                  className="absolute inset-0 w-full h-full"
                  onClick={() => {
                    setIsLightboxOpen(true);
                    setLightboxScale(1);
                    setLightboxTranslate({ x: 0, y: 0 });
                  }}
                />
              </motion.div>
            </AnimatePresence>

            <div className="flex mt-4 gap-3 overflow-x-auto pb-2">
              {currentImages.map((img: ImageObj, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  aria-label={`Show image ${idx + 1}`}
                  className={`relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 transition-transform transform ${idx === mainIndex ? 'scale-105 ring-4 ring-offset-2' : 'ring-1'}`}
                  style={idx === mainIndex ? { boxShadow: `0 6px 20px rgba(0,0,0,0.08)`, borderColor: primary } : {}}
                >
                  <Image src={img.url} alt={`${product.name}-${idx}`} loader={loader} fill sizes="96px" className="object-cover" onLoadingComplete={() => onThumbLoad(idx)} />
                  {!thumbsLoaded[idx] && <div className="absolute inset-0 bg-white/60 dark:bg-black/30 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">{product.name}</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">{"Store"}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">(No reviews yet)</div>
            </div>

            <div className="flex items-end gap-4">
              <div className="text-4xl font-extrabold" style={{ color: primary }}>
                ${product.finalPrice?.toFixed(2) ?? '0.00'}
              </div>

              {typeof product.sellingPrice === 'number' && product.sellingPrice > (product.finalPrice || 0) && (
                <div className="flex items-center gap-2">
                  <div className="text-lg line-through text-gray-500 dark:text-gray-400">${product.sellingPrice.toFixed(2)}</div>
                  <div className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">-{Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)}%</div>
                </div>
              )}
            </div>

            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description ?? 'No description available.'}</div>

            {/* VARIANTS */}
            {/* {variants && variants.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {variants.map((v: any) => (
                  <div key={v.name} className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{v.name}</div>
                      <div className="text-sm text-gray-500">{v?.description ?? ''}</div>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {v.values.map((val: string) => {
                        const isSelected = selectedVariants[v.name] === val;
                        const stockKey = Object.values({ ...selectedVariants, [v.name]: val }).join('|');
                        const stock = (product.variantStocks as Record<string, number>)?.[stockKey];
                        return (
                          <button
                            key={val}
                            onClick={() => handleVariantClick(v.name, val)}
                            className={`px-4 py-2 rounded-xl border transition ${isSelected ? 'bg-black text-white' : 'bg-white text-black border-gray-300'}`}
                          >
                            {val} {typeof stock === 'number' ? `· ${stock} left` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* show selected stock (if available) */}
                {/* {typeof stockForSelection === 'number' && <div className="text-sm text-gray-600">Stock for selected options: <strong>{stockForSelection}</strong></div>}
              </div>
            )} */} 

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {quantity > 0 ? (
                <div className="flex items-center gap-4">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleDecreaseQuantity} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <MinusIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                  </motion.button>

                  <div className="text-lg font-bold">{quantity}</div>

                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <PlusIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="w-full py-3 rounded-xl font-bold text-white text-lg shadow"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  Add to Cart
                </motion.button>
              )}
            </div>

            {/* Small meta area */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div>SKU: {product.id?.substring(0, 6).toUpperCase()}</div>
              <div className="hidden sm:block">Category: {product.productCategory?.name ?? '—'}</div>
              <div className="ml-auto">{''}</div>
              {/* product.shippingInfo ?? */}
            </div>
          </div>
        </div>

        {/* Related products carousel */}
        {related && related.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">You might also like</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded-md border" onClick={() => scrollRelated('left')}>‹</button>
                  <button className="px-3 py-2 rounded-md border" onClick={() => scrollRelated('right')}>›</button>
                </div>
              </div>
              <div ref={relRef} className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-6 overflow-x-auto pb-4 scroll-smooth">
                {related.map(r => (
                  <div key={r.id} className="min-w-[280px]">
                    <ProductCard product={r as any} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LIGHTBOX */}
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="relative max-w-[1200px] w-full h-[80vh] flex items-center justify-center">
                <div
                  className="relative w-full h-full bg-black rounded-lg overflow-hidden touch-none"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={(e) => {
                    onTouchEnd();
                    // allow closing with a quick tap
                    if (Math.abs((touchStartX.current || 0) - (touchCurrentX.current || 0)) < 6) {
                      // do not close on pinch/drag
                    }
                  }}
                >
                  <motion.div
                    style={{ transform: `translate(${lightboxTranslate.x}px, ${lightboxTranslate.y}px) scale(${lightboxScale})` }}
                    className="absolute inset-0 flex items-center justify-center"
                    onPointerDown={lbStart}
                    onPointerMove={lbMove}
                    onPointerUp={lbEnd}
                  >
                    <Image src={currentImage} alt={product.name} loader={loader} fill sizes="(max-width: 1200px) 100vw" className="object-contain" />
                  </motion.div>

                  <button className="absolute top-4 right-4 text-white bg-black/40 rounded-full px-3 py-2" onClick={() => setIsLightboxOpen(false)}>Close</button>

                  {/* prev/next controls */}
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-3"
                    onClick={() => setMainIndex(i => Math.max(0, i - 1))}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-3"
                    onClick={() => setMainIndex(i => Math.min(currentImages.length - 1, i + 1))}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
