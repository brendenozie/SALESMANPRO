'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useMemo, useState } from 'react';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for Cake Style
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isSelectingOptions, setIsSelectingOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';

  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Structural Grouping for Confectionery Metadata (e.g., Cake Weight, Flavor tier, Frosting type)
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

  // 2. Pricing Engine with Custom Surcharges Real-Time Aggregation
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = finalPrice ?? sellingPrice ?? 0;
    const baseSellingPrice = sellingPrice ?? 0;
    
    let totalSurcharge = 0;
    Object.entries(selectedOptions).forEach(([category, optionName]) => {
      const match = groupedVariants[category]?.find((v) => v.name === optionName);
      if (match?.extraPrice) {
        totalSurcharge += match.extraPrice;
      }
    });

    return {
      finalPrice: baseFinalPrice + totalSurcharge,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + totalSurcharge : undefined,
    };
  }, [selectedOptions, groupedVariants, finalPrice, sellingPrice]);

  // 3. Exact matching logic for isolated item configurations within the cart context
  const quantity = cart.find((item: any) => {
    if (item.id !== product.id) return false;
    if (hasVariants) {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
    }
    return true;
  })?.quantity || 0;
  
  // WhatsApp Configuration - Populated with chosen cake metrics and pricing parameters
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, ''); 
  const message = encodeURIComponent(
    `Hello Bakery! I'm interested in ordering the "${name}"${optionsSummary ? ` (${optionsSummary})` : ''} priced at KSh ${calculatedPrices.finalPrice.toLocaleString()}. Could you clarify the turnaround time and delivery options?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;
    
  const imageSrc = images?.[0] || 'https://via.placeholder.com/400';

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
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white rounded-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50"
    >
      {/* 1. Image Section with Labels */}
      <div className="relative h-80 w-full overflow-hidden bg-gray-50">
        <Link href={`/cakeecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={name}
            fill
            loader={loader}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </Link>

        {/* Minimalist Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {discount !== null && (
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-amber-100">
              <span className="text-[10px] font-black tracking-widest text-amber-700">-{discount}% OFF</span>
            </div>
          )}
        </div>

        {/* Floating WhatsApp Action */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-10 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-[#128C7E] duration-300 hover:bg-white"
          title="Inquire with Personal Baker"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>

        {/* Floating Add to Cart Button */}
        {quantity === 0 && (
          <button 
            onClick={() => handleAddToCart()}
            className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-500 hover:text-white"
          >
            <ShoppingBagIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <Link href={`/cakeecommerce/products/${product.id}`}>
              <h4 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-amber-700 transition-colors">
                {name}
              </h4>
            </Link>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <StarIcon className="w-3 h-3 text-amber-500" />
                <span className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">Artisan Choice</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-gray-200" />
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] flex gap-1 font-black text-[#128C7E] uppercase tracking-tighter hover:underline items-center"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" /> Order
              </a>
            </div>
          </div>
        </div>

        {/* 3. Elegant Pricing & Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            {/* Always show the current price the user will pay */}
            <span className="text-xl font-black text-gray-900">
              KSh {calculatedPrices.finalPrice.toLocaleString()}
            </span>

            {/* Only show the "old" price if a discount actually exists */}
            {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
              <span className="text-xs line-through text-gray-400 font-medium">
                KSh {calculatedPrices.sellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center">
            <AnimatePresence mode="wait">
              {quantity > 0 ? (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-1"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      decreaseQuantity(product.id);
                    }}
                    className="p-1.5 hover:text-amber-600 transition-colors"
                  >
                    {quantity === 1 ? <TrashIcon className="h-4 w-4 text-red-500" /> : <MinusIcon className="h-4 w-4" />}
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => handleAddToCart()}
                    className="p-1.5 hover:text-amber-600 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 text-emerald-600" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToCart()}
                  style={{ borderColor: primary, color: primary }}
                  className="px-5 py-2 rounded-full border-2 text-xs font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primary;
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = primary;
                  }}
                >
                  {hasVariants && !allOptionsSelected ? "Customize" : "Add To Cart"}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================= ARTISAN SELECTION OVERLAY COVER ================= */}
      <AnimatePresence>
        {isSelectingOptions && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute inset-0 z-30 bg-white/98 backdrop-blur-md flex flex-col justify-end p-6 rounded-2xl border border-amber-100 shadow-2xl"
          >
            <button
              onClick={() => setIsSelectingOptions(false)}
              className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            <div className="w-full space-y-4 pt-4 overflow-y-auto no-scrollbar max-h-full">
              {Object.entries(groupedVariants).map(([category, items]) => (
                <div key={category} className="space-y-1.5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                    {category}
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
                          className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all ${
                            isSelected 
                              ? "text-white shadow-sm scale-[1.02]" 
                              : "border-gray-200 bg-gray-50/50 text-gray-800 active:bg-gray-100"
                          }`}
                        >
                          {opt.name}
                          {opt.extraPrice > 0 && ` (+KSh ${opt.extraPrice.toLocaleString()})`}
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
                style={{ backgroundColor: allOptionsSelected ? primary : undefined }}
                className="mt-2 w-full py-3.5 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-35 transition-opacity shadow-md"
              >
                Confirm Customization
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;