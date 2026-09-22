export interface ClientFetchResult<T = any> {
  success: boolean;
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  message?: string;
  rawJson?: any;
}

/**
 * Universal safe client fetch helper.
 * Eliminates "Unexpected token '<', '<!DOCTYPE '... is not valid JSON" crashes
 * by verifying content-type before parsing and normalizing response payloads.
 */
export async function clientFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<ClientFetchResult<T>> {
  try {
    const defaultHeaders: Record<string, string> = {};
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
    let extractedError: string | undefined = undefined;

    if (json && typeof json === "object") {
      if ("error" in json && json.error) {
        extractedError = typeof json.error === "string" ? json.error : json.error.message || json.message;
      } else if ("message" in json && !res.ok) {
        extractedError = json.message;
      }

      if ("data" in json) {
        extractedData = json.data;
        // Handle double nesting { data: { data: T } }
        if (extractedData && typeof extractedData === "object" && "data" in extractedData && !Array.isArray(extractedData)) {
          extractedData = (extractedData as any).data;
        }
      }
    }

    const isSuccess = res.ok && (json && typeof json === "object" && "success" in json ? Boolean(json.success) : true);

    return {
      success: isSuccess,
      ok: res.ok,
      status: res.status,
      data: extractedData as T,
      error: !res.ok || !isSuccess ? (extractedError || json?.message || `Request failed with status ${res.status}`) : undefined,
      message: extractedError || json?.message,
      rawJson: json,
    };
  } catch (err: any) {
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

