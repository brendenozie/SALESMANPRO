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

const mobilePerformanceSettings: StorefrontPerformanceSettings = {
  // 20 rows ahead of the viewport (~40 cards on 2-col mobile) ensures cards
  // are constructed before fast touch momentum fling reaches them
  overscanRows: 20,
  // 380px matches 2-column mobile card: 1:1 image (~190px) + info box (~190px) + gaps
  mobileEstimateRowSize: 380,
  desktopEstimateRowSize: 440,
  // 200ms debounce prevents continuous blocking synchronous sessionStorage writes
  scrollPersistenceDebounceMs: 200,
};

const desktopPerformanceSettings: StorefrontPerformanceSettings = {
  // 16 rows on desktop (48-64 cards) smoothly absorbs fast mouse-wheel flings
  overscanRows: 16,
  mobileEstimateRowSize: 380,
  desktopEstimateRowSize: 440,
  scrollPersistenceDebounceMs: 200,
};

export const storefrontPerformanceConfig: {
  mobile: StorefrontPerformanceSettings;
  desktop: StorefrontPerformanceSettings;
  getSettings: (isMobile: boolean) => StorefrontPerformanceSettings;
  getEstimatedRowHeight: (isMobile: boolean, customMobile?: number, customDesktop?: number) => number;
} = {
  mobile: mobilePerformanceSettings,
  desktop: desktopPerformanceSettings,
  getSettings: (isMobile: boolean) => {
    return isMobile ? mobilePerformanceSettings : desktopPerformanceSettings;
  },
  getEstimatedRowHeight: (isMobile: boolean, customMobile?: number, customDesktop?: number) => {
    if (isMobile) {
      return customMobile ?? mobilePerformanceSettings.mobileEstimateRowSize;
    }
    return customDesktop ?? desktopPerformanceSettings.desktopEstimateRowSize;
  },
};
