"use strict";
/**
 * Calculations for Geographic coordinates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWithinRange = exports.getDistance = void 0;
/**
 * Calculates the distance between two points on Earth in meters
 * using the Haversine formula.
 */
const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth's radius in meters
    // Convert degrees to radians
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    // The Haversine Formula
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // in meters
    return distance;
};
exports.getDistance = getDistance;
/**
 * Checks if a user is within a specified radius of a company location
 */
const isWithinRange = (userCoords, targetCoords, radiusInMeters) => {
    const distance = (0, exports.getDistance)(userCoords.lat, userCoords.lng, targetCoords.lat, targetCoords.lng);
    return distance <= radiusInMeters;
};
exports.isWithinRange = isWithinRange;
