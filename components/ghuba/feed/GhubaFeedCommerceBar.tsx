"use client";

import React, { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { HiCheckBadge, HiShoppingBag, HiBolt, HiCalendarDays, HiChatBubbleLeftRight } from "react-icons/hi2";
import { useStateContext } from "@/contexts/ContextProvider";

interface GhubaFeedCommerceBarProps {
  item: GhubaFeedItem;
  onOpenBooking: (item: GhubaFeedItem) => void;
  onOpenEnquiry: (item: GhubaFeedItem) => void;
}

export const GhubaFeedCommerceBar: React.FC<GhubaFeedCommerceBarProps> = ({
  item,
  onOpenBooking,
  onOpenEnquiry,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Consume cart actions from global ContextProvider
  const { addToCart } = useStateContext();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);

    try {
      // Direct integration with window storage / event for Cart
      const cartItem = {
        id: item.listingId,
        name: item.title,
        title: item.title,
        finalPrice: item.price,
        sellingPrice: item.price,
        quantity: 1,
        image: item.media.thumbnail || item.media.poster || (item.media.images && item.media.images[0]) || "",
        images: item.media.images,
        seller: item.seller,
        publicUrl: item.publicUrl,
      };

      // 1. Context cart update (for global cart and checkout drawer)
      if (typeof addToCart === "function") {
        addToCart(cartItem as any);
      }

      // 2. Dispatch custom cart event & update local storage for Ghuba Cart compatibility
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ghuba_cart");
        let currentCart = stored ? JSON.parse(stored) : [];
        const existingIndex = currentCart.findIndex((i: any) => i.id === cartItem.id);
        if (existingIndex > -1) {
          currentCart[existingIndex].quantity += 1;
        } else {
          currentCart.push(cartItem);
        }
        localStorage.setItem("ghuba_cart", JSON.stringify(currentCart));

        window.dispatchEvent(
          new CustomEvent("ghuba:cart:add", {
            detail: cartItem,
          })
        );
      }
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setTimeout(() => setIsAdding(false), 600);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleAddToCart(e);
    // Proceed directly to the dedicated Ghuba checkout page
    router.push("/ghuba/checkout");
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pb-6 pt-16 text-white"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-[80%] sm:max-w-[70%]">
        {/* 1. Seller & Verified Badge */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Link
            href={item.seller.slug ? `/site/${item.seller.slug}` : item.publicUrl}
            className="flex items-center gap-1 font-semibold text-sm text-white/95 hover:text-amber-400 transition-colors"
          >
            <span>@{item.seller.name}</span>
            {item.seller.isVerified && <HiCheckBadge className="h-4 w-4 text-blue-400" />}
          </Link>

          {item.category && (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/80 backdrop-blur-sm">
              {item.category}
            </span>
          )}

          {item.location && (
            <span className="text-[11px] text-white/60">📍 {item.location}</span>
          )}
        </div>

        {/* 2. Listing Title */}
        <h2 className="text-base sm:text-lg font-bold leading-snug line-clamp-2 drop-shadow-md">
          {item.title}
        </h2>

        {/* 3. Price & Discount */}
        <div className="my-1.5 flex items-baseline gap-2">
          <span className="text-lg sm:text-xl font-extrabold text-amber-400 drop-shadow">
            {item.currency} {item.price.toLocaleString()}
          </span>

          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-xs text-white/50 line-through">
              {item.currency} {item.originalPrice.toLocaleString()}
            </span>
          )}

          {item.discountPercentage && item.discountPercentage > 0 && (
            <span className="rounded bg-rose-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              -{item.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* 4. Description snippet */}
        {item.description && (
          <p className="text-xs text-white/80 leading-relaxed mb-3">
            {expanded ? item.description : `${item.description.slice(0, 75)}`}
            {item.description.length > 75 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="ml-1 font-semibold text-amber-300 hover:underline"
              >
                {expanded ? "less" : "...more"}
              </button>
            )}
          </p>
        )}

        {/* 5. Context-aware Primary Commerce CTAs */}
        <div className="flex items-center gap-2 mt-2">
          {item.commerce.canAddToCart ? (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2 font-semibold text-xs shadow-lg transition-all active:scale-95 ${
                  isAdding
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                <HiShoppingBag className="h-4 w-4" />
                <span>{isAdding ? "Added ✓" : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-bold text-xs text-black shadow-lg hover:brightness-110 active:scale-95 transition-transform"
              >
                <HiBolt className="h-4 w-4" />
                <span>Buy Now</span>
              </button>
            </>
          ) : item.commerce.canBook ? (
            <button
              type="button"
              onClick={() => onOpenBooking(item)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 font-bold text-xs text-white shadow-lg hover:brightness-110 active:scale-95 transition-transform"
            >
              <HiCalendarDays className="h-4 w-4" />
              <span>Book Service</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenEnquiry(item)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 font-bold text-xs text-white shadow-lg hover:brightness-110 active:scale-95 transition-transform"
            >
              <HiChatBubbleLeftRight className="h-4 w-4" />
              <span>Enquire Now</span>
            </button>
          )}

          <Link
            href={item.publicUrl}
            className="rounded-full border border-white/30 bg-black/40 px-3 py-2 text-xs font-medium text-white/90 backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};
