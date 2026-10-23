'use client';

import React from 'react';
import {
  XMarkIcon,
  ShoppingBagIcon,
  QrCodeIcon,
  TagIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';

interface POSPriceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketListingForm | null;
  scannedCode?: string;
  currencySymbol?: string;
  onAddToCart?: (product: MarketListingForm) => void;
}

export default function POSPriceCheckModal({
  isOpen,
  onClose,
  product,
  scannedCode,
  currencySymbol = 'KES',
  onAddToCart,
}: POSPriceCheckModalProps) {
  if (!isOpen) return null;

  const basePrice = Number(product?.finalPrice || product?.sellingPrice || 0);
  const originalPrice = Number(product?.originalPrice || product?.sellingPrice || basePrice);
  const hasDiscount = originalPrice > basePrice;
  const stockQty = Number((product as any)?.stockQuantity ?? (product as any)?.quantity ?? 50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <QrCodeIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">POS Price Checker</h3>
              <p className="text-xs font-semibold text-slate-200">Hardware & Barcode Diagnostics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {product ? (
            <>
              {/* Product Info Banner */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-950 flex items-center justify-center text-slate-600 border border-slate-800">
                    <ShoppingBagIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    {product.category || 'General Product'}
                  </span>
                  <h4 className="text-base font-bold text-white truncate mt-0.5">{product.name}</h4>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Barcode / SKU: <span className="text-slate-200 font-bold">{product.sku || scannedCode || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Price Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 text-center">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Current Shelf Price</span>
                <div className="flex items-baseline justify-center gap-2 mt-1">
                  <span className="text-sm font-bold text-indigo-400">{currencySymbol}</span>
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {hasDiscount && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-slate-400 line-through">
                      {currencySymbol} {originalPrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      SAVE {(((originalPrice - basePrice) / originalPrice) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Meta Grid (Tax & Stock) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
                  <TagIcon className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Tax Treatment</span>
                    <p className="font-bold text-slate-200">16% VAT Inclusive</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
                  <ArchiveBoxIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Shelf Inventory</span>
                    <p className="font-bold text-slate-200">
                      {stockQty > 0 ? (
                        <span className="text-emerald-400">{stockQty} Units Available</span>
                      ) : (
                        <span className="text-rose-400">Out of Stock</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Done
                </button>
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <QrCodeIcon className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Item Not Found</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No product matching barcode <span className="font-mono font-bold text-slate-200">"{scannedCode}"</span> was found in store inventory.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition mt-2"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
