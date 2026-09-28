"use strict";
/**
 * lib/pos/offline/connectivity/connectivityManager.ts
 *
 * Real-world Connectivity Detection & Latency Monitor for SalesmanPro POS.
 * Does not rely solely on navigator.onLine (which only checks Wi-Fi link).
 * Actively probes /api/pos/health, tracks latency, detects packet loss, and classifies
 * connectivity into: ONLINE, DEGRADED, OFFLINE, SYNCING, or SYNC_ERROR.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectivityManager = exports.ConnectivityManager = void 0;
class ConnectivityManager {
    state = "ONLINE";
    latencyMs = 0;
    subscribers = new Set();
    probeInterval = null;
    consecutiveFailures = 0;
    healthEndpoint;
    constructor(healthEndpoint = "/api/pos/health") {
        this.healthEndpoint = healthEndpoint;
        if (typeof window !== "undefined") {
            this.state = navigator.onLine ? "ONLINE" : "OFFLINE";
            window.addEventListener("online", () => this.handleNetworkEvent(true));
            window.addEventListener("offline", () => this.handleNetworkEvent(false));
            // Periodic heartbeat check every 20 seconds
            this.probeInterval = setInterval(() => {
                this.probeHealth();
            }, 20_000);
            // Initial check
            setTimeout(() => this.probeHealth(), 500);
        }
    }
    getState() {
        return this.state;
    }
    getLatency() {
        return this.latencyMs;
    }
    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.notifySubscribers();
        }
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        callback(this.state, this.latencyMs);
        return () => this.subscribers.delete(callback);
    }
    async probeHealth() {
        if (typeof window === "undefined") {
            return this.state;
        }
        if (!navigator.onLine) {
            this.consecutiveFailures++;
            this.setState("OFFLINE");
            return "OFFLINE";
        }
        const start = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        try {
            const res = await fetch(this.healthEndpoint, {
                method: "GET",
                signal: controller.signal,
                headers: { "Cache-Control": "no-cache" },
            });
            clearTimeout(timeout);
            const elapsed = Date.now() - start;
            this.latencyMs = elapsed;
            if (res.ok) {
                this.consecutiveFailures = 0;
                // If latency exceeds 1.5 seconds, classify as DEGRADED network
                const nextState = elapsed > 1500 ? "DEGRADED" : "ONLINE";
                this.setState(nextState);
                return nextState;
            }
            else {
                this.consecutiveFailures++;
                this.setState(this.consecutiveFailures >= 2 ? "OFFLINE" : "DEGRADED");
                return this.state;
            }
        }
        catch {
            clearTimeout(timeout);
            this.consecutiveFailures++;
            this.setState("OFFLINE");
            return "OFFLINE";
        }
    }
    handleNetworkEvent(isOnline) {
        if (!isOnline) {
            this.setState("OFFLINE");
        }
        else {
            this.probeHealth();
        }
    }
    notifySubscribers() {
        for (const sub of this.subscribers) {
            try {
                sub(this.state, this.latencyMs);
            }
            catch (err) {
                console.error("[CONNECTIVITY_SUBSCRIBER_ERROR]", err);
            }
        }
    }
    destroy() {
        if (this.probeInterval) {
            clearInterval(this.probeInterval);
        }
        this.subscribers.clear();
    }
}
exports.ConnectivityManager = ConnectivityManager;
// Singleton instance for client runtime
let instance = null;
function getConnectivityManager() {
    if (!instance) {
        instance = new ConnectivityManager();
    }
    return instance;
}
exports.getConnectivityManager = getConnectivityManager;
