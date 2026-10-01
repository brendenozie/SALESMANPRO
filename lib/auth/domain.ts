export const HUB_HOSTS = new Set([
  "salesmanpro.site",
  "www.salesmanpro.site",
  "localhost",
  "127.0.0.1",
]);

export const AUTH_HOSTS = new Set(["auth.salesmanpro.site"]);

export const GHUBA_HOSTS = new Set(["ghuba.shop", "www.ghuba.shop"]);

export const PLATFORM_ROOT = "salesmanpro.site";
export const AUTH_HOST = "auth.salesmanpro.site";
export const HUB_URL = "https://salesmanpro.site";
export const AUTH_URL = "https://auth.salesmanpro.site";

export type SignupOriginKind = "hub" | "auth" | "store_subdomain" | "custom_domain" | "ghuba" | "unknown";

export type ClassifiedHost = {
  host: string;
  kind: SignupOriginKind;
  slug: string | null;
};

export function normalizeHost(input: string | null | undefined): string {
  if (!input) return "";
  return input.split(":")[0].trim().toLowerCase().replace(/^www\./, "");
}

export function hostFromUrl(value: string | null | undefined): string {
  if (!value) return "";
  try {
    const url = value.startsWith("http")
      ? new URL(value)
      : new URL(value, "https://placeholder.invalid");
    if (!value.startsWith("http")) return "";
    return normalizeHost(url.hostname);
  } catch {
    return "";
  }
}

export function classifyHost(rawHost: string | null | undefined): ClassifiedHost {
  const host = normalizeHost(rawHost);
  if (!host) return { host: "", kind: "unknown", slug: null };

  if (AUTH_HOSTS.has(host) || host === AUTH_HOST) {
    return { host, kind: "auth", slug: null };
  }

  if (HUB_HOSTS.has(host) || HUB_HOSTS.has(`www.${host}`)) {
    return { host, kind: "hub", slug: null };
  }

  if (GHUBA_HOSTS.has(host) || GHUBA_HOSTS.has(`www.${host}`) || host === "ghuba") {
    return { host, kind: "ghuba", slug: "ghuba" };
  }

  if (host.endsWith(".salesmanpro.site")) {
    const slug = host.replace(/\.salesmanpro\.site$/, "");
    if (!slug || slug === "www" || slug === "auth") {
      return { host, kind: slug === "auth" ? "auth" : "unknown", slug: null };
    }
    if (slug === "ghuba") {
      return { host, kind: "ghuba", slug: "ghuba" };
    }
    return { host, kind: "store_subdomain", slug };
  }

  return { host, kind: "custom_domain", slug: host };
}

/** Hub signup is the only path that provisions a new business ADMIN. */
export function isBusinessAdminSignupKind(kind: SignupOriginKind): boolean {
  return kind === "hub";
}

export function isStorefrontSignupKind(kind: SignupOriginKind): boolean {
  return kind === "store_subdomain" || kind === "custom_domain" || kind === "ghuba";
}

export function isStaticallyAllowedReturnHost(host: string): boolean {
  const classified = classifyHost(host);
  if (!classified.host) return false;
  if (classified.kind === "auth") return false;
  if (classified.kind === "unknown") return false;
  if (classified.kind === "custom_domain") return false;
  return true;
}

export function parseAbsoluteUrl(value: string | null | undefined): URL | null {
  if (!value) return null;
  try {
    let decoded = value.trim();
    // Safely unroll nested percent-encoding up to 3 levels
    for (let i = 0; i < 3; i++) {
      if (decoded.includes("%")) {
        try {
          const next = decodeURIComponent(decoded);
          if (next === decoded) break;
          decoded = next;
        } catch {
          break;
        }
      } else {
        break;
      }
    }
    const url = new URL(decoded);
    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:" &&
      !(url.protocol === "salesmanpro:" && url.hostname === "callback")
    ) {
      return null;
    }
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function defaultPostAuthPath(kind: SignupOriginKind, canUseDashboard: boolean): string {
  if (kind === "hub" && canUseDashboard) return "/dashboards";
  return "/";
}

export function hubDashboardUrl(): string {
  return `${HUB_URL}/dashboards`;
}

export function signupCopy(kind: SignupOriginKind, storeName?: string): { title: string; subtitle: string } {
  if (kind === "hub") {
    return {
      title: "Create your SalesmanPro business account",
      subtitle: "You'll get dashboard access after you verify your email.",
    };
  }
  if (kind === "ghuba") {
    return {
      title: "Create your Ghuba marketplace account",
      subtitle: "Shop and track orders on Ghuba. This does not grant store management access.",
    };
  }
  if (kind === "store_subdomain" || kind === "custom_domain") {
    return {
      title: storeName ? `Create your account with ${storeName}` : "Create your store account",
      subtitle: "You're signing up as a customer of this store, not as a store administrator.",
    };
  }
  return {
    title: "Create your account",
    subtitle: "powered by salesmanpro",
  };
}
