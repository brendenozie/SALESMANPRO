/**
 * lib/notifications/clientBridge.ts
 *
 * Client-Side Cross-Platform Notification Bridge for SalesmanPro.
 * Seamlessly interfaces with:
 * 1. Web Browsers (Web Push / in-app audio chime & badge)
 * 2. Android App (Kotlin WebAppInterface via window.Android / window.AndroidBridge)
 * 3. Windows Desktop App (WPF WebView2 via window.chrome.webview)
 */

export interface NativeNotificationPayload {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  actionUrl?: string;
  eventType?: string;
}

export class ClientNotificationBridge {
  /**
   * Detects the host runtime environment.
   */
  public static getPlatform(): "ANDROID" | "WINDOWS_DESKTOP" | "WEB" {
    if (typeof window === "undefined") return "WEB";

    // 1. Check for Android JavascriptInterface bridge
    if ((window as any).Android || (window as any).AndroidBridge) {
      return "ANDROID";
    }

    // 2. Check for Windows Desktop WPF WebView2 bridge
    if ((window as any).chrome?.webview?.postMessage) {
      return "WINDOWS_DESKTOP";
    }

    // 3. Standard browser
    return "WEB";
  }

  /**
   * Registers the current client device with the backend notification authority.
   */
  public static async registerDevice(deviceName?: string): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const platform = this.getPlatform();
    let pushToken = "";

    if (platform === "WINDOWS_DESKTOP") {
      // Generate or retrieve persistent machine token for desktop session
      pushToken = localStorage.getItem("sp_desktop_device_id") || "";
      if (!pushToken) {
        pushToken = `wpf_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
        localStorage.setItem("sp_desktop_device_id", pushToken);
      }
    } else if (platform === "ANDROID") {
      // Query token from Android Native Bridge if exposed
      pushToken = (window as any).Android?.getPushToken?.() || "";
      if (!pushToken) {
        pushToken = localStorage.getItem("sp_android_device_id") || "";
        if (!pushToken) {
          pushToken = `android_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
          localStorage.setItem("sp_android_device_id", pushToken);
        }
      }
    } else {
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
    } catch {
      return false;
    }
  }

  /**
   * Forwards a notification to native host containers (WPF or Android) for native OS notifications.
   */
  public static dispatchToNativeContainer(notification: NativeNotificationPayload): void {
    if (typeof window === "undefined") return;

    const platform = this.getPlatform();

    if (platform === "WINDOWS_DESKTOP") {
      try {
        (window as any).chrome.webview.postMessage({
          type: "SHOW_NOTIFICATION",
          payload: {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            severity: notification.severity,
            actionUrl: notification.actionUrl,
          },
        });
      } catch (err) {
        console.warn("[ClientNotificationBridge] Failed to post message to WebView2:", err);
      }
    } else if (platform === "ANDROID") {
      try {
        const bridge = (window as any).Android || (window as any).AndroidBridge;
        if (bridge?.postMessage) {
          bridge.postMessage(
            JSON.stringify({
              type: "SHOW_NOTIFICATION",
              payload: notification,
            })
          );
        }
      } catch (err) {
        console.warn("[ClientNotificationBridge] Failed to post message to Android bridge:", err);
      }
    }
  }
}
