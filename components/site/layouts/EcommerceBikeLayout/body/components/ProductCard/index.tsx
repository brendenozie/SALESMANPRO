'use client';

import { MinusIcon, PlusIcon, BoltIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon with a high-performance/racing vibe
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const [isSelectingOptions, setIsSelectingOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || "#FF6B00";
  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Map Options Array into Mechanical Category Groups
  const groupedVariants = useMemo(() => {
    const options = (product.option || []) as VariantOptionItem[];
    return options.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, VariantOptionItem[]>);
  }, [product.option]);

  const hasVariants = Object.keys(groupedVariants).length > 0;
  const allOptionsSelected = Object.keys(groupedVariants).every((cat) => selectedOptions[cat]);

  // 2. Computed Pricing Surcharges Block
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = finalPrice ?? sellingPrice ?? 0;
    const baseSellingPrice = sellingPrice ?? 0;
    
    let surchargeSum = 0;
    Object.entries(selectedOptions).forEach(([category, optionName]) => {
      const match = groupedVariants[category]?.find((v) => v.name === optionName);
      if (match?.extraPrice) {
        surchargeSum += match.extraPrice;
      }
    });

    return {
      finalPrice: baseFinalPrice + surchargeSum,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + surchargeSum : 0,
    };
  }, [selectedOptions, groupedVariants, finalPrice, sellingPrice]);

  // 3. Resolve exact match quantity against context cart items
  const quantity = cart.find((item: any) => {
    if (item.id !== product.id) return false;
    if (hasVariants) {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
    }
    return true;
  )?.quantity || 0;
  
  // WhatsApp "Mechanic Support" Config
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `BIKE_INQUIRY: I'm looking at the "${name}"${optionsSummary ? ` (${optionsSummary})` : ''}. Could you confirm configuration availability and if it comes pre-assembled? Price: Kes ${calculatedPrices.finalPrice.toLocaleString()}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const imageSrc = images?.[0] || 'https://via.placeholder.com/600';

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (hasVariants && !allOptionsSelected) {
      setIsSelectingOptions(true);
      return;
    }

    addToCart({
      ...product,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white border border-gray-100 p-5 transition-all duration-500 hover:shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] hover:-translate-y-2 overflow-hidden"
    >
      {/* Tactical Header: ID & WhatsApp */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
          SKU: {product.id.slice(-8).toUpperCase()}
        </span>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-gray-50 rounded-full text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 shadow-sm z-10"
          title="Consult Mechanic"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>
      </div>

      {/* Price Badge - Floating Impact */}
      <div className="absolute top-16 right-6 z-10 flex flex-col items-end pointer-events-none">
        <span className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">
          Kes {calculatedPrices.finalPrice.toLocaleString()}
        </span>
        {calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
          <span className="text-[10px] line-through text-red-500 font-bold uppercase tracking-widest mt-1">
            Kes {calculatedPrices.sellingPrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Image / Mechanical Backdrop */}
      <div className="relative aspect-[4/3] w-full mb-6 overflow-hidden bg-[#FBFBFB] rounded-xl border border-gray-50">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        
        <Link href={`/bikeecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={name}
            loader={loader}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3"
          />
        </Link>

        {/* Technical Callout */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
           <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm text-[8px] text-white px-2.5 py-1.5 rounded-none font-black uppercase tracking-widest">
             <BoltIcon className="w-3 h-3 text-yellow-400" /> Pro Grade Components
           </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primary }}>
            2026 Racing Series
          </span>
          <a 
            href={whatsappUrl}
            target="_blank"
            className="text-[8px] font-bold text-green-500 flex items-center gap-1 hover:text-black transition-colors"
          >
            <WhatsAppIcon className="w-3 h-3" /> ORDER VIA WHATSAPP
          </a>
        </div>
        
        <Link href={`/bikeecommerce/products/${product.id}`}>
          <h4 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 leading-tight mt-1 group-hover:underline decoration-2" style={{ textDecorationColor: primary }}>
            {name}
          </h4>
        </Link>

        {/* Functional Build Actions Block */}
        <div className="mt-auto pt-8 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleAddToCart}
                className="flex items-center gap-4 group/btn w-full text-left"
              >
                <div 
                  style={{ '--hover-bg': primary } as React.CSSProperties}
                  className="w-12 h-12 rounded-full border-2 border-gray-900 flex items-center justify-center transition-all group-hover/btn:border-[var(--hover-bg)] group-hover/btn:bg-[var(--hover-bg)] group-hover/btn:text-white group-hover/btn:scale-110"
                >
                  <PlusIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none">
                    {hasVariants && !allOptionsSelected ? "Configure Specs" : "Add to Build"}
                  </span>
                  <span className="text-[8px] text-gray-400 uppercase mt-1">In Stock • Ready to Ride</span>
                </div>
              </motion.button>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center bg-gray-900 text-white rounded-full p-1.5 w-full justify-between shadow-lg"
              >
                <button 
                  onClick={() => decreaseQuantity(product.id, selectedOptions)} 
                  className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="w-4 h-4 text-red-400" /> : <MinusIcon className="w-4 h-4" />}
                </button>
                <span className="font-black text-sm tracking-tighter">QTY: {quantity}</span>
                <button 
                  onClick={() => handleAddToCart()} 
                  className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <PlusIcon className="w-4 h-4 text-emerald-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= TACTICAL CONFIGURATION SLIDE MODULE ================= */}
      <AnimatePresence>
        {isSelectingOptions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-20 bg-white/FA backdrop-blur-md flex flex-col justify-end p-6 border-t-2 shadow-2xl"
            style={{ borderTopColor: primary }}
          >
            <button
              onClick={() => setIsSelectingOptions(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-none transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            <div className="w-full space-y-4 pt-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-full">
              <div className="text-center pb-2 border-b border-gray-100">
                <span className="text-[9px] font-mono tracking-widest text-gray-400 block uppercase">Custom Build Setup</span>
                <h5 className="text-sm font-black italic uppercase tracking-tight text-gray-900">{name}</h5>
              </div>

              {Object.entries(groupedVariants).map(([category, items]) => (
                <div key={category} className="space-y-2 text-center">
                  <p style={{ color: primary }} className="text-[9px] font-black uppercase tracking-wider">
                    Select {category}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {items.map((opt) => {
                      const isSelected = selectedOptions[category] === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setSelectedOptions({ ...selectedOptions, [category]: opt.name })}
                          style={{ 
                            borderColor: isSelected ? primary : undefined,
                            backgroundColor: isSelected ? primary : undefined 
                          }}
                          className={`px-3 py-2 text-[10px] font-black tracking-tight uppercase transition-all border rounded-none ${
                            isSelected 
                              ? "text-white shadow-md font-bold" 
                              : "border-gray-200 bg-gray-50 text-gray-800 active:bg-gray-100"
                          }`}
                        >
                          {opt.name}
                          {opt.extraPrice > 0 && ` (+Kes ${opt.extraPrice.toLocaleString()})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                disabled={!allOptionsSelected}
                onClick={() => {
                  handleAddToCart();
                  setIsSelectingOptions(false);
                }}
                style={{ backgroundColor: allOptionsSelected ? primary : '#9CA3AF' }}
                className="mt-4 w-full py-3 text-white font-black text-xs uppercase tracking-widest transition-opacity shadow-md rounded-none"
              >
                Lock In Specifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;