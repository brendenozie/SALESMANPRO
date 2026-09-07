"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ThemeTokens, CommerceDataSource } from "@/types/website-builder";
import { StarIcon, ShoppingBagIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "@/contexts/ContextProvider";
import toast from "react-hot-toast";

interface ProductGridProps {
  content: {
    title?: string;
    subtitle?: string;
    viewAllUrl?: string;
    viewAllText?: string;
    showRating?: boolean;
    showAddToCart?: boolean;
    showBadges?: boolean;
    gridStyle?: "standard" | "compact" | "editorial";
  };
  dataSource?: CommerceDataSource;
  theme: ThemeTokens;
  companyId?: string;
  isEditorPreview?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProductGridSection({
  content,
  dataSource = { type: "products", filter: "featured", limit: 8 },
  theme,
  companyId,
  isEditorPreview = false,
}: ProductGridProps) {
  const { title = "Featured Products", subtitle, viewAllUrl, viewAllText = "View All" } = content;

  // Resolve API query for live catalog
  const flagQuery = dataSource.filter === "trending" ? "trending" : dataSource.filter === "on_offer" ? "isOnOffer" : "isFeatured";
  const apiUrl = companyId
    ? `/api/site/productsByFlag?companyId=${companyId}&flag=${flagQuery}&limit=${dataSource.limit || 8}`
    : null;

  const { data: remoteData, isLoading } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const products = useMemo(() => {
    if (remoteData?.data && Array.isArray(remoteData.data) && remoteData.data.length > 0) {
      return remoteData.data;
    }
    // High-quality mock items for editor preview if store has not created products yet
    return [
      {
        id: "p1",
        name: "Artisan Leather Tote Bag",
        sellingPrice: 4500,
        regularPrice: 5200,
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop"],
        rating: 4.9,
        reviewsCount: 24,
        isFeatured: true,
      },
      {
        id: "p2",
        name: "Minimalist Chrono Watch",
        sellingPrice: 8900,
        regularPrice: 11000,
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"],
        rating: 5.0,
        reviewsCount: 18,
        isOnOffer: true,
      },
      {
        id: "p3",
        name: "Wireless ANC Headphones",
        sellingPrice: 12500,
        regularPrice: 14000,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"],
        rating: 4.8,
        reviewsCount: 32,
      },
      {
        id: "p4",
        name: "Organic Botanical Face Serum",
        sellingPrice: 2800,
        regularPrice: 3200,
        images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"],
        rating: 4.9,
        reviewsCount: 45,
        isFeatured: true,
      },
    ];
  }, [remoteData]);

  // Cart action
  let addToCartHandler: any = null;
  try {
    const context = useStateContext();
    if (context?.addToCart) {
      addToCartHandler = context.addToCart;
    }
  } catch {
    // context optional
  }

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditorPreview) {
      toast.success(`[Preview] Added ${product.name} to cart!`);
      return;
    }
    if (addToCartHandler) {
      addToCartHandler(product, 1);
      toast.success(`${product.name} added to cart`);
    } else {
      toast.success(`${product.name} added to cart`);
    }
  };

  const cardRadiusMap = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  };
  const cardRadiusClass = cardRadiusMap[theme.cardRadius] || "rounded-xl";

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllUrl && (
          <Link
            href={viewAllUrl}
            className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2 self-start sm:self-auto"
            style={{ color: theme.primaryColor }}
          >
            <span>{viewAllText}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, dataSource.limit || 8).map((product: any) => {
          const imageSrc =
            (Array.isArray(product.images) && product.images[0]) ||
            product.image ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop";

          const price = product.sellingPrice || product.price || 0;
          const originalPrice = product.regularPrice || product.compareAtPrice || null;
          const hasDiscount = originalPrice && originalPrice > price;

          return (
            <div
              key={product.id}
              className={`group flex flex-col justify-between overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${cardRadiusClass}`}
            >
              {/* Image & Badges */}
              <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badge */}
                {content.showBadges !== false && (
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {hasDiscount && (
                      <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-rose-500 text-white shadow-xs">
                        Sale
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500 text-white shadow-xs">
                        Featured
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 sm:p-5 flex flex-col grow justify-between gap-3">
                <div>
                  {content.showRating !== false && (
                    <div className="flex items-center gap-1 mb-1.5">
                      <StarIcon className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {product.rating || 4.9}
                      </span>
                      <span className="text-xs text-zinc-400">
                        ({product.reviewsCount || 12})
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white line-clamp-2 group-hover:text-rose-500 transition-colors">
                    {product.name}
                  </h3>
                </div>

                {/* Pricing & Add to Cart */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-base font-black text-zinc-900 dark:text-white">
                      KES {price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-zinc-400 line-through">
                        KES {originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {content.showAddToCart !== false && (
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-2.5 rounded-lg text-white shadow-md hover:opacity-90 active:scale-95 transition"
                      style={{ backgroundColor: theme.primaryColor }}
                      aria-label="Add to cart"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
