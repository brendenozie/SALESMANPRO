import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoreForm, MarketListingForm } from "@/types/typings";
import { BoltIcon } from "@heroicons/react/24/solid";
import UniversalQuickBuyDrawer from "@/components/site/shared/UniversalQuickBuyDrawer";

function MarketplaceProductCard({
  product,
  storeId,
}: {
  product: MarketListingForm;
  storeId?: string;
}) {
  const [showQuickBuy, setShowQuickBuy] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group cursor-pointer"
    >
      <div className="p-6 flex flex-col items-center justify-center shadow-lg rounded-2xl bg-white dark:bg-gray-800 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-xl relative overflow-hidden">
        <img
          src={product.images?.[0]?.url || ""}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-36 object-contain mb-4"
        />
        <div className="text-center mt-2 w-full">
          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
            {product.name}
          </h4>
          <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
          <p className="font-extrabold text-xl mt-3 text-emerald-600 dark:text-emerald-400">
            KES {(product.finalPrice ?? product.sellingPrice ?? 0).toLocaleString()}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickBuy(true);
            }}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <BoltIcon className="w-4 h-4" />
            <span>Quick Buy</span>
          </button>
        </div>
      </div>

      <UniversalQuickBuyDrawer
        isOpen={showQuickBuy}
        product={product}
        storeId={storeId || (product as any)?.companyId}
        isMarketplace={true}
        onClose={() => setShowQuickBuy(false)}
      />
    </motion.div>
  );
}

export function ProductGrid({
  storeFormData,
  activeFilters,
}: {
  storeFormData: StoreForm;
  activeFilters: { category: string | null; brand: string | null };
}) {
  const filteredProducts = useMemo(() => {
    return storeFormData.marketplaceListings?.filter((p) => {
      if (activeFilters.category && p.category !== activeFilters.category) return false;
      if (activeFilters.brand && p.brand !== activeFilters.brand) return false;
      return true;
    });
  }, [storeFormData, activeFilters]);

  return (
    <div className="flex-1">
      <AnimatePresence mode="wait">
        {filteredProducts && filteredProducts.length > 0 ? (
          <motion.div
            key="products"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full [contain:layout_style]"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {filteredProducts.map((product) => (
              <MarketplaceProductCard
                key={product.id}
                product={product}
                storeId={storeFormData.id}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-products"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg">No products found.</p>
            <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}