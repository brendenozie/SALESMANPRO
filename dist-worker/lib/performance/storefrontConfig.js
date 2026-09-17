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
    // 14 rows ahead of the viewport (~28 cards on 2-col mobile) ensures cards
    // are constructed before fast touch momentum fling reaches them
    overscanRows: 14,
    // 360px matches 2-column mobile card: 1:1 image (~170px) + info box (~170px) + gaps
    mobileEstimateRowSize: 360,
    desktopEstimateRowSize: 420,
    // 200ms debounce prevents continuous blocking synchronous sessionStorage writes
    scrollPersistenceDebounceMs: 200,
};
const desktopPerformanceSettings = {
    // 8 rows on desktop (24-32 cards) is optimal given smaller scroll momentum
    overscanRows: 8,
    mobileEstimateRowSize: 360,
    desktopEstimateRowSize: 420,
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
