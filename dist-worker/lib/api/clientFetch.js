"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientFetchJson = void 0;
/**
 * Universal safe client fetch helper.
 * Eliminates "Unexpected token '<', '<!DOCTYPE '... is not valid JSON" crashes
 * by verifying content-type before parsing and normalizing response payloads.
 */
async function clientFetchJson(url, options) {
    try {
        const defaultHeaders = {};
        if (options?.body && typeof options.body === "string" && !options.headers) {
            defaultHeaders["Content-Type"] = "application/json";
        }
        const res = await fetch(url, {
            credentials: "include",
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options?.headers || {}),
            },
        });
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            const text = await res.text().catch(() => "");
            const isHtml = text.trim().startsWith("<!DOCTYPE") || text.includes("<html");
            const errorMsg = isHtml
                ? `API route returned an HTML ${res.status} error page instead of JSON (${url})`
                : `Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`;
            return {
                success: false,
                ok: false,
                status: res.status,
                data: null,
                error: errorMsg,
                message: errorMsg,
            };
        }
        const json = await res.json();
        let extractedData = json;
        let extractedError = undefined;
        if (json && typeof json === "object") {
            if ("error" in json && json.error) {
                extractedError = typeof json.error === "string" ? json.error : json.error.message || json.message;
            }
            else if ("message" in json && !res.ok) {
                extractedError = json.message;
            }
            if ("data" in json) {
                extractedData = json.data;
                // Handle double nesting { data: { data: T } }
                if (extractedData && typeof extractedData === "object" && "data" in extractedData && !Array.isArray(extractedData)) {
                    extractedData = extractedData.data;
                }
            }
        }
        const isSuccess = res.ok && (json && typeof json === "object" && "success" in json ? Boolean(json.success) : true);
        return {
            success: isSuccess,
            ok: res.ok,
            status: res.status,
            data: extractedData,
            error: !res.ok || !isSuccess ? (extractedError || json?.message || `Request failed with status ${res.status}`) : undefined,
            message: extractedError || json?.message,
            rawJson: json,
        };
    }
    catch (err) {
        console.error(`[clientFetchJson Error] ${url}:`, err);
        return {
            success: false,
            ok: false,
            status: 0,
            data: null,
            error: err?.message || "Network request failed",
            message: err?.message || "Network request failed",
        };
    }
}
exports.clientFetchJson = clientFetchJson;
