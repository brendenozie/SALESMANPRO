"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { 
  SparklesIcon,            // Replaces Wand2
  XMarkIcon,               // Replaces X
  ArrowDownTrayIcon,       // Replaces Save
  ArrowPathIcon,           // Replaces RefreshCw & Loader2
  ShoppingBagIcon,         // Replaces ShoppingBag
  TagIcon,                 // Replaces Tag
  BoltIcon,                // Replaces Zap
  StarIcon,                // Replaces Star
  CheckCircleIcon,         // Replaces CheckCircle2
  AdjustmentsHorizontalIcon, // Replaces Settings2
  FireIcon,                // Replaces Flame
  ReceiptPercentIcon       // Replaces Percent
} from "@heroicons/react/24/outline";

interface Props {
  companyId: string;
  categories: IStoreCategory[];
}

// --- Constants ---
const randomNames = [
  "Nike Air Max", "Samsung Galaxy S23", "Dell XPS 13", "Genuine Leather Wallet",
  "Apple Watch Series 8", "Ergonomic Gaming Chair", "JBL Flip 6",
  "KitchenAid Mixer", "Oak Coffee Table", "Sony Bravia 43”"
];

const randomImages = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80"
];

const randomDescriptions = [
  "Experience premium quality with this brand new addition to our collection.",
  "Imported directly from the manufacturer, includes full 2-year warranty.",
  "Limited edition stock. Order now for next-day delivery.",
  "Award-winning design meets exceptional performance.",
  "Rated 5-stars by customers worldwide. Highly recommended."
];

const randomColors = ["Midnight Black", "Royal Blue", "Graphite", "Ghost White", "Forest Green"];
const randomMaterials = ["Genuine Leather", "Organic Cotton", "Brushed Metal", "Recycled Plastic"];

// --- Utility for Currency ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function SampleListingsGeneratorClient({ companyId, categories }: Props) {
  const [open, setOpen] = useState(false);
  
  // Generation Settings
  const [count, setCount] = useState(10);
  const [overrides, setOverrides] = useState({
    isFlashDeal: false,
    isOnOffer: false,
    isFeatured: false,
    isNewArrival: false,
  });

  const [previewData, setPreviewData] = useState<MarketListingForm[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset success state when modal re-opens
  useEffect(() => {
    if(open) {
        setIsSuccess(false);
        generateSamples();
    }
  }, [open]);

  const generateSamples = useCallback(() => {
    setIsSuccess(false);
    const samples: MarketListingForm[] = [];

    for (let i = 0; i < count; i++) {
      const category = categories.length > 0 
        ? categories[Math.floor(Math.random() * categories.length)]
        : { displayName: "General", subcategories: [], categoryId : '' };

      const isFlash = overrides.isFlashDeal || Math.random() < 0.1;
      const isOffer = overrides.isOnOffer || Math.random() < 0.2;
      const isNew = overrides.isNewArrival || Math.random() < 0.5;
      const isFeat = overrides.isFeatured || Math.random() < 0.3;

      samples.push({
        companyId,
        productCategoryId: category.categoryId ,
        category: category.displayName,
        subCategory: category.subcategories?.[0] || {},
        name: randomNames[Math.floor(Math.random() * randomNames.length)],
        description: randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)],
        images: [randomImages[Math.floor(Math.random() * randomImages.length)]],
        tags: ["new", "trending"],
        color: [randomColors[Math.floor(Math.random() * randomColors.length)]],
        material: [randomMaterials[Math.floor(Math.random() * randomMaterials.length)]],
        quantity: Math.floor(Math.random() * 50) + 1,
        sellingPrice: Math.floor(Math.random() * 2000) + 50,
        buyingPrice: Math.floor(Math.random() * 1000) + 20,
        isAvailable: true,
        isNewArrival: isNew,
        isFeatured: isFeat,
        isOnOffer: isOffer,
        isFlashDeal: isFlash,
        locationName: "Nairobi HQ",
        latitude: -1.286389,
        longitude: 36.817223
      } as MarketListingForm);
    }

    setPreviewData(samples);
  }, [count, overrides, categories, companyId]);

  useEffect(() => {
    if (open) generateSamples();
  }, [count, overrides]); 

  const toggleOverride = (key: keyof typeof overrides) => {
    setOverrides(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/my-market-place/bulk-create`, {
        method: "POST",
        body: JSON.stringify({ listings: previewData, companyId }),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
            setOpen(false);
            setPreviewData([]);
        }, 2000);
      } else {
        alert("Failed to save listings.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* --- TRIGGER BUTTON --- */}
      <div className="p-4 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg w-full h-full mb-6">
        <button 
            onClick={() => setOpen(true)}
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
        >
            <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Auto-Generate Listings</span>
        </button>
      </div>

      {/* --- MODAL OVERLAY --- */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setOpen(false)} 
          />

          <div className="relative bg-white dark:bg-gray-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Listing Generator</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Populate your store with mock data.</p>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* --- CONTROLS SECTION --- */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row gap-8">
                    
                    {/* Slider Control */}
                    <div className="flex-1">
                        <div className="flex justify-between mb-3">
                            <label className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                <ShoppingBagIcon className="w-4 h-4 text-indigo-500" />
                                Quantity
                            </label>
                            <span className="text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-sm">{count} items</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={50}
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>1</span>
                            <span>50</span>
                        </div>
                    </div>

                    {/* Divider for mobile */}
                    <div className="h-px w-full lg:w-px lg:h-auto bg-gray-200 dark:bg-gray-700"></div>

                    {/* Custom Rules / Overrides */}
                    <div className="flex-[2]">
                        <label className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-3">
                            <AdjustmentsHorizontalIcon className="w-4 h-4 text-indigo-500" />
                            Force Attributes <span className="text-xs font-normal text-gray-400">(All items will have selected tags)</span>
                        </label>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <button 
                                onClick={() => toggleOverride('isFlashDeal')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${overrides.isFlashDeal ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                            >
                                <BoltIcon className={`w-5 h-5 mb-1 ${overrides.isFlashDeal ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className="text-xs font-medium">Flash Deal</span>
                            </button>

                            <button 
                                onClick={() => toggleOverride('isOnOffer')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${overrides.isOnOffer ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                            >
                                <ReceiptPercentIcon className={`w-5 h-5 mb-1 ${overrides.isOnOffer ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className="text-xs font-medium">On Offer</span>
                            </button>

                            <button 
                                onClick={() => toggleOverride('isNewArrival')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${overrides.isNewArrival ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                            >
                                <FireIcon className={`w-5 h-5 mb-1 ${overrides.isNewArrival ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className="text-xs font-medium">New Arrival</span>
                            </button>

                            <button 
                                onClick={() => toggleOverride('isFeatured')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${overrides.isFeatured ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                            >
                                <StarIcon className={`w-5 h-5 mb-1 ${overrides.isFeatured ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className="text-xs font-medium">Featured</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Manual Regenerate Button */}
                    <div className="flex items-end">
                         <button
                            onClick={generateSamples}
                            className="w-full lg:w-auto h-[52px] px-5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white font-medium rounded-xl shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                            title="Reroll Data"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            <span className="lg:hidden">Regenerate</span>
                        </button>
                    </div>
                </div>

                {/* --- PREVIEW SECTION --- */}
                {previewData.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
                                Preview Output 
                                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{previewData.length} listings</span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {previewData.map((item, i) => (
                                <div key={i} className="group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Image & Badges */}
                                    <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                                        <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                                        
                                        <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[90%]">
                                            {item.isFlashDeal && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm"><BoltIcon className="w-3 h-3" /> FLASH</span>}
                                            {item.isNewArrival && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">NEW</span>}
                                            {item.isOnOffer && <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">OFFER</span>}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{item.category}</p>
                                            {item.isFeatured && <StarIcon className="w-4 h-4 text-yellow-500" />}
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate mb-1" title={item.name}>{item.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <TagIcon className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{item.color[0]} / {item.material[0]}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div>
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(item.sellingPrice)}</span>
                                                {item.isOnOffer && (
                                                    <span className="text-xs text-gray-400 line-through ml-2">{formatCurrency(item.sellingPrice * 1.2)}</span>
                                                )}
                                            </div>
                                            <div className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                                Qty: {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                        <SparklesIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p>Adjust parameters to start</p>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-white dark:bg-gray-900 flex justify-end gap-3">
                <button 
                    onClick={() => setOpen(false)}
                    disabled={isSaving}
                    className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                
                <button
                    onClick={handleSave}
                    disabled={previewData.length === 0 || isSaving || isSuccess}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg transition-all
                        ${isSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    {isSaving ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            Creating...
                        </>
                    ) : isSuccess ? (
                        <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Done!
                        </>
                    ) : (
                        <>
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Create Listings
                        </>
                    )}
                </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}