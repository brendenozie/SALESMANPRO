/**
 * app/site/[slug]/feed/page.tsx
 *
 * Route for /site/[slug]/feed (e.g. /site/ghuba/feed or subdomain rewrites)
 */

import { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { getGhubaFeed } from "@/lib/ghuba-feed-service";
import { GhubaFeedContainer } from "@/components/ghuba/feed/GhubaFeedContainer";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return {
    title: "Ghuba Reels — Discover & Shop Video Feed",
    description:
      "Explore products, services, properties, and vehicles with immersive video discovery and instant checkout on Ghuba Marketplace.",
    openGraph: {
      title: "Ghuba Reels — Discover & Shop Video Feed",
      description:
        "Immersive full-screen vertical marketplace discovery experience on Ghuba.",
      type: "website",
    },
  };
}

export default async function SiteSlugFeedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getAuthSession();
  const userId = (session?.user as any)?.id || null;

  const initialFeed = await getGhubaFeed({
    limit: 10,
    userId,
  });

  return (
    <GhubaFeedContainer
      initialItems={initialFeed.items}
      initialCursor={initialFeed.nextCursor}
      backUrl={slug && slug !== "ghuba" ? `/site/${slug}` : "/site/ghuba"}
    />
  );
}
