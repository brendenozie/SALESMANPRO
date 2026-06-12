'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useMemo, useState } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for Artisan/Natural vibe
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#3E2723'; 
  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Map and Structural Classification of Harvest Variant Dimensions
  const groupedVariants = useMemo(() => {
    const options = (product.option || []) as any[];
    return options.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [product.option]);

  const hasVariants = Object.keys(groupedVariants).length > 0;
  const allOptionsSelected = Object.keys(groupedVariants).every((cat) => selectedOptions[cat]);

  // 2. Compute Total Price Aggregating Selected Option Surcharges
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = finalPrice ?? sellingPrice ?? 0;
    const baseSellingPrice = sellingPrice ?? 0;
    
    let extraSurcharge = 0;
    Object.entries(selectedOptions).forEach(([category, optionValue]) => {
      const match = groupedVariants[category]?.find((v) => v.name === optionValue);
      if (match?.extraPrice) {
        extraSurcharge += match.extraPrice;
      }
    });

    return {
      finalPrice: baseFinalPrice + extraSurcharge,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + extraSurcharge : undefined,
    };
  }, [selectedOptions, groupedVariants, finalPrice, sellingPrice]);

  // 3. Isolated Target Context Match Lookup Within Global Shopping Bag
  const quantity = cart.find((item: any) => {
    if (item.id !== product.id) return false;
    if (hasVariants) {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
    }
    return true;
  })?.quantity || 0;

  // Calculate percentage discount based on computed configuration values
  const discount = calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice
    ? Math.round(((calculatedPrices.sellingPrice - calculatedPrices.finalPrice) / calculatedPrices.sellingPrice) * 100)
    : null;
    
  const imageSrc = images?.[0] || 'https://via.placeholder.com/300';

  // 4. Dynamic WhatsApp Concierge URL Formulation
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hello! I'm inquiring about the artisan "${name}" harvest${optionsSummary ? ` selection [${optionsSummary}]` : ''}. Is this exact variant available from recent batches? I'd love to confirm details.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const handleAddToBag = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (hasVariants && !allOptionsSelected) {
      setIsConfiguring(true);
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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[2rem] p-4 border border-stone-100 relative flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(62,39,35,0.05)]"
    >
      {/* Image Container */}
      <div className="relative h-64 w-full rounded-[1.5rem] overflow-hidden bg-[#FAF9F6]">
        <Link href={`/honeyecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={name}
            fill
            loader={loader}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {discount && (
          <div 
            style={{ backgroundColor: primaryColor }}
            className="absolute top-3 left-3 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest z-10"
          >
            -{discount}%
          </div>
        )}

        {/* Floating WhatsApp - Origin Inquiry */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-10 p-2.5 bg-white/90 backdrop-blur-sm text-[#128C7E] rounded-full shadow-sm transition-all duration-300 hover:scale-110"
          title="Talk to Beekeeping Expert"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-4 px-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          {quantity === 0 && (
            <button 
              onClick={handleAddToBag}
              style={{ color: primaryColor }}
              className="w-full bg-white/95 backdrop-blur-md py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-[#3E2723] hover:!text-white"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              {hasVariants && !allOptionsSelected ? "Choose Size" : "Quick Add"}
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 pb-2 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Premium Harvest</span>
            <div className="h-1 w-1 rounded-full bg-stone-200" />
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-black text-[#128C7E] uppercase hover:underline transition-colors flex items-center gap-1"
            >
              <WhatsAppIcon className="w-3 h-3" /> Order Via WhatsApp
            </a>
          </div>
          <Link href={`/honeyecommerce/products/${product.id}`} className="block">
            <h4 style={{ color: primaryColor }} className="text-lg font-bold leading-tight mt-1 group-hover:text-[#F3A852] transition-colors line-clamp-2">
              {name}
            </h4>
          </Link>
        </div>

        <div className="flex items-center gap-4 mt-5 pt-2 border-t border-stone-50">
          <div className="flex flex-col">
            <span style={{ color: primaryColor }} className="text-xl font-black">
              Kes {calculatedPrices.finalPrice.toLocaleString()}
            </span>
            {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
              <span className="text-xs line-through text-stone-300 font-bold">
                Kes {calculatedPrices.sellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <AnimatePresence mode="wait">
            {quantity > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex-grow flex items-center justify-end gap-2.5"
              >
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    decreaseQuantity(product.id);
                  }}
                  className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
                >
                  {quantity === 1 ? (
                    <TrashIcon className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <MinusIcon style={{ color: primaryColor }} className="w-3 h-3" />
                  )}
                </button>
                <span style={{ color: primaryColor }} className="text-sm font-black w-5 text-center">{quantity}</span>
                <button 
                  onClick={() => handleAddToBag()}
                  style={{ backgroundColor: primaryColor }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F3A852] transition-colors"
                >
                  <PlusIcon className="w-3 h-3 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= ORGANIC HARVEST SELECTION DRAWER ================= */}
      <AnimatePresence>
        {isConfiguring && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute inset-0 z-20 bg-white/98 backdrop-blur-md flex flex-col justify-end p-5 rounded-[2rem] border border-neutral-100"
          >
            <button
              onClick={() => setIsConfiguring(false)}
              className="absolute top-4 right-4 p-1.5 bg-stone-100 text-stone-700 rounded-full transition-colors hover:bg-stone-200"
            >
              <XMarkIcon className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="w-full space-y-4 pt-2 overflow-y-auto max-h-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <h5 style={{ color: primaryColor }} className="font-bold text-center text-base border-b border-stone-100 pb-2">
                Harvest Customization
              </h5>
              
              {Object.entries(groupedVariants).map(([category, variantsList]) => (
                <div key={category} className="space-y-1.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Select {category}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {variantsList.map((variantItem) => {
                      const isSelected = selectedOptions[category] === variantItem.name;
                      return (
                        <button
                          key={variantItem.name}
                          type="button"
                          onClick={() => setSelectedOptions({ ...selectedOptions, [category]: variantItem.name })}
                          style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                          className={`px-3 py-1.5 text-[11px] rounded-xl border font-bold transition-all ${
                            isSelected 
                              ? "text-white shadow-sm" 
                              : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                          }`}
                        >
                          {variantItem.name}
                          {variantItem.extraPrice > 0 && ` (+Kes ${variantItem.extraPrice.toLocaleString()})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                disabled={!allOptionsSelected}
                onClick={() => {
                  handleAddToBag();
                  setIsConfiguring(false);
                }}
                style={allOptionsSelected ? { backgroundColor: primaryColor } : {}}
                className="mt-4 w-full py-3.5 bg-stone-300 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:cursor-not-allowed hover:bg-[#F3A852]"
              >
                Confirm Specifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;