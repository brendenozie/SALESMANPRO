'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { 
  MapPinIcon, 
  FireIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  ScaleIcon,
  Cog6ToothIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  VideoCameraIcon
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';
import { resolveProductMedia } from '@/lib/product-media-resolver';

const AutomotiveCardComponent = ({ item }: { item: any }) => {
  const { storeFormData } = useStoreContext();
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  
  // Dynamic Data Extraction based on your JSON
  const price = item.finalPrice || item.sellingPrice;
  const location = item.locationName || "Nairobi, KE";
  const mileage = item.mileage || "0";
  const year = item.year?.$numberLong || item.year || "N/A";
  const transmission = item.transmission || "Auto";
  const fuel = item.fuelType || "Petrol";
  
  const itemId = item._id?.$oid || item.id;
  const quantity = cart.find((c: any) => c.id === itemId)?.quantity || 0;

  const resolvedMedia = React.useMemo(() => resolveProductMedia(item), [item]);

  // Logic for Badges based on your JSON flags
  const showHotBadge = item.isFeatured || item.tags?.includes('trending');
  const showNewBadge = item.isNewArrival || item.condition === "New";

  // WhatsApp Config
  const whatsappNumber = item.contact || storeFormData?.contactPhone || "254732771353";
  const message = encodeURIComponent(
    `Hello, I'm interested in the ${item.make} ${item.model} (${year}) listed at Kes ${price?.toLocaleString()}. Is it still available?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...item,
      id: itemId,
      title: `${item.make} ${item.model}`,
      name: `${item.make} ${item.model}`,
      finalPrice: price,
      sellingPrice: price,
    });
  };

  return (
    <Link href={`/automotive/listings/${itemId}`} passHref legacyBehavior>
      <motion.a
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:border-zinc-700 transition-all cursor-pointer h-full"
      >
        {/* --- MEDIA SECTION --- */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={resolvedMedia.primaryImageUrl}
            alt={`${item.make} ${item.model}`}
            fill
            unoptimized
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {resolvedMedia.hasVideo && (
            <div className="absolute bottom-3 left-4 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md border border-white/10 uppercase tracking-wider">
              <VideoCameraIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Badges Container */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <div className="flex gap-2">
              {showNewBadge && (
                <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                  <SparklesIcon className="w-3 h-3" /> New
                </span>
              )}
              {showHotBadge && (
                <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                  <FireIcon className="w-3 h-3" /> Hot
                </span>
              )}
            </div>
            
            {item.verified && (
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-emerald-400">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Immediate Dealer Link (WhatsApp) */}
          <div 
            onClick={(e) => { e.preventDefault(); window.open(whatsappUrl, '_blank'); }}
            className="absolute top-5 right-5 z-20 p-3 bg-[#25D366] text-white rounded-2xl shadow-2xl hover:scale-110 transition-transform cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </div>

          {/* Price Podium */}
          <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end z-10">
            <div className="bg-zinc-900/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
              <span className="block text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Price</span>
              <p className="text-lg font-black text-white tabular-nums leading-none">
                Kes {price?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-6">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter leading-tight group-hover:text-blue-600 transition-colors uppercase italic">
                {item.make} {item.model}
                </h3>
                <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                    {year}
                </span>
            </div>
            
            <div className="flex items-center text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">
              <MapPinIcon className="w-4 h-4 mr-1.5 text-red-500" />
              {location}
            </div>
          </div>

          {/* Performance Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mb-8">
             <SpecItem icon={ScaleIcon} label="Mileage" value={`${Number(mileage).toLocaleString()} KM`} />
             <SpecItem icon={Cog6ToothIcon} label="Trans" value={transmission} />
             <SpecItem icon={BeakerIcon} label="Fuel" value={fuel} />
          </div>

          {/* Footer Action */}
          <div className="mt-auto pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-400 uppercase">Status</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-300">
                {item.financingAvailable ? "Financing Available" : "Cash Sale"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {quantity > 0 ? (
                <div 
                  className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl px-2 py-1.5 shadow"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <button 
                    onClick={() => decreaseQuantity(itemId)}
                    className="p-1 hover:bg-white/20 dark:hover:bg-black/10 rounded"
                  >
                    {quantity === 1 ? <TrashIcon className="w-3.5 h-3.5 text-red-400" /> : <MinusIcon className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-black px-1">{quantity}</span>
                  <button 
                    onClick={() => addToCart({ ...item, id: itemId, finalPrice: price, sellingPrice: price })}
                    className="p-1 hover:bg-white/20 dark:hover:bg-black/10 rounded text-emerald-400"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  Add to Cart
                </button>
              )}

              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition-colors">
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.a>
    </Link>
  );
};

const AutomotiveCard = React.memo(AutomotiveCardComponent, (prev, next) => {
  const prevId = prev.item?._id?.$oid || prev.item?.id;
  const nextId = next.item?._id?.$oid || next.item?.id;
  return prevId === nextId && prev.item?.finalPrice === next.item?.finalPrice && prev.item?.sellingPrice === next.item?.sellingPrice;
});

export default AutomotiveCard;