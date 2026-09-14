/**
 * app/ghuba/feed/page.tsx
 *
 * Standalone direct route for Ghuba marketplace full-screen video feed.
 */

import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getGhubaFeed } from "@/lib/ghuba-feed-service";
import { GhubaFeedContainer } from "@/components/ghuba/feed/GhubaFeedContainer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ghuba Reels — Immersive Commerce Discovery Feed",
  description:
    "Discover real products, verified services, cars, and properties across Kenya with vertical video reels and instant checkout on Ghuba.",
  openGraph: {
    title: "Ghuba Reels — Immersive Commerce Discovery Feed",
    description:
      "Vertical video reels and instant shopping on Ghuba Marketplace.",
    type: "website",
  },
};

export default async function GhubaDirectFeedPage() {
  const session = await getServerSession(authOptions());
  const userId = (session?.user as any)?.id || null;

  const initialFeed = await getGhubaFeed({
    limit: 10,
    userId,
  });

  return (
    <GhubaFeedContainer
      initialItems={initialFeed.items}
      initialCursor={initialFeed.nextCursor}
      backUrl="/site/ghuba"
    />
  );
}
