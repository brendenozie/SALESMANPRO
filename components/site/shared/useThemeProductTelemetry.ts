"use client";

import { useMemo, useCallback } from "react";
import { useProductTelemetry } from "@/hooks/useProductTelemetry";
import { useStoreContext } from "@/contexts/StoreContext";
import { InteractionChannel } from "@/lib/analytics/types";

export interface ThemeProductTelemetryOptions {
  sourceSection?: string;
  channel?: InteractionChannel;
  companyId?: string;
}

export function useThemeProductTelemetry(
  product: any,
  options?: ThemeProductTelemetryOptions
) {
  const {
    observeImpression,
    trackCardClick,
    trackAddToCart,
    trackAddToCartAttempt,
    trackVariantSelect,
    trackGalleryInteraction,
    trackQuantityChange,
    trackCartRemoval,
    trackCheckoutStarted,
    trackWishlistToggle,
    trackWhatsAppClick,
    trackShare,
    trackInquiry,
  } = useProductTelemetry();

  const { storeFormData } = useStoreContext();

  const resolvedCompanyId =
    options?.companyId || product?.companyId || storeFormData?.id;
  const targetId = product?.id || product?._id;
  const isListing = Boolean(product?.listingType || product?.marketplaceListingId);

  const context = useMemo(
    () => ({
      marketplaceListingId: isListing ? targetId : (product?.marketplaceListingId || targetId),
      productId: product?.productId || (!isListing ? targetId : undefined),
      companyId: resolvedCompanyId,
      channel: options?.channel || InteractionChannel.STORE,
      sourceSection: options?.sourceSection || "catalog_card",
    }),
    [
      isListing,
      targetId,
      product?.marketplaceListingId,
      product?.productId,
      resolvedCompanyId,
      options?.channel,
      options?.sourceSection,
    ]
  );

  const cardRef = useMemo(() => observeImpression(context), [
    observeImpression,
    context,
  ]);

  const handleCardClick = useCallback(
    (extraMeta?: Record<string, any>) => {
      trackCardClick(context, {
        title: product?.title || product?.name,
        price: product?.finalPrice || product?.sellingPrice || product?.price,
        ...extraMeta,
      });
    },
    [trackCardClick, context, product?.title, product?.name, product?.finalPrice, product?.sellingPrice, product?.price]
  );

  const handleVariantSelect = useCallback(
    (variant: { category: string; name: string; extraPrice?: number }) => {
      trackVariantSelect(context, variant);
    },
    [trackVariantSelect, context]
  );

  const handleGalleryInteraction = useCallback(
    (details: { action: "image_change" | "zoom" | "lightbox"; imageIndex?: number; imageUrl?: string }) => {
      trackGalleryInteraction(context, details);
    },
    [trackGalleryInteraction, context]
  );

  return {
    context,
    cardRef,
    handleCardClick,
    handleVariantSelect,
    handleGalleryInteraction,
    trackAddToCart: useCallback(
      (qty = 1, price?: number) => trackAddToCart(context, qty, price),
      [trackAddToCart, context]
    ),
    trackAddToCartAttempt: useCallback(
      (details: any) => trackAddToCartAttempt(context, details),
      [trackAddToCartAttempt, context]
    ),
    trackQuantityChange: useCallback(
      (details: any) => trackQuantityChange(context, details),
      [trackQuantityChange, context]
    ),
    trackCartRemoval: useCallback(
      (details?: any) => trackCartRemoval(context, details),
      [trackCartRemoval, context]
    ),
    trackCheckoutStarted: useCallback(
      (details?: any) => trackCheckoutStarted(context, details),
      [trackCheckoutStarted, context]
    ),
    trackWishlistToggle: useCallback(
      (isAdded: boolean) => trackWishlistToggle(context, isAdded),
      [trackWishlistToggle, context]
    ),
    trackWhatsAppClick: useCallback(
      () => trackWhatsAppClick(context),
      [trackWhatsAppClick, context]
    ),
    trackShare: useCallback(
      (method?: string) => trackShare(context, method),
      [trackShare, context]
    ),
    trackInquiry: useCallback(
      (type: "inquiry" | "showing") => trackInquiry(context, type),
      [trackInquiry, context]
    ),
  };
}
