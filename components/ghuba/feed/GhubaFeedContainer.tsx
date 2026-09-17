"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import { GhubaFeedItem as GhubaFeedItemType, FeedListingType } from "@/lib/ghuba-feed-service";
import { GhubaFeedItem } from "./GhubaFeedItem";
import { GhubaFeedFilter } from "./GhubaFeedFilter";
import { GhubaCommentDrawer } from "./GhubaCommentDrawer";
import { GhubaEnquiryModal } from "./GhubaEnquiryModal";

interface GhubaFeedContainerProps {
  initialItems?: GhubaFeedItemType[];
  initialCursor?: string | null;
  backUrl?: string;
}

export const GhubaFeedContainer: React.FC<GhubaFeedContainerProps> = ({
  initialItems = [],
  initialCursor = null,
  backUrl = "/",
}) => {
  const [items, setItems] = useState<GhubaFeedItemType[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<FeedListingType | null>(null);

  // Modals & Drawers
  const [commentItem, setCommentItem] = useState<GhubaFeedItemType | null>(null);
  const [enquiryItem, setEnquiryItem] = useState<GhubaFeedItemType | null>(null);
  const [enquiryMode, setEnquiryMode] = useState<"BOOKING" | "ENQUIRY">("ENQUIRY");

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const impressionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load feed items when type changes or on initial mount if empty
  const fetchFeed = useCallback(
    async (typeFilter: FeedListingType | null, nextCursor: string | null = null, append: boolean = false) => {
      try {
        if (!append) setItems([]);
        const params = new URLSearchParams();
        params.set("limit", "10");
        if (typeFilter) params.set("type", typeFilter);
        if (nextCursor) params.set("cursor", nextCursor);

        const res = await fetch(`/api/ghuba/feed?${params.toString()}`);
        if (!res.ok) throw new Error("Feed fetch failed");

        const data = await res.json();
        const newItems: GhubaFeedItemType[] = data.items || [];

        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setCursor(data.nextCursor || null);
        setHasMore(Boolean(data.hasMore));
      } catch (err: any) {
        console.error("Error fetching feed:", err);
        toast.error("Could not load marketplace feed");
      }
    },
    []
  );

  useEffect(() => {
    if (initialItems.length === 0) {
      fetchFeed(selectedType);
    }
  }, [fetchFeed, initialItems.length, selectedType]);

  // Infinite Scroll: fetch more when nearing the end
  useEffect(() => {
    if (activeIndex >= items.length - 3 && hasMore && !isLoadingMore && cursor) {
      setIsLoadingMore(true);
      fetchFeed(selectedType, cursor, true).finally(() => {
        setIsLoadingMore(false);
      });
    }
  }, [activeIndex, items.length, hasMore, isLoadingMore, cursor, selectedType, fetchFeed]);

  // Viewport IntersectionObserver to track active slide
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.65,
      }
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  // Analytics: Record impression when item stays active for >= 1.2 seconds
  useEffect(() => {
    if (impressionTimerRef.current) clearTimeout(impressionTimerRef.current);

    const currentItem = items[activeIndex];
    if (!currentItem) return;

    impressionTimerRef.current = setTimeout(() => {
      fetch("/api/ghuba/feed/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FEED_IMPRESSION",
          listingId: currentItem.listingId,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }, 1200);

    return () => {
      if (impressionTimerRef.current) clearTimeout(impressionTimerRef.current);
    };
  }, [activeIndex, items]);

  // Intelligent bounded prefetch for NEXT slide media (current + 1 only)
  useEffect(() => {
    const nextItem = items[activeIndex + 1];
    if (!nextItem || typeof window === "undefined") return;

    // Check if user has Save-Data enabled or is on slow network
    const nav = navigator as any;
    if (nav?.connection?.saveData || nav?.connection?.effectiveType === "2g") {
      return; // Skip prefetch on Save-Data / slow 2G
    }

    const nextPoster = nextItem.media.poster || nextItem.media.images[0];
    if (nextPoster && !nextPoster.startsWith("data:")) {
      const img = new Image();
      img.src = nextPoster;
    }
  }, [activeIndex, items]);

  // Keyboard Navigation: ArrowUp / ArrowDown / Space / M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a modal or input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        const nextIdx = Math.min(items.length - 1, activeIndex + 1);
        scrollToIndex(nextIdx);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const prevIdx = Math.max(0, activeIndex - 1);
        scrollToIndex(prevIdx);
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, items.length]);

  const scrollToIndex = (index: number) => {
    const targetSlide = slideRefs.current[index];
    if (targetSlide) {
      targetSlide.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTypeSelect = (type: FeedListingType | null) => {
    setSelectedType(type);
    setActiveIndex(0);
    fetchFeed(type);
  };

  const handleUpdateEngagement = (listingId: string, updates: Partial<GhubaFeedItemType>) => {
    setItems((prev) =>
      prev.map((it) => (it.listingId === listingId ? { ...it, ...updates } : it))
    );
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Floating Top Filter Header */}
      <GhubaFeedFilter
        currentType={selectedType}
        onSelectType={handleTypeSelect}
        backUrl={backUrl}
      />

      {/* Full-Height Vertical Paged Feed Container */}
      <div
        ref={containerRef}
        className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white/60">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent mb-4" />
            <p className="text-base font-medium text-white">Discovering marketplace listings...</p>
            <p className="text-xs text-white/40 mt-1 max-w-xs">
              Fetching products, verified services, and real deals across Kenya.
            </p>
          </div>
        ) : (
          items.map((item, idx) => {
            // Virtualization window: render fully if within [activeIndex - 1, activeIndex + 1]
            const isWithinVirtualWindow = Math.abs(idx - activeIndex) <= 1;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                data-index={idx}
                className="h-[100dvh] w-full snap-start snap-always"
              >
                {isWithinVirtualWindow ? (
                  <GhubaFeedItem
                    item={item}
                    isActive={idx === activeIndex}
                    isMuted={isMuted}
                    onToggleSound={() => setIsMuted((prev) => !prev)}
                    onOpenComments={(it) => setCommentItem(it)}
                    onOpenBooking={(it) => {
                      setEnquiryItem(it);
                      setEnquiryMode("BOOKING");
                    }}
                    onOpenEnquiry={(it) => {
                      setEnquiryItem(it);
                      setEnquiryMode("ENQUIRY");
                    }}
                    onUpdateEngagement={handleUpdateEngagement}
                  />
                ) : (
                  /* Lightweight placeholder for off-screen slides to preserve snapping */
                  <div className="h-full w-full bg-neutral-950 flex items-center justify-center">
                    <span className="text-neutral-800 text-xs">Ghuba Feed</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* In-Feed Comments Drawer */}
      <GhubaCommentDrawer
        isOpen={Boolean(commentItem)}
        item={commentItem}
        onClose={() => setCommentItem(null)}
        onCommentCountChange={(listingId, count) => {
          handleUpdateEngagement(listingId, {
            engagement: {
              ...(commentItem?.engagement || { likesCount: 0, commentsCount: 0, sharesCount: 0, savesCount: 0 }),
              commentsCount: count,
            },
          });
        }}
      />

      {/* In-Feed Booking / Enquiry Modal */}
      <GhubaEnquiryModal
        isOpen={Boolean(enquiryItem)}
        item={enquiryItem}
        mode={enquiryMode}
        onClose={() => setEnquiryItem(null)}
      />
    </main>
  );
};
