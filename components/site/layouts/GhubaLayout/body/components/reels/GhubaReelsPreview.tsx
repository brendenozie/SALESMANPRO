"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FilmIcon, PlayIcon, ArrowRightIcon, EyeIcon } from "@heroicons/react/24/solid";
import { tracker } from "@/lib/analytics/tracker";
import { InteractionEventType, InteractionChannel } from "@/lib/analytics/types";

export interface ReelItem {
  id: string;
  title: string;
  merchant: string;
  location: string;
  price: string;
  views: string;
  thumbnail: string;
  slug: string;
  hasVideo?: boolean;
  listingId?: string;
}

const FEATURED_REELS: ReelItem[] = [
  {
    id: "reel-1",
    title: "Air Jordan 1 High Heritage Unboxing",
    merchant: "Kicks Nairobi",
    location: "CBD, Nairobi",
    price: "KES 6,500",
    views: "4.2K",
    thumbnail: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80",
    slug: "fashion",
  },
  {
    id: "reel-2",
    title: "Mazda CX-5 2018 Walkaround & Sound Check",
    merchant: "Nairobi Prestige Motors",
    location: "Langata Rd, Karen",
    price: "KES 2,450,000",
    views: "8.9K",
    thumbnail: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
    slug: "cars",
  },
  {
    id: "reel-3",
    title: "Sony WH-1000XM5 Active Noise Test",
    merchant: "Gadget Point KE",
    location: "Tom Mboya St, Nairobi",
    price: "KES 42,000",
    views: "3.1K",
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    slug: "electronics",
  },
  {
    id: "reel-4",
    title: "Modern 7-Seater Velvet Emerald Sofa Tour",
    merchant: "Comfort Living Furnishings",
    location: "New Njiru Town, Kangundo Rd",
    price: "KES 85,000",
    views: "6.5K",
    thumbnail: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
    slug: "furniture",
  },
  {
    id: "reel-5",
    title: "2-Bedroom Fully Furnished Kilimani Apt",
    merchant: "Prime Nairobi Properties",
    location: "Kilimani, Nairobi",
    price: "KES 95,000/mo",
    views: "11.4K",
    thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
    slug: "property",
  },
];

interface GhubaReelsPreviewProps {
  reels?: ReelItem[];
}

export default function GhubaReelsPreview({ reels }: GhubaReelsPreviewProps) {
  const displayReels = reels && reels.length > 0 ? reels : FEATURED_REELS;

  return (
    <section className="py-10 md:py-16 bg-zinc-950 text-white overflow-hidden relative border-y border-zinc-800/80">
      {/* Background Ambient Glow */}
      <div className="absolute left-1/4 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 bottom-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Live Video Feed
              </span>
              <span className="text-xs font-bold text-zinc-400">See Items in Action</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tight">
              Watch <span className="text-amber-500 italic">Merchant Reels</span>
            </h2>
          </div>

          <Link
            href="/ghuba/feed"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 self-start sm:self-auto active:scale-95"
          >
            <FilmIcon className="w-4 h-4" />
            <span>Open Reels Feed</span>
            <ArrowRightIcon className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>

        {/* Video Cards Strip */}
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
          {displayReels.map((reel) => (
            <Link
              key={reel.id}
              href={reel.listingId ? `/ghuba/feed?item=${reel.listingId}` : `/ghuba/feed`}
              onClick={() => {
                tracker.track({
                  eventType: InteractionEventType.REEL_CLICK,
                  channel: InteractionChannel.REELS,
                  metadata: {
                    reelId: reel.id,
                    title: reel.title,
                    merchant: reel.merchant,
                  },
                });
              }}
              className="group relative flex-shrink-0 w-[200px] sm:w-[240px] md:w-[260px] aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl snap-start flex flex-col justify-between p-4"
            >
              {/* Background Poster Image */}
              <Image
                src={reel.thumbnail}
                alt={reel.title}
                fill
                sizes="(max-width: 640px) 200px, 260px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60 group-hover:from-black/90 transition-colors" />

              {/* Top Meta Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-black/60 backdrop-blur-md text-white border border-white/10">
                  <EyeIcon className="w-3 h-3 text-amber-400" />
                  {reel.views}
                </span>

                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all">
                  <PlayIcon className="w-4 h-4 ml-0.5" />
                </div>
              </div>

              {/* Bottom Details */}
              <div className="relative z-10 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {reel.merchant} • {reel.location}
                </span>
                <h3 className="text-sm font-black text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                  {reel.title}
                </h3>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-black text-white bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    {reel.price}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Watch <ArrowRightIcon className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
