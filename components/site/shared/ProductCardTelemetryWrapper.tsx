"use client";

import React from "react";
import { useThemeProductTelemetry, ThemeProductTelemetryOptions } from "./useThemeProductTelemetry";

export interface ProductCardTelemetryWrapperProps extends ThemeProductTelemetryOptions {
  product: any;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Reusable zero-styling telemetry container for product cards across all themes.
 * Provides viewport dwell observation (1s, 50% visibility) and card click tracking.
 */
export default function ProductCardTelemetryWrapper({
  product,
  children,
  className = "",
  sourceSection,
  channel,
  companyId,
  onClick,
}: ProductCardTelemetryWrapperProps) {
  const { cardRef, handleCardClick } = useThemeProductTelemetry(product, {
    sourceSection,
    channel,
    companyId,
  });

  const handleClick = (e: React.MouseEvent) => {
    handleCardClick();
    if (onClick) onClick(e);
  };

  return (
    <div ref={cardRef} className={className} onClick={handleClick}>
      {children}
    </div>
  );
}
