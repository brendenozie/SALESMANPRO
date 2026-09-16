/**
 * components/ghuba/recommendations/GhubaPersonalizedSection.tsx
 *
 * Independent, lazy-loaded personalized recommendations section for Ghuba homepage.
 * Renders dynamically based on visitor interaction telemetry without delaying main page SSR.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SparklesIcon, FireIcon } from '@heroicons/react/24/solid';
import GhubaProductCard from '@/components/site/layouts/GhubaLayout/body/components/GhubaProductCard';
import { tracker } from '@/lib/analytics/tracker';

export default function GhubaPersonalizedSection() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [source, setSource] = useState<string>('trending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const visitorId = tracker.getVisitorId();

    fetch(`/api/ghuba/recommendations?visitorId=${encodeURIComponent(visitorId)}&limit=8`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (isMounted && data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          setSource(data.source || 'personalized');
        }
      })
      .catch(() => {
        // Non-fatal, gracefully collapses if empty
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && recommendations.length === 0) {
    return null; // Gracefully degrade if no recommendations available
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50/50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
              {source === 'personalized' ? (
                <>
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Personalized For You</span>
                </>
              ) : (
                <>
                  <FireIcon className="w-3.5 h-3.5 text-rose-500" />
                  <span>Trending on Ghuba</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {source === 'personalized' ? 'Picks Based On Your Interests' : 'Trending & High-Interest Listings'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Curated in real-time from interaction activity and customer demand.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-slate-100 dark:bg-zinc-800 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommendations.map((product) => (
              <div key={product.id} className="h-full">
                <GhubaProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
