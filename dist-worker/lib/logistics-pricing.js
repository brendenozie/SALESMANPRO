"use strict";
/**
 * Logistics Pricing & Quote Engine
 * Configurable, server-side calculated pricing for parcel, express, bulk, and freight deliveries.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeliveryQuote = exports.estimateDistanceKm = void 0;
// Estimates distance between two address strings heuristically or fallback if coordinates unavailable
function estimateDistanceKm(origin, destination) {
    if (!origin || !destination)
        return 5;
    const o = origin.toLowerCase().trim();
    const d = destination.toLowerCase().trim();
    if (o === d)
        return 3;
    // Simple heuristic based on hash difference to give stable, realistic distances (5 - 35 km) for mock/demo
    let hash = 0;
    const combined = o + '->' + d;
    for (let i = 0; i < combined.length; i++) {
        hash = (hash << 5) - hash + combined.charCodeAt(i);
        hash |= 0;
    }
    const variance = Math.abs(hash % 25);
    return 5 + variance;
}
exports.estimateDistanceKm = estimateDistanceKm;
function calculateDeliveryQuote(params) {
    const currency = params.currency || 'KES';
    const distanceKm = params.distanceKm && params.distanceKm > 0
        ? params.distanceKm
        : estimateDistanceKm(params.pickupAddress, params.deliveryAddress);
    const weight = Math.max(0.5, params.weightKg || 1);
    const service = params.serviceType || 'STANDARD';
    const pkgType = params.packageType || 'medium';
    const isInsured = Boolean(params.isInsured);
    const pkgValue = Math.max(0, params.packageValue || 0);
    // 1. Base fee by vehicle / package type
    let baseFee = 200; // Base KES
    if (params.vehicleType === 'VAN' || pkgType === 'large')
        baseFee = 600;
    else if (params.vehicleType === 'TRUCK' || pkgType === 'freight' || pkgType === 'bulk')
        baseFee = 1500;
    else if (params.vehicleType === 'HEAVY_DUTY')
        baseFee = 3500;
    else if (pkgType === 'document')
        baseFee = 150;
    // 2. Distance fee: 25 KES per KM after first 2 KM
    const chargeableKm = Math.max(0, distanceKm - 2);
    let perKmRate = 25;
    if (params.vehicleType === 'TRUCK')
        perKmRate = 60;
    if (params.vehicleType === 'HEAVY_DUTY')
        perKmRate = 120;
    const distanceFee = Math.round(chargeableKm * perKmRate);
    // 3. Weight surcharge: 20 KES per KG over 5 KG
    const chargeableWeight = Math.max(0, weight - 5);
    const weightFee = Math.round(chargeableWeight * 20);
    // 4. Service Type multiplier / urgency fee
    let serviceMultiplier = 1.0;
    if (service === 'EXPRESS')
        serviceMultiplier = 1.4;
    else if (service === 'SAME_DAY')
        serviceMultiplier = 1.8;
    else if (service === 'SCHEDULED')
        serviceMultiplier = 1.1;
    else if (service === 'FREIGHT')
        serviceMultiplier = 1.5;
    const rawSubtotal = baseFee + distanceFee + weightFee;
    const serviceFee = Math.round(rawSubtotal * (serviceMultiplier - 1.0));
    // 5. Insurance fee (1.5% of declared value if requested, minimum 50 KES)
    const insuranceFee = isInsured && pkgValue > 0 ? Math.max(50, Math.round(pkgValue * 0.015)) : 0;
    // 6. Subtotal & VAT (16%)
    const subtotal = rawSubtotal + serviceFee + insuranceFee;
    const tax = Math.round(subtotal * 0.16);
    const total = subtotal + tax;
    // Estimated travel time: 4 mins per km + 15 min buffer
    const estimatedTimeMins = Math.round(distanceKm * 3.5 + 15);
    return {
        baseFee,
        distanceFee,
        weightFee,
        serviceFee,
        insuranceFee,
        subtotal,
        tax,
        total,
        currency,
        estimatedDistanceKm: Math.round(distanceKm * 10) / 10,
        estimatedTimeMins,
    };
}
exports.calculateDeliveryQuote = calculateDeliveryQuote;
