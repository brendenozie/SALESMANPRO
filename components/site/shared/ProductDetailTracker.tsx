"use client";

import React, { useEffect, useRef } from "react";
import { useProductTelemetry } from "@/hooks/useProductTelemetry";
import { InteractionChannel } from "@/lib/analytics/types";

export interface ProductDetailTrackerProps {
  product: {
    id: string;
    productId?: string;
    marketplaceListingId?: string;
    name?: string;
    title?: string;
    category?: string;
    companyId?: string;
  };
  companyId?: string;
  channel?: InteractionChannel;
  sourceSection?: string;
}

/**
 * Universal, zero-DOM client tracker for Product Detail Pages across all themes.
 * Guarantees that visiting a product detail page in any theme emits a verified PRODUCT_VIEW
 * with appropriate tenant and product association without changing any visual layouts.
 */
export default function ProductDetailTracker({
  product,
  companyId,
  channel = InteractionChannel.STORE,
  sourceSection = "product_detail_page",
}: ProductDetailTrackerProps) {
  const { trackProductView } = useProductTelemetry();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!product || !product.id || hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    const resolvedCompanyId = companyId || product.companyId;
    const isListing = Boolean(product.marketplaceListingId);

    trackProductView(
      {
        marketplaceListingId: isListing ? (product.marketplaceListingId || product.id) : product.id,
        productId: product.productId || (!isListing ? product.id : undefined),
        companyId: resolvedCompanyId,
        channel,
        sourceSection,
      },
      {
        title: product.title || product.name,
        category: product.category,
      }
    );
  }, [product, companyId, channel, sourceSection, trackProductView]);

  return null;
}
