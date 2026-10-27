"use strict";
/**
 * lib/notifications/clientBridge.ts
 *
 * Client-Side Cross-Platform Notification Bridge for SalesmanPro.
 * Seamlessly interfaces with:
 * 1. Web Browsers (Web Push / in-app audio chime & badge)
 * 2. Android App (Kotlin WebAppInterface via window.Android / window.AndroidBridge)
 * 3. Windows Desktop App (WPF WebView2 via window.chrome.webview)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientNotificationBridge = void 0;
class ClientNotificationBridge {
    /**
     * Detects the host runtime environment.
     */
    static getPlatform() {
        if (typeof window === "undefined")
            return "WEB";
        // 1. Check for Android JavascriptInterface bridge
        if (window.Android || window.AndroidBridge) {
            return "ANDROID";
        }
        // 2. Check for Windows Desktop WPF WebView2 bridge
        if (window.chrome?.webview?.postMessage) {
            return "WINDOWS_DESKTOP";
        }
        // 3. Standard browser
        return "WEB";
    }
    /**
     * Registers the current client device with the backend notification authority.
     */
    static async registerDevice(deviceName) {
        if (typeof window === "undefined")
            return false;
        const platform = this.getPlatform();
        let pushToken = "";
        if (platform === "WINDOWS_DESKTOP") {
            // Generate or retrieve persistent machine token for desktop session
            pushToken = localStorage.getItem("sp_desktop_device_id") || "";
            if (!pushToken) {
                pushToken = `wpf_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
                localStorage.setItem("sp_desktop_device_id", pushToken);
            }
        }
        else if (platform === "ANDROID") {
            // Query token from Android Native Bridge if exposed
            pushToken = window.Android?.getPushToken?.() || "";
            if (!pushToken) {
                pushToken = localStorage.getItem("sp_android_device_id") || "";
                if (!pushToken) {
                    pushToken = `android_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
                    localStorage.setItem("sp_android_device_id", pushToken);
                }
            }
        }
        else {
            // Web Push
            pushToken = localStorage.getItem("sp_web_device_id") || "";
            if (!pushToken) {
                pushToken = `web_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
                localStorage.setItem("sp_web_device_id", pushToken);
            }
        }
        try {
            const res = await fetch("/api/notifications/devices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    platform,
                    pushToken,
                    deviceName: deviceName || (platform === "WINDOWS_DESKTOP" ? "SalesmanPro Desktop Terminal" : "Web Client"),
                    appVersion: "2.1.0",
                }),
            });
            return res.ok;
        }
        catch {
            return false;
        }
    }
    /**
     * Subscribes the current browser to Web Push using the VAPID key and public/sw.js.
     */
    static async subscribeWebPush() {
        if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
            return false;
        }
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted")
                return false;
            const reg = await navigator.serviceWorker.register("/sw.js");
            await navigator.serviceWorker.ready;
            const vapidRes = await fetch("/api/notifications/vapid-key");
            const { publicKey } = await vapidRes.json();
            if (!publicKey)
                return false;
            const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
            const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: outputArray,
            });
            const res = await fetch("/api/notifications/devices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    platform: "WEB",
                    pushToken: JSON.stringify(subscription),
                    deviceName: navigator.userAgent.slice(0, 50) || "PWA / Web Client",
                    appVersion: "2.1.0",
                }),
            });
            return res.ok;
        }
        catch (err) {
            console.warn("[ClientNotificationBridge] Web Push subscription error:", err);
            return false;
        }
    }
    /**
     * Forwards a notification to native host containers (WPF or Android) for native OS notifications.
     */
    static dispatchToNativeContainer(notification) {
        if (typeof window === "undefined")
            return;
        const platform = this.getPlatform();
        if (platform === "WINDOWS_DESKTOP") {
            try {
                window.chrome.webview.postMessage({
                    type: "SHOW_NOTIFICATION",
                    payload: {
                        id: notification.id,
                        title: notification.title,
                        message: notification.message,
                        severity: notification.severity,
                        actionUrl: notification.actionUrl,
                    },
                });
            }
            catch (err) {
                console.warn("[ClientNotificationBridge] Failed to post message to WebView2:", err);
            }
        }
        else if (platform === "ANDROID") {
            try {
                const bridge = window.Android || window.AndroidBridge;
                if (bridge?.postMessage) {
                    bridge.postMessage(JSON.stringify({
                        type: "SHOW_NOTIFICATION",
                        payload: notification,
                    }));
                }
            }
            catch (err) {
                console.warn("[ClientNotificationBridge] Failed to post message to Android bridge:", err);
            }
        }
    }
}
exports.ClientNotificationBridge = ClientNotificationBridge;
