/**
 * lib/performance/storefrontConfig.ts
 *
 * Centralized Storefront & Marketplace Performance Configuration.
 * Controls virtualization parameters, row estimations, overscan buffers,
 * and scroll persistence settings across Ghuba and tenant storefronts.
 */

export interface StorefrontPerformanceSettings {
  overscanRows: number;
  mobileEstimateRowSize: number;
  desktopEstimateRowSize: number;
  scrollPersistenceDebounceMs: number;
}

export const storefrontPerformanceConfig: {
  mobile: StorefrontPerformanceSettings;
  desktop: StorefrontPerformanceSettings;
  getSettings: (isMobile: boolean) => StorefrontPerformanceSettings;
  getEstimatedRowHeight: (isMobile: boolean, customMobile?: number, customDesktop?: number) => number;
} = {
  mobile: {
    // 14 rows ahead of the viewport (~28 cards on 2-col mobile) ensures cards
    // are constructed before fast touch momentum fling reaches them
    overscanRows: 14,
    // 360px matches 2-column mobile card: 1:1 image (~170px) + info box (~170px) + gaps
    mobileEstimateRowSize: 360,
    desktopEstimateRowSize: 420,
    // 200ms debounce prevents continuous blocking synchronous sessionStorage writes
    scrollPersistenceDebounceMs: 200,
  },
  desktop: {
    // 8 rows on desktop (24-32 cards) is optimal given smaller scroll momentum
    overscanRows: 8,
    mobileEstimateRowSize: 360,
    desktopEstimateRowSize: 420,
    scrollPersistenceDebounceMs: 200,
  },
  getSettings: (isMobile: boolean) => {
    return isMobile ? storefrontPerformanceConfig.mobile : storefrontPerformanceConfig.desktop;
  },
  getEstimatedRowHeight: (isMobile: boolean, customMobile?: number, customDesktop?: number) => {
    if (isMobile) {
      return customMobile ?? storefrontPerformanceConfig.mobile.mobileEstimateRowSize;
    }
    return customDesktop ?? storefrontPerformanceConfig.desktop.desktopEstimateRowSize;
  },
};
