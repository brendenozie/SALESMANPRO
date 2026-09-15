import { MetadataRoute } from "next";
import { headers } from "next/headers";
import siteMetadata from "@/data/siteMetadata";
import { cleanHost } from "@/lib/seo/canonical-builder";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let host = siteMetadata.siteUrl.replace(/^https?:\/\//, "");

  try {
    const headersList = await headers();
    const rawHost = headersList.get("host");
    if (rawHost) {
      host = cleanHost(rawHost);
    }
  } catch {
    // Fallback during static analysis
  }

  const isGhuba = host === "ghuba.shop" || host.startsWith("ghuba.");
  const isPrimary = host === "salesmanpro.site" || host === "www.salesmanpro.site";

  // Common private paths blocked across all hosts
  const commonDisallows = [
    "/admin",
    "/admin/",
    "/dashboards",
    "/dashboards/",
    "/super-admin",
    "/super-admin/",
    "/agent",
    "/agent/",
    "/api/",
    "/payments",
    "/payments/",
    "/checkout",
    "/checkout/",
    "/desktop-login",
    "/verify-email",
    "/unauthorized",
    "/site/", // Prevent raw internal Next.js multi-tenant routing paths
  ];

  // Specific rules based on host surface
  const disallows = [...commonDisallows];

  if (isGhuba) {
    // Ghuba internal cart and tracking pages
    disallows.push("/ghuba/cart", "/ghuba/checkout", "/ghuba/profile", "/ghuba/orderTracking");
  }

  const baseUrl = `https://${host}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/static/",
          "/favicons/",
          "/_next/static/",
        ],
        disallow: disallows,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
