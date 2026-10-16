"use strict";
/**
 * lib/performance/storefrontConfig.ts
 *
 * Centralized Storefront & Marketplace Performance Configuration.
 * Controls virtualization parameters, row estimations, overscan buffers,
 * and scroll persistence settings across Ghuba and tenant storefronts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontPerformanceConfig = void 0;
const mobilePerformanceSettings = {
    // 20 rows ahead of the viewport (~40 cards on 2-col mobile) ensures cards
    // are constructed before fast touch momentum fling reaches them
    overscanRows: 20,
    // 380px matches 2-column mobile card: 1:1 image (~190px) + info box (~190px) + gaps
    mobileEstimateRowSize: 380,
    desktopEstimateRowSize: 440,
    // 200ms debounce prevents continuous blocking synchronous sessionStorage writes
    scrollPersistenceDebounceMs: 200,
};
const desktopPerformanceSettings = {
    // 16 rows on desktop (48-64 cards) smoothly absorbs fast mouse-wheel flings
    overscanRows: 16,
    mobileEstimateRowSize: 380,
    desktopEstimateRowSize: 440,
    scrollPersistenceDebounceMs: 200,
};
exports.storefrontPerformanceConfig = {
    mobile: mobilePerformanceSettings,
    desktop: desktopPerformanceSettings,
    getSettings: (isMobile) => {
        return isMobile ? mobilePerformanceSettings : desktopPerformanceSettings;
    },
    getEstimatedRowHeight: (isMobile, customMobile, customDesktop) => {
        if (isMobile) {
            return customMobile ?? mobilePerformanceSettings.mobileEstimateRowSize;
        }
        return customDesktop ?? desktopPerformanceSettings.desktopEstimateRowSize;
    },
};
