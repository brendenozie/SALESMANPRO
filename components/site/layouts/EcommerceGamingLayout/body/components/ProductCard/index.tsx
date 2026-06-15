'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MinusIcon, PlusIcon, StarIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src }: { src: string }) => src;

// --- Sub-Components ---

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface OptionRowProps {
  category: string;
  items: VariantOptionItem[];
  selectedValue: string;
  onSelect: (name: string) => void;
}

const VariantOptionRow: React.FC<OptionRowProps> = ({ category, items, selectedValue, onSelect }) => (
  <div className="space-y-2 bg-zinc-950/40 p-3 border border-zinc-800/60 rounded-sm">
    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
        [SLOT]: {category}
      </span>
      <span className="text-[10px] font-mono text-red-500 font-black uppercase tracking-tight">
        ACTIVE: {selectedValue ? selectedValue.toUpperCase() : 'NONE'}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2 pt-1">
      {items.map((item) => {
        const isSelected = String(selectedValue).trim().toUpperCase() === String(item.name).trim().toUpperCase();
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelect(item.name)}
            className={`relative p-3 text-xs font-mono font-bold uppercase tracking-wider text-left border transition-all duration-150 rounded-sm cursor-pointer ${
              isSelected
                ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.35)] z-10 font-black'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 hover:text-zinc-200'
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span>{item.name}</span>
              {item.extraPrice > 0 && (
                <span className={`text-[9px] px-1 font-mono rounded-sm ${isSelected ? 'bg-black/20 text-white' : 'text-red-400 bg-red-950/20'}`}>
                  +{item.extraPrice}$
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

// --- Main Component ---

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { name, images, finalPrice, sellingPrice } = product;
  
  const optionsList = (product.option || []) as VariantOptionItem[];
  const hasOptions = optionsList.length > 0;

  // Group options by category key tags safely
  const groupedOptions = useMemo(() => {
    const groups: Record<string, VariantOptionItem[]> = {};
    optionsList.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [optionsList]);

  // Compute live aggregate quantities for core tracking ID (all mutations combined)
  const totalProductQuantityInCart = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
  }, [cart, product.id]);

  // Compute live quantities specifically matching the currently selected dynamic option profile matrix
  const currentVariantQuantity = useMemo(() => {
    if (!hasOptions) return totalProductQuantityInCart;
    
    const matchedItem = cart.find((item: any) => {
      if (item.id !== product.id || !item.selectedOptions) return false;
      return Object.keys(groupedOptions).every(
        (cat) => String(item.selectedOptions[cat]).trim().toUpperCase() === String(selectedOptions[cat]).trim().toUpperCase()
      );
    });
    return matchedItem?.quantity || 0;
  }, [cart, product.id, hasOptions, selectedOptions, groupedOptions, totalProductQuantityInCart]);

  // Dynamic calculations for pricing matrix adjustments
  const liveExtraSurcharge = useMemo(() => {
    let surcharge = 0;
    Object.entries(selectedOptions).forEach(([cat, selectedName]) => {
      const matchedOption = optionsList.find(
        (o) => o.category === cat && String(o.name).toUpperCase() === String(selectedName).toUpperCase()
      );
      if (matchedOption) surcharge += matchedOption.extraPrice;
    });
    return surcharge;
  }, [selectedOptions, optionsList]);

  const adjustedFinalPrice = (finalPrice ?? 0) + liveExtraSurcharge;

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(`SYSTEM_INQUIRY: I'm looking at the "${name}". Can you confirm specs?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100) : null;

  const imageSrc = images?.[0] || 'https://via.placeholder.com/300';

  // Automatically anchor initial default parameters upon initialization
  useEffect(() => {
    if (hasOptions) {
      const initialOptions: Record<string, string> = {};
      Object.entries(groupedOptions).forEach(([category, items]) => {
        if (items.length > 0) {
          initialOptions[category] = items[0].name;
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [groupedOptions, hasOptions]);

  const handleSelectOption = (category: string, name: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: name,
    }));
  };

  const handleEquipClick = () => {
    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      addToCart({ ...product, selectedOptions: {}, finalPrice });
    }
  };

  const handleModalConfirm = () => {
    addToCart({ 
      ...product, 
      selectedOptions,
      finalPrice: adjustedFinalPrice 
    });
    setIsModalOpen(false);
  };

  // Explicit dynamic reduction engine for targeting variant signatures accurately inside the modal context
  const handleDecreaseVariant = () => {
    const matchedItem = cart.find((item: any) => {
      if (item.id !== product.id || !item.selectedOptions) return false;
      return Object.keys(groupedOptions).every(
        (cat) => String(item.selectedOptions[cat]).toUpperCase() === String(selectedOptions[cat]).toUpperCase()
      );
    });
    
    if (matchedItem) {
      const targetSig = matchedItem.selectedOptions && Object.keys(matchedItem.selectedOptions).length > 0
        ? `${matchedItem.id}-${JSON.stringify(matchedItem.selectedOptions)}`
        : matchedItem.id;
      decreaseQuantity(targetSig);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 hover:border-red-600/40 dark:hover:border-red-600/40 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden rounded-sm"
      >
        {/* Tactical Header */}
        <div className="flex justify-between items-center p-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-black/20">
          <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
            REF_ID// {product.id ? product.id.slice(-8).toUpperCase() : 'UNKNOWN'}
          </span>
          <div className="flex items-center gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:scale-105 transition-transform" title="Request Specs">
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>
            {discount && (
              <div className="bg-red-600 text-white text-[9px] font-mono px-1.5 py-0.5 font-bold">
                -{discount}%
              </div>
            )}
          </div>
        </div>

        {/* Product Display Viewport */}
        <Link href={`/gamingecommerce/products/${product.id}`} className="relative h-60 w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950/60">
          <Image
            src={imageSrc}
            alt={name || "Product Image"}
            fill
            loader={loader}
            className="object-contain p-6 opacity-90 dark:opacity-85 group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Configuration Summary & Pricing */}
        <div className="p-4 flex flex-col flex-grow bg-white dark:bg-zinc-900">
          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate group-hover:text-red-500 transition-colors">
            {name}
          </h4>
          
          <div className="flex items-center gap-1.5 mt-1 mb-3">
            <StarIcon className="w-3 h-3 text-red-600" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">Class: Premium_Loot</span>
          </div>

          <div className="flex items-baseline gap-2.5 mb-4">
            <span className="text-xl font-bold font-mono tracking-tight text-zinc-900 dark:text-white">
              Kes {(finalPrice ?? 0).toLocaleString()}
            </span>
            {sellingPrice && sellingPrice > (finalPrice ?? 0) && (
              <span className="text-xs line-through text-zinc-400 dark:text-zinc-600 font-mono">
                Kes {sellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Core Controls Block */}
          <div className="mt-auto">
            <AnimatePresence mode="wait">
              {hasOptions ? (
                /* Prioritize layout modal flow completely when variant options are present to prevent ambiguous adjustments */
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors cursor-pointer"
                >
                  {totalProductQuantityInCart > 0 ? `CONFIGURE MODS (${totalProductQuantityInCart})` : 'CONFIGURE MODS'}
                </button>
              ) : totalProductQuantityInCart > 0 ? (
                /* Standard linear slider controls ONLY for baseline products that contain no attributes variants */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 p-1">
                  <button
                    onClick={() => decreaseQuantity(product.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    {totalProductQuantityInCart === 1 ? <TrashIcon className="h-3.5 w-3.5" /> : <MinusIcon className="h-3.5 w-3.5" />}
                  </button>
                  <div className="flex-1 text-center font-mono text-xs font-bold text-zinc-900 dark:text-white">
                    {totalProductQuantityInCart} EQUIPED
                  </div>
                  <button 
                    onClick={handleEquipClick} 
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={handleEquipClick}
                  className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors cursor-pointer"
                >
                  EQUIP ITEM
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Split Overlay Configuration Matrix HUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-zinc-950/85 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 text-white shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5 z-10 rounded-sm"
            >
              {/* Left Side: Dynamic Preview Block */}
              <div className="md:col-span-2 bg-zinc-950/50 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col justify-between items-center text-center">
                <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase self-start">
                  // VISUAL_LOADOUT
                </span>
                <div className="relative h-44 w-44 my-4 opacity-90">
                  <Image src={imageSrc} alt={name || "Preview"} fill loader={loader} className="object-contain" />
                </div>
                <div className="space-y-1 w-full">
                  <h4 className="text-sm font-mono text-zinc-300 uppercase tracking-tight line-clamp-2">{name}</h4>
                  <div className="text-xl font-mono font-black text-red-500 transition-all">
                    Kes {adjustedFinalPrice.toLocaleString()}
                  </div>
                  {liveExtraSurcharge > 0 && (
                    <span className="text-[10px] font-mono text-zinc-500 block">
                      (Includes +${liveExtraSurcharge} Mod adjustments)
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side: Options Attributes Controls Matrix */}
              <div className="md:col-span-3 p-6 flex flex-col justify-between max-h-[85vh] md:max-h-none">
                <div className="overflow-hidden flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-red-500 block mb-0.5">
                        // RUNTIME_PARAMETER_MATCH
                      </span>
                      <h3 className="text-lg font-bold uppercase tracking-tight font-mono">SPEC_MATRIX</h3>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Dynamic Categories Mapping Loop from schema */}
                  <div className="space-y-4 my-2 overflow-y-auto pr-1 max-h-[40vh] md:max-h-[50vh]">
                    {Object.entries(groupedOptions).map(([category, items]) => (
                      <VariantOptionRow
                        key={category}
                        category={category}
                        items={items}
                        selectedValue={selectedOptions[category] || ''}
                        onSelect={(valName) => handleSelectOption(category, valName)}
                      />
                    ))}
                  </div>
                </div>

                {/* Confirm Matrix Submission Action Deck */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-zinc-800/80 mt-4 bg-zinc-900 w-full">
                  <Link
                    href={`/gamingecommerce/products/${product.id}`}
                    className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700/80 text-zinc-400 hover:text-white font-mono text-[11px] font-bold uppercase text-center tracking-wider transition-colors"
                  >
                    FULL SPECS
                  </Link>
                  
                  <div className="flex-1 min-h-[38px] flex">
                    {currentVariantQuantity > 0 ? (
                      /* Isolated Configuration Increment Stepper inside Modal context */
                      <div className="w-full bg-zinc-950 border border-zinc-800 flex items-center justify-between p-1 px-3 rounded-sm">
                        <button
                          type="button"
                          onClick={handleDecreaseVariant}
                          className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                        >
                          {currentVariantQuantity === 1 ? <TrashIcon className="h-3.5 w-3.5 text-red-500" /> : <MinusIcon className="h-3.5 w-3.5" />}
                        </button>
                        <span className="text-xs font-mono font-black text-white px-2">
                          {currentVariantQuantity} READY
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart({ ...product, selectedOptions, finalPrice: adjustedFinalPrice })}
                          className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Add a completely new configuration modification layout to cart array */
                      <button
                        onClick={handleModalConfirm}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer shadow-[0_4px_10px_rgba(220,38,38,0.2)]"
                      >
                        ADD TO CART
                      </button>
                    )}
                  </div>
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