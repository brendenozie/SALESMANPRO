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
  PlusIcon
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';

const loader = ({ src }: { src: string }) => src;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const SpecItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex flex-col items-center justify-center p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
    <span className="text-[8px] uppercase font-black text-zinc-400 tracking-tighter">{label}</span>
    <span className="text-[10px] font-bold text-zinc-900 dark:text-white truncate w-full text-center">{value}</span>
  </div>
);

const AutomotiveCard = ({ item }: { item: any }) => {
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
            src={item.images?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'}
            alt={`${item.make} ${item.model}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loader={loader}
          />
          
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

export default AutomotiveCard;