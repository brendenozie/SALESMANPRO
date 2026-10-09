"use strict";
/**
 * lib/dashboard/dateRangeHelper.ts
 *
 * Provides accurate, period-aware date range calculation and previous equivalent
 * period comparison windows for multi-store business intelligence reporting.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateChangePercent = exports.resolvePeriodDateRange = exports.getEndOfDay = exports.getStartOfDay = void 0;
/**
 * Returns beginning of the day (00:00:00.000) for a given date
 */
function getStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
exports.getStartOfDay = getStartOfDay;
/**
 * Returns end of the day (23:59:59.999) for a given date
 */
function getEndOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
exports.getEndOfDay = getEndOfDay;
/**
 * Resolves current and previous equivalent reporting periods
 */
function resolvePeriodDateRange(period, customStart, customEnd) {
    const now = new Date();
    const todayStart = getStartOfDay(now);
    const key = (period || "last7days").toLowerCase().trim();
    switch (key) {
        case "today": {
            const startDate = todayStart;
            const endDate = now;
            // Previous period: yesterday
            const prevStartDate = new Date(todayStart);
            prevStartDate.setDate(prevStartDate.getDate() - 1);
            const prevEndDate = new Date(now);
            prevEndDate.setDate(prevEndDate.getDate() - 1);
            return {
                period: "today",
                label: "Today",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
        case "yesterday": {
            const startDate = new Date(todayStart);
            startDate.setDate(startDate.getDate() - 1);
            const endDate = getEndOfDay(startDate);
            // Previous period: day before yesterday
            const prevStartDate = new Date(startDate);
            prevStartDate.setDate(prevStartDate.getDate() - 1);
            const prevEndDate = getEndOfDay(prevStartDate);
            return {
                period: "yesterday",
                label: "Yesterday",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
        case "last7days": {
            const startDate = new Date(todayStart);
            startDate.setDate(startDate.getDate() - 6);
            const endDate = now;
            // Previous 7 days: 7 to 13 days ago
            const prevStartDate = new Date(startDate);
            prevStartDate.setDate(prevStartDate.getDate() - 7);
            const prevEndDate = new Date(startDate);
            prevEndDate.setMilliseconds(-1);
            return {
                period: "last7days",
                label: "Last 7 Days",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
        case "last30days": {
            const startDate = new Date(todayStart);
            startDate.setDate(startDate.getDate() - 29);
            const endDate = now;
            // Previous 30 days: 30 to 59 days ago
            const prevStartDate = new Date(startDate);
            prevStartDate.setDate(prevStartDate.getDate() - 30);
            const prevEndDate = new Date(startDate);
            prevEndDate.setMilliseconds(-1);
            return {
                period: "last30days",
                label: "Last 30 Days",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
        case "thisweek": {
            // Monday as first day of week
            const tempDate = new Date(now);
            const day = tempDate.getDay();
            const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
            tempDate.setDate(diff);
            const startDate = getStartOfDay(tempDate);
            const endDate = now;
            const durationMs = endDate.getTime() - startDate.getTime();
            const prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            const prevEndDate = new Date(prevStartDate.getTime() + durationMs);
            return {
                period: "thisWeek",
                label: "This Week",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
        case "thismonth": {
            const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const endDate = now;
            // Previous equivalent period in previous month
            const prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
            const prevEndDate = new Date(prevStartDate);
            prevEndDate.setDate(Math.min(now.getDate(), new Date(now.getFullYear(), now.getMonth(), 0).getDate()));
            prevEndDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            return {
                period: "thisMonth",
                label: "This Month",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
        case "previousmonth": {
            const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
            const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            // Two months ago
            const prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
            const prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
            return {
                period: "previousMonth",
                label: "Previous Month",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
        case "thisquarter": {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const startDate = new Date(now.getFullYear(), currentQuarter * 3, 1, 0, 0, 0, 0);
            const endDate = now;
            const prevQuarterStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1, 0, 0, 0, 0);
            const durationMs = endDate.getTime() - startDate.getTime();
            const prevEndDate = new Date(prevQuarterStart.getTime() + durationMs);
            return {
                period: "thisQuarter",
                label: "This Quarter",
                startDate,
                endDate,
                prevStartDate: prevQuarterStart,
                prevEndDate,
            };
        }
        case "thisyear": {
            const startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
            const endDate = now;
            const prevStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
            const prevEndDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
            return {
                period: "thisYear",
                label: "This Year",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
        case "custom": {
            let startDate = customStart ? new Date(customStart) : new Date(todayStart.getTime() - 29 * 24 * 3600 * 1000);
            let endDate = customEnd ? new Date(customEnd) : now;
            if (isNaN(startDate.getTime()))
                startDate = new Date(todayStart.getTime() - 29 * 24 * 3600 * 1000);
            if (isNaN(endDate.getTime()))
                endDate = now;
            // Ensure proper start of day and end of day if only dates are provided
            if (customStart && customStart.length === 10)
                startDate = getStartOfDay(startDate);
            if (customEnd && customEnd.length === 10)
                endDate = getEndOfDay(endDate);
            const durationMs = Math.max(1000, endDate.getTime() - startDate.getTime());
            const prevStartDate = new Date(startDate.getTime() - durationMs);
            const prevEndDate = new Date(startDate.getTime() - 1);
            return {
                period: "custom",
                label: "Custom Range",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
        default: {
            const startDate = new Date(todayStart);
            startDate.setDate(startDate.getDate() - 6);
            const endDate = now;
            const prevStartDate = new Date(startDate);
            prevStartDate.setDate(prevStartDate.getDate() - 7);
            const prevEndDate = new Date(startDate);
            prevEndDate.setMilliseconds(-1);
            return {
                period: "last7days",
                label: "Last 7 Days",
                startDate,
                endDate,
                prevStartDate,
                prevEndDate,
            };
        }
    }
}
exports.resolvePeriodDateRange = resolvePeriodDateRange;
/**
 * Calculates mathematical percentage change between two numbers
 */
function calculateChangePercent(current, previous) {
    if (!previous || previous === 0) {
        if (!current || current === 0)
            return 0;
        return 100; // 100% increase from zero baseline
    }
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10;
}
exports.calculateChangePercent = calculateChangePercent;
