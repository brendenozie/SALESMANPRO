'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MinusIcon, 
  PlusIcon, 
  ShoppingBagIcon,
  HeartIcon,
  BookOpenIcon,
  BookmarkIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';
  const { name, images, finalPrice, sellingPrice } = product;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Normalize structure to safely capture standard array inputs as well as the new variant option array shape
  const normalizedOptionsGroup = useMemo(() => {
    const rawOptions = (product as any).option || (product as any).options || (product as any).productOptions || [];
    
    if (rawOptions.length > 0 && 'category' in rawOptions[0]) {
      // Group flat VariantOptionItem[] by their category fields
      const grouped: Record<string, { name: string; choices: string[]; rawItems: VariantOptionItem[] }> = {};
      (rawOptions as VariantOptionItem[]).forEach((item) => {
        if (!grouped[item.category]) {
          grouped[item.category] = { name: item.category, choices: [], rawItems: [] };
        }
        if (!grouped[item.category].choices.includes(item.name)) {
          grouped[item.category].choices.push(item.name);
          grouped[item.category].rawItems.push(item);
        }
      });
      return Object.values(grouped);
    }
    
    return rawOptions;
  }, [product]);

  const hasOptions = normalizedOptionsGroup.length > 0;

  // Calculate live surcharge total variations based on dynamic modal state configurations
  const currentSurchargeTotal = useMemo(() => {
    let surcharge = 0;
    normalizedOptionsGroup.forEach((opt: any) => {
      const activeChoice = selectedOptions[opt.name];
      if (activeChoice && opt.rawItems) {
        const matchedItem = opt.rawItems.find((ri: VariantOptionItem) => ri.name === activeChoice);
        if (matchedItem) surcharge += matchedItem.extraPrice || 0;
      }
    });
    return surcharge;
  }, [selectedOptions, normalizedOptionsGroup]);

  const activeCalculatedPrice = (finalPrice || sellingPrice || 0) + currentSurchargeTotal;

  const generateCompositeUid = (optionsPayload: Record<string, string>) => {
    if (!optionsPayload || Object.keys(optionsPayload).length === 0) return product.id;
    const sortedOptions = Object.keys(optionsPayload)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: optionsPayload[key] }), {});
    return `${product.id}-${JSON.stringify(sortedOptions)}`;
  };

  const currentSelectionKey = generateCompositeUid(selectedOptions);
  const currentSelectionQuantity = cart.find((item: any) => {
    const itemKey = item.uid || (item.selectedOptions ? generateCompositeUid(item.selectedOptions) : item.id);
    return itemKey === currentSelectionKey;
  })?.quantity || 0;

  const totalGlobalQuantity = cart
    .filter((item: any) => item.id === product.id)
    .reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);

  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hello Librarian! I'm interested in "${name}". Do you have this edition or author collections available in stock?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const imageSrc = images?.[0]?.url || images?.[0] || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f';

  const handleActionClick = () => {
    if (hasOptions) {
      const initialSelection: Record<string, string> = { ...selectedOptions };
      normalizedOptionsGroup.forEach((opt: any) => {
        if (!initialSelection[opt.name] && opt.choices?.length > 0) {
          initialSelection[opt.name] = opt.choices[0];
        }
      });
      setSelectedOptions(initialSelection);
      setIsModalOpen(true);
    } else {
      addToCart({ 
        ...product, 
        uid: product.id, 
        selectedOptions: {} 
      });
    }
  };

  const executeConfiguredAdd = () => {
    const trackingUid = generateCompositeUid(selectedOptions);
    addToCart({
      ...product,
      uid: trackingUid,
      selectedOptions,
      // Inject calculated total modified by selected variant options to state context
      finalPrice: activeCalculatedPrice
    });
  };

  const executeConfiguredDecrease = () => {
    const trackingUid = generateCompositeUid(selectedOptions);
    decreaseQuantity(trackingUid);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 p-4 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
      >
        {/* --- IMAGE CONTAINER --- */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 shadow-sm transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 z-10" />
          
          <Link href={`/bookecommerce/products/${product.id}`} className="block h-full w-full">
            <Image
              src={imageSrc}
              alt={name}
              fill
              loader={loader}
              className="object-cover transition-all duration-1000 group-hover:brightness-110"
            />
          </Link>

          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {discount && (
              <div className="bg-amber-500 text-black px-2 py-1 text-[9px] font-black uppercase tracking-widest shadow-xl">
                -{discount}%
              </div>
            )}
            <div className="bg-white/90 backdrop-blur-sm text-zinc-900 px-2 py-1 text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1 shadow-sm">
               <BookOpenIcon className="w-3 h-3" style={{ color: primary }} /> Collector's Pick
            </div>
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
            <a 
              href={whatsappUrl}
              target="_blank"
              className="p-2.5 bg-white text-[#25D366] rounded-full shadow-xl hover:scale-110 transition-transform"
              title="Ask Librarian"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
            <button type="button" className="p-2.5 bg-white text-zinc-400 hover:text-red-500 rounded-full shadow-xl transition-colors">
              <HeartIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-zinc-900/90 to-transparent z-30">
            <AnimatePresence mode="wait">
              {totalGlobalQuantity === 0 ? (
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="w-full py-3 bg-white text-zinc-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-white transition-all"
                  style={{ '--hover-bg': primary } as React.CSSProperties}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <ShoppingBagIcon className="w-4 h-4" /> {hasOptions ? "Configure Edition" : "Reserve Copy"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="w-full py-3 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: primary }}
                >
                  <ShoppingBagIcon className="w-4 h-4" /> 
                  {hasOptions ? `Manage Editions (${totalGlobalQuantity})` : `${totalGlobalQuantity} in Bag`}
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="pt-5 space-y-2 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] mb-1" style={{ color: primary }}>
              Literary Works
            </span>
            <Link href={`/bookecommerce/products/${product.id}`}>
              <h4 
                className="text-lg font-serif italic text-zinc-900 dark:text-white line-clamp-1 group-hover:underline underline-offset-4 transition-all"
                style={{ '--decoration-color': primary } as React.CSSProperties}
              >
                {name}
              </h4>
            </Link>
          </div>

          <div className="flex flex-col items-center gap-1">
             {discount && (
                <span className="text-[10px] line-through text-zinc-400 font-medium">
                  Kes {sellingPrice?.toLocaleString()}
                </span>
             )}
             <span className="text-xl font-light tracking-tighter text-zinc-900 dark:text-white">
                Kes {(finalPrice || sellingPrice)?.toLocaleString()}
             </span>
          </div>

          <a 
            href={whatsappUrl} 
            target="_blank"
            className="mt-2 inline-flex uppercase items-center gap-1 text-sm text-[#25D366] hover:underline transition-all"
          >
            <WhatsAppIcon className="w-4 h-4" /> Order Via WhatsApp
          </a>

          <div className="flex items-center justify-center gap-4 pt-3 mt-2 border-t border-zinc-50 dark:border-zinc-800">
             <div className="flex items-center gap-1.5">
                <BookmarkIcon className="w-3 h-3 text-zinc-300" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Pristine Condition</span>
             </div>
             <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-600 tracking-tighter uppercase">
                ID: {product.id?.toString().slice(-6)}
             </span>
          </div>
        </div>
      </motion.div>

      {/* --- INTERCEPT OPTION SELECTOR MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-zinc-100 dark:border-zinc-800 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg italic text-zinc-900 dark:text-white leading-tight">
                    Select Specification
                  </h3>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">{name}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Option Fields */}
              <div className="space-y-4 my-6">
                {normalizedOptionsGroup.map((opt: any) => (
                  <div key={opt.name} className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      {opt.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opt.choices?.map((choice: string) => {
                        const isSelected = selectedOptions[opt.name] === choice;
                        
                        // Look up individual configuration pricing item metadata if available
                        const matchedItem = opt.rawItems?.find((ri: VariantOptionItem) => ri.name === choice);
                        const priceSurcharge = matchedItem?.extraPrice;

                        return (
                          <button
                            type="button"
                            key={choice}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: choice }))}
                            className="px-3 py-1.5 text-xs font-medium uppercase tracking-tight transition-all border flex items-center gap-1"
                            style={{
                              backgroundColor: isSelected ? primary : 'transparent',
                              borderColor: isSelected ? primary : 'rgba(212, 212, 216, 0.5)',
                              color: isSelected ? '#FFFFFF' : 'inherit'
                            }}
                          >
                            <span>{choice}</span>
                            {priceSurcharge > 0 && (
                              <span className={`text-[9px] font-bold ${isSelected ? 'text-zinc-200' : 'text-emerald-600'}`}>
                                (+${priceSurcharge})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selection Summary Footer Box */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-400">Selected Copy price</p>
                  <p className="text-lg font-light tracking-tighter text-zinc-900 dark:text-white">
                    Kes {activeCalculatedPrice.toLocaleString()}
                  </p>
                </div>

                <div>
                  {currentSelectionQuantity === 0 ? (
                    <button
                      type="button"
                      onClick={executeConfiguredAdd}
                      className="px-4 py-2.5 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                      style={{ backgroundColor: primary }}
                    >
                      <ShoppingBagIcon className="w-3.5 h-3.5" /> Add Edition
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 border p-1 rounded-full bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={executeConfiguredDecrease}
                        className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <MinusIcon className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-black text-zinc-900 dark:text-white tabular-nums">
                        {currentSelectionQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={executeConfiguredAdd}
                        className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <PlusIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;