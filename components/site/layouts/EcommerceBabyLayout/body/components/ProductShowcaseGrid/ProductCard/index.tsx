'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MinusIcon, 
  PlusIcon, 
  StarIcon, 
  TrashIcon, 
  ShoppingBagIcon,
  HeartIcon,
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
  variant?: 'grid' | 'list';
}

const loader = ({ src }: { src: string }) => src;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'grid' }) => {
  const [isOpenQuickView, setIsOpenQuickView] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#FF8FA3';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const { name, images, finalPrice, sellingPrice, id } = product;

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

  useEffect(() => {
    const initialSelections: Record<string, string> = {};
    Object.entries(groupedVariants).forEach(([category, items]) => {
      if (items.length > 0) initialSelections[category] = items[0].name;
    });
    setSelectedOptions(initialSelections);
  }, [groupedVariants]);

  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = finalPrice ?? sellingPrice ?? 0;
    const baseSellingPrice = sellingPrice ?? 0;
    let totalSurcharge = 0;
    
    Object.entries(selectedOptions).forEach(([category, optionName]) => {
      const match = groupedVariants[category]?.find((v) => v.name === optionName);
      if (match?.extraPrice) totalSurcharge += match.extraPrice;
    });

    return {
      finalPrice: baseFinalPrice + totalSurcharge,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + totalSurcharge : undefined,
    };
  }, [selectedOptions, groupedVariants, finalPrice, sellingPrice]);

  const currentVariantQuantity = useMemo(() => {
    const match = cart.find((item: any) => {
      if (item.id !== id) return false;
      if (hasVariants) {
        if (!item.selectedOptions) return false;
        return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
      }
      return true;
    });
    return match?.quantity || 0;
  }, [cart, id, selectedOptions, hasVariants]);

  const totalProductQuantity = useMemo(() => {
    return cart
      .filter((item: any) => item.id === id)
      .reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  }, [cart, id]);

  const optionsSummary = Object.entries(selectedOptions).map(([cat, val]) => `${cat}: ${val}`).join(', ');
  const whatsappNumber = `${storeFormData?.contactPhone || "254700000000"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hi! I'm looking at the "${name}"${optionsSummary ? ` (${optionsSummary})` : ''} priced at KSh ${calculatedPrices.finalPrice.toLocaleString()} for my little one. Could you tell me more about its availability?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const imageSrc = images?.[0] || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f';

  const handleAddToCart = (e?: React.MouseEvent, bypassModalCheck = false) => {
    e?.preventDefault(); e?.stopPropagation();
    if (hasVariants && !bypassModalCheck) {
      setIsOpenQuickView(true);
      return;
    }
    addToCart({
      ...product,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions: { ...selectedOptions },
    });
  };

  const handleDecreaseQuantity = (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    if (typeof decreaseQuantity === 'function') {
      decreaseQuantity(id, { selectedOptions });
    }
  };

  /* -------------------------------------------------------------------------- */
  /* VARIANT CONDITIONAL RENDERING: LIST LAYOUT */
  /* -------------------------------------------------------------------------- */
  if (variant === 'list') {
    return (
      <>
        <div 
          onClick={() => setIsOpenQuickView(true)}
          className="group relative flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-3.5 rounded-[2rem] transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/40 dark:hover:shadow-none hover:-translate-y-1 cursor-pointer"
        >
          <div className="relative w-20 h-20 rounded-2xl bg-zinc-50 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
            <Image src={imageSrc} alt={name} fill loader={loader} className="object-cover group-hover:scale-105 transition-transform duration-500" />
            {discount && (
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-black text-white bg-blue-500">
                -{discount}%
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
              {name}
            </h4>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-base font-black text-zinc-900 dark:text-white">
                KSh {calculatedPrices.finalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="absolute right-3 w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-300">
            <ArrowRightIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
        </div>

        {/* Global Modal View Injection shared instance layout anchor logic link */}
        <AnimatePresence>{isOpenQuickView && renderQuickViewModal()}</AnimatePresence>
      </>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* DEFAULT GRID PRODUCT INTERFACE */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      <div className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 transition-all duration-500 group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 hover:shadow-2xl">
        <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-zinc-50 dark:bg-zinc-800/40">
          <Link href={`/babyecommerce/products/${id}`} className="block h-full w-full">
            <Image src={imageSrc} alt={name} fill loader={loader} className="object-cover transition-transform duration-700 group-hover:scale-108" />
          </Link>

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount && (
              <div className="px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-wider" style={{ backgroundColor: secondary }}>
                {discount}% OFF
              </div>
            )}
          </div>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="absolute top-3 right-14 p-2.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white shadow-sm hover:scale-110 transition-transform active:scale-90">
            <WhatsAppIcon className="w-4 h-4" />
          </a>

          <button className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-400 hover:text-rose-500 transition-colors shadow-sm">
            <HeartIcon className="w-4 h-4" />
          </button>

          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsOpenQuickView(true)} className="absolute bottom-4 right-4 p-3.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xl opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <ShoppingBagIcon className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="px-1 pt-5 pb-1 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1 text-amber-400">
              <StarIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-bold text-zinc-500">4.8</span>
            </div>
            <button type="button" onClick={() => setIsOpenQuickView(true)} style={{ color: primary }} className="text-[10px] font-black uppercase tracking-widest hover:underline">
              {hasVariants ? "Options" : "Quick View"}
            </button>
          </div>

          <Link href={`/babyecommerce/products/${id}`}>
            <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
              {name}
            </h4>
          </Link>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-zinc-900 dark:text-white">
              KSh {calculatedPrices.finalPrice.toLocaleString()}
            </span>
            {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
              <span className="text-xs line-through text-zinc-300 dark:text-zinc-600 font-medium">
                KSh {calculatedPrices.sellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-4">
            <AnimatePresence mode="wait">
              {hasVariants ? (
                <button onClick={() => setIsOpenQuickView(true)} className="w-full py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all" style={{ backgroundColor: primary }}>
                  {totalProductQuantity > 0 ? `Configure (${totalProductQuantity})` : "Configure Options"}
                </button>
              ) : currentVariantQuantity > 0 ? (
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1 w-full justify-between">
                    <button onClick={handleDecreaseQuantity} className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 shadow-sm text-zinc-600 hover:text-red-500 transition-colors">
                      {currentVariantQuantity === 1 ? <TrashIcon className="h-3.5 w-3.5" /> : <MinusIcon className="h-3.5 w-3.5" />}
                    </button>
                    <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">{currentVariantQuantity}</span>
                    <button onClick={(e) => handleAddToCart(e, true)} className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 shadow-sm text-zinc-600 hover:text-blue-500 transition-colors">
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={(e) => handleAddToCart(e, true)} className="w-full py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md" style={{ backgroundColor: primary }}>
                  Add to Cart
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>{isOpenQuickView && renderQuickViewModal()}</AnimatePresence>
    </>
  );

  /* -------------------------------------------------------------------------- */
  /* SHARED MODAL SUB-RENDER ELEMENT DEFINITION */
  /* -------------------------------------------------------------------------- */
  function renderQuickViewModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpenQuickView(false)} className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm" />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl p-6 overflow-hidden border border-zinc-100 dark:border-zinc-800/60 max-h-[85vh] overflow-y-auto">
          <button onClick={() => setIsOpenQuickView(false)} className="absolute top-4 right-4 p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-full hover:bg-zinc-100">
            <XMarkIcon className="w-4 h-4" />
          </button>

          <div className="flex gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-4 mb-4 mt-2">
            <div className="relative w-16 h-16 rounded-xl bg-zinc-50 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
              <Image src={imageSrc} alt={name} fill className="object-cover" loader={loader} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-0.5">Quick Options</span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1">{name}</h3>
              <p className="text-lg font-black text-zinc-900 dark:text-white mt-0.5">KSh {calculatedPrices.finalPrice.toLocaleString()}</p>
            </div>
          </div>

          {hasVariants && (
            <div className="space-y-4 mb-6">
              {Object.entries(groupedVariants).map(([category, items]) => (
                <div key={category} className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Select {category}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((opt) => {
                      const isSelected = selectedOptions[category] === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setSelectedOptions({ ...selectedOptions, [category]: opt.name })}
                          style={{ backgroundColor: isSelected ? primary : undefined, borderColor: isSelected ? primary : undefined }}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${isSelected ? "text-white scale-102" : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-50/50"}`}
                        >
                          {opt.name} {opt.extraPrice > 0 && `(+KSh ${opt.extraPrice})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2.5">
            <AnimatePresence mode="wait">
              {currentVariantQuantity > 0 ? (
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 p-1 rounded-xl w-full">
                  <button onClick={handleDecreaseQuantity} className="p-3 bg-white dark:bg-zinc-900 text-zinc-600 rounded-lg shadow-sm">
                    {currentVariantQuantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                  </button>
                  <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{currentVariantQuantity} In Cart</span>
                  <button onClick={(e) => handleAddToCart(e, true)} className="p-3 bg-white dark:bg-zinc-900 text-zinc-600 rounded-lg shadow-sm">
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button disabled={hasVariants && !allOptionsSelected} onClick={(e) => handleAddToCart(e, true)} className="w-full py-3.5 text-white font-bold text-xs uppercase tracking-widest rounded-xl disabled:opacity-30" style={{ backgroundColor: primary }}>
                  Confirm Selection
                </button>
              )}
            </AnimatePresence>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              <WhatsAppIcon className="w-4 h-4 text-emerald-500" /> WhatsApp Check
            </a>
          </div>
        </motion.div>
      </div>
    );
  }
};

export default ProductCard;