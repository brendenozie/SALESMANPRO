import { headers, cookies } from "next/headers";

export interface ServerFetchResult<T = any> {
  success: boolean;
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  message?: string;
}

/**
 * Universal Server Component fetch helper.
 * Resolves the internal origin dynamically to construct absolute URLs,
 * forwards incoming authentication cookies, and prevents SSR crashes.
 */
export async function serverFetch<T = any>(
  path: string,
  options?: {
    revalidate?: number | false;
    cache?: RequestCache;
    headers?: Record<string, string>;
    cookieHeader?: string;
  }
): Promise<ServerFetchResult<T>> {
  try {
    let fullUrl = path;

    if (!path.startsWith("http://") && !path.startsWith("https://")) {
      let host = "localhost:3000";
      let protocol = "http";

      try {
        const headersList = await headers();
        const headerHost = headersList.get("x-forwarded-host") || headersList.get("host");
        const headerProto = headersList.get("x-forwarded-proto");

        if (headerHost) host = headerHost;
        if (headerProto) {
          protocol = headerProto;
        } else if (headerHost && (headerHost.includes("localhost") || headerHost.includes("127.0.0.1") || headerHost.includes(":3000") || headerHost.includes(":3001"))) {
          protocol = "http";
        } else if (process.env.NODE_ENV === "production" && !headerHost?.includes("localhost")) {
          protocol = "https";
        }
      } catch {
        // In static or detached contexts, fall back to environment variables
        const appUrl = process.env.INTERNAL_API_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
        if (appUrl) {
          try {
            const parsed = new URL(appUrl);
            host = parsed.host;
            protocol = parsed.protocol.replace(":", "");
          } catch {}
        }
      }

      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      fullUrl = `${protocol}://${host}${cleanPath}`;
    }

    let cookie = options?.cookieHeader;
    if (!cookie) {
      try {
        const cookieStore = await cookies();
        cookie = cookieStore.toString();
      } catch {}
    }

    const requestHeaders: Record<string, string> = {
      ...(cookie ? { cookie } : {}),
      ...(options?.headers || {}),
    };

    const fetchOptions: RequestInit = {
      headers: requestHeaders,
    };

    if (options?.revalidate !== undefined) {
      fetchOptions.next = { revalidate: options.revalidate };
    } else if (options?.cache) {
      fetchOptions.cache = options.cache;
    } else {
      fetchOptions.next = { revalidate: 60 };
    }

    const res = await fetch(fullUrl, fetchOptions);

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        ok: false,
        status: res.status,
        data: null,
        error: `Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`,
        message: `Server returned non-JSON response (${res.status})`,
      };
    }

    const json = await res.json();
    // Normalize formatResponse { success: true, data: T }
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
        // Handle legacy double nesting { data: { data: T } }
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
      error: !res.ok || !isSuccess ? (extractedError || json?.message || `HTTP ${res.status}`) : undefined,
      message: json?.message || extractedError,
    };
  } catch (err: any) {
    console.error(`[serverFetch Error] ${path}:`, err?.message || err);
    return {
      success: false,
      ok: false,
      status: 500,
      data: null,
      error: err?.message || "Internal server fetch error",
      message: err?.message || "Internal server fetch error",
    };
  }
}

export const serverFetchJson = serverFetch;
