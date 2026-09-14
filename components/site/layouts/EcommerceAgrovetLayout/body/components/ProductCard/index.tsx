'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { MinusIcon, PlusIcon, StarIcon, TrashIcon, ShoppingBagIcon, XMarkIcon, ShoppingCartIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import { resolveProductMedia } from '@/lib/product-media-resolver';

interface ProductCardProps {
  product: MarketListingForm;
  index?: number;
}

const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/400';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const [isOpenQuickView, setIsOpenQuickView] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#059669';
  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);

  // Structure variant configuration array
  const groupedVariants = useMemo(() => {
    return (product.option ?? []).reduce<Record<string, VariantOptionItem[]>>(
      (acc, item) => {
        if (!item.category) return acc;
        (acc[item.category] ??= []).push(item);
        return acc;
      },
      {}
    );
  }, [product.option]);

  const variantCategories = useMemo(() => Object.keys(groupedVariants), [groupedVariants]);
  const hasVariants = variantCategories.length > 0;
  const allOptionsSelected = variantCategories.every((category) => selectedOptions[category]);

  // Set initial default selections safely from variants metadata array schema
  useEffect(() => {
    const initialSelections: Record<string, string> = {};
    Object.entries(groupedVariants).forEach(([category, items]) => {
      if (items.length > 0) {
        initialSelections[category] = items[0].name;
      }
    });
    setSelectedOptions(initialSelections);
  }, [groupedVariants]);

  // Reactive price calculator matching extra metadata variant parameters
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = product.finalPrice ?? product.sellingPrice ?? 0;
    const baseSellingPrice = product.sellingPrice ?? 0;
    
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
  }, [selectedOptions, groupedVariants, product.finalPrice, product.sellingPrice]);

  // Distinct compound signature string matching current active selections
  const targetSignatureId = useMemo(() => {
    if (hasVariants && Object.keys(selectedOptions).length > 0) {
      return `${product.id}-${JSON.stringify(selectedOptions)}`;
    }
    return product.id;
  }, [product.id, selectedOptions, hasVariants]);

  // Total absolute structural unit quantity of this item overall inside the cart (for badges)
  const totalProductQuantityInCart = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
  }, [cart, product.id]);

  // Quantity count matches only the EXACT combination selected
  const exactVariantQuantity = useMemo(() => {
    const match = cart.find((item: any) => {
      if (item.id !== product.id) return false;
      if (hasVariants) {
        if (!item.selectedOptions) return false;
        const itemSignature = `${item.id}-${JSON.stringify(item.selectedOptions)}`;
        return itemSignature === targetSignatureId;
      }
      return true;
    });
    return match?.quantity || 0;
  }, [cart, product.id, targetSignatureId, hasVariants]);

  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, ''); 
  const message = encodeURIComponent(
    `Hello! I am inquiring about "${product.name}"${optionsSummary ? ` (${optionsSummary})` : ''} priced at KSh ${calculatedPrices.finalPrice.toLocaleString()}. Could I get professional advice on how to use this correctly?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = product.sellingPrice && product.finalPrice 
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100) 
    : null;

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (hasVariants && !allOptionsSelected) {
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

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    decreaseQuantity({
      id: product.id,
      selectedOptions: { ...selectedOptions }
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        viewport={{ once: true }}
        className="group relative flex flex-col"
      >
        {/* Image Container Component Frame */}
        <div className="relative aspect-[4/5] w-full rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 mb-6">
          <Link href={`/agrovetecommerce/products/${product.id}`} className="block w-full h-full">
            <Image
              src={resolvedMedia.primaryImageUrl || FALLBACK_IMAGE_URL}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              loader={loader}
            />
          </Link>

          {/* Video Indicator Badge */}
          {resolvedMedia.hasVideo && (
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20 shadow-md">
              <VideoCameraIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video</span>
            </div>
          )}

          {/* Quick Consultation Floating Trigger Action Link */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 z-10 p-3 bg-white/90 backdrop-blur shadow-xl rounded-2xl text-[#25D366] hover:scale-110 transition-transform active:scale-95"
            title="Consult Expert"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </a>

          {/* Total Product Basket Count Pill Indicator Badge */}
          <AnimatePresence>
            {totalProductQuantityInCart > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-4 right-4 z-10 bg-slate-950 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl border border-white/10"
              >
                <ShoppingCartIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{totalProductQuantityInCart}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Discount Badge */}
          {discount && (
            <div 
              style={{ backgroundColor: primary }}
              className={`absolute ${resolvedMedia.hasVideo ? 'top-12' : 'top-4'} left-4 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg`}
            >
              -{discount}% OFF
            </div>
          )}
        </div>

        {/* Product Information Detail Card Content */}
        <div className="flex flex-col flex-grow px-2">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-lg font-black text-slate-900 tracking-tighter leading-tight group-hover:text-slate-700 transition-colors line-clamp-1">
                {product.name}
              </h4>
              {hasVariants && (
                <p className="text-[9px] font-black tracking-widest text-emerald-600 uppercase mt-0.5">
                  Multi-Option Product
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold mt-1 flex-shrink-0">
              <StarIcon className="w-3 h-3 text-amber-400" />
              4.8
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xl font-mono font-bold text-slate-900 tracking-tighter">
                KSh {(product.finalPrice ?? product.sellingPrice ?? 0).toLocaleString()}
              </span>
            </div>
            
            <button 
              type="button"
              onClick={() => setIsOpenQuickView(true)}
              style={{ color: primary }}
              className="text-[9px] flex gap-1.5 font-black uppercase underline underline-offset-4 decoration-2 items-center hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              Configure Options
            </button>
          </div>

          {/* Main Display Actions Area Grid Block */}
          <div className="mt-auto">
            {hasVariants ? (
              // Multi-Variant explicit trigger configurations
              <button
                type="button"
                onClick={() => setIsOpenQuickView(true)}
                style={{ 
                  color: primary, 
                  borderColor: `${primary}20`,
                  backgroundColor: `${primary}05`
                }}
                className="w-full flex items-center justify-center gap-2.5 py-4 border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all duration-300 shadow-sm"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Select Variant Options
              </button>
            ) : (
              // Standard straight non-variant inline behavior block
              <AnimatePresence mode="wait">
                {exactVariantQuantity > 0 ? (
                  <motion.div 
                    key="standard-cart-controls"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between bg-slate-900 rounded-2xl p-1 shadow-xl"
                  >
                    <button 
                      onClick={handleDecreaseQuantity}
                      className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      {exactVariantQuantity === 1 ? <TrashIcon className="w-4 h-4 text-red-400" /> : <MinusIcon className="w-4 h-4" />}
                    </button>
                    <span className="text-white font-black text-sm">{exactVariantQuantity}</span>
                    <button 
                      onClick={() => handleAddToCart()}
                      className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 text-emerald-400" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="standard-add-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart()}
                    style={{ 
                      color: primary, 
                      borderColor: `${primary}15`,
                      backgroundColor: `${primary}08`
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all duration-300 shadow-sm"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = primary;
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${primary}08`;
                      e.currentTarget.style.color = primary;
                    }}
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    Add to Cart
                  </motion.button>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>

      {/* ================= FULL SCREEN PORTAL QUICKVIEW MODAL OVERLAY ================= */}
      <AnimatePresence>
        {isOpenQuickView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenQuickView(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setIsOpenQuickView(false)}
                className="absolute top-5 right-5 z-10 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto p-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-6">
                {/* Modal Header */}
                <div className="flex gap-4 border-b border-slate-100 pb-5">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border flex-shrink-0">
                    <Image
                      src={product.images?.[0] || FALLBACK_IMAGE_URL}
                      alt={product.name}
                      fill
                      className="object-cover"
                      loader={loader}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Configuration Variant Context</span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{product.name}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xl font-mono font-bold text-slate-900">
                        KSh {calculatedPrices.finalPrice.toLocaleString()}
                      </span>
                      {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                        <span className="text-xs line-through text-slate-300 font-medium">
                          KSh {calculatedPrices.sellingPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Variant Map Selectors */}
                {hasVariants ? (
                  <div className="space-y-5">
                    {Object.entries(groupedVariants).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                          Select {category}
                        </p>
                        <div className="flex flex-wrap gap-2">
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
                                className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${
                                  isSelected 
                                    ? "text-white shadow-md scale-[1.02]" 
                                    : "border-slate-200 bg-slate-50/50 text-slate-800 hover:bg-slate-50 active:bg-slate-100"
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
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No specific multi-variant selections required for this listing product.</p>
                )}

                {/* Foot Action Panel Interface block */}
                <div className="pt-2 space-y-3">
                  {exactVariantQuantity > 0 ? (
                    // Display granular variant configuration adjustments contextually
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-slate-950 rounded-2xl p-1.5 shadow-lg">
                        <button 
                          onClick={handleDecreaseQuantity}
                          className="p-3.5 text-white hover:bg-white/10 rounded-xl transition-colors"
                        >
                          {exactVariantQuantity === 1 ? <TrashIcon className="w-4 h-4 text-red-400" /> : <MinusIcon className="w-4 h-4" />}
                        </button>
                        <div className="text-center text-white">
                          <span className="block font-black text-base">{exactVariantQuantity}</span>
                          <span className="block text-[8px] uppercase tracking-widest text-zinc-400 font-bold">In Cart</span>
                        </div>
                        <button 
                          onClick={() => handleAddToCart()}
                          className="p-3.5 text-white hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <PlusIcon className="w-4 h-4 text-emerald-400" />
                        </button>
                      </div>
                      <p className="text-[10px] text-center text-slate-400 font-bold tracking-tight">
                        Adjusting specific allocation for: <span className="text-slate-700 font-black">{optionsSummary || 'Default'}</span>
                      </p>
                    </div>
                  ) : (
                    // Default Initial State Action Trigger Button inside configuration view
                    <button
                      disabled={hasVariants && !allOptionsSelected}
                      onClick={() => handleAddToCart()}
                      style={{ backgroundColor: (hasVariants && !allOptionsSelected) ? undefined : primary }}
                      className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest disabled:opacity-30 transition-opacity shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      Add Variant To Cart
                    </button>
                  )}

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 border border-slate-200 bg-slate-50 text-slate-800 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    Order Variant via WhatsApp
                  </a>
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