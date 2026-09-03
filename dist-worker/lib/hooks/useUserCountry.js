// hooks/useUserCountry.ts
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCountry = exports.convertKEStoUSD = void 0;
const getUserCountry = async () => {
    try {
        const res = await fetch("/api/country");
        const data = await res.json();
        return data.country || "Unknown";
    }
    catch (e) {
        console.error("Proxy failed:", e);
        return "Unknown";
    }
};
exports.getUserCountry = getUserCountry;
const convertKEStoUSD = async (kesAmount) => {
    try {
        const res = await fetch("/api/usd");
        const data = await res.json();
        if (!data?.usd)
            return kesAmount;
        return kesAmount * data.usd;
    }
    catch {
        return kesAmount;
    }
};
exports.convertKEStoUSD = convertKEStoUSD;
