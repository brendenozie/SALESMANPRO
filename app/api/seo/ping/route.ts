import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifySearchEnginesOfUpdate } from "@/lib/seo/update-notifier";
import { PRIMARY_PLATFORM_DOMAIN, PRIMARY_GHUBA_DOMAIN } from "@/lib/seo/canonical-builder";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { target = "ALL" } = body;

    const urlsToPing: { url: string; siteType: "SALESMANPRO" | "GHUBA" | "TENANT_STORE" }[] = [];

    if (target === "ALL" || target === "SALESMANPRO") {
      urlsToPing.push({
        url: `https://${PRIMARY_PLATFORM_DOMAIN}/sitemap.xml`,
        siteType: "SALESMANPRO",
      });
    }

    if (target === "ALL" || target === "GHUBA") {
      urlsToPing.push({
        url: `https://${PRIMARY_GHUBA_DOMAIN}/sitemap.xml`,
        siteType: "GHUBA",
      });
    }

    const results = await Promise.all(
      urlsToPing.map(async (item) => {
        const res = await notifySearchEnginesOfUpdate({
          url: item.url,
          siteType: item.siteType,
        });
        return { target: item.url, result: res };
      })
    );

    return NextResponse.json({
      success: true,
      message: `IndexNow ping dispatched to search engines (Bing, Yandex, IndexNow network) for ${results.length} targets.`,
      dispatchedAt: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error("Failed to ping search engines:", error);
    return NextResponse.json(
      { error: error?.message || "Search engine notification failed" },
      { status: 500 }
    );
  }
}
