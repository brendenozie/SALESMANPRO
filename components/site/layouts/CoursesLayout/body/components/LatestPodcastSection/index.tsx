"use client";

import React from "react";
import { motion } from "framer-motion";
import { EditableElement } from "@/components/site/EditableElement";

const fallbackPodcasts = [
  { title: "Social Media Power: Amplifying Your Blog's Reach", img: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?q=80&w=800&auto=format&fit=crop" },
  { title: "SEO Mastery: How to Rank Higher on Google", img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop" },
  { title: "Monetizing Your Blog: Turning Passion into Profit", img: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=800&auto=format&fit=crop" },
];

export interface LatestPodcastSectionProps {
  Podcast?: any[];
  themeSettings?: Record<string, any> | null;
  storeFormData?: any;
}

export default function LatestPodcastSection({ Podcast, themeSettings }: LatestPodcastSectionProps = {}) {
  const podcasts = Array.isArray(Podcast) && Podcast.length > 0 ? Podcast.slice(0, 3) : fallbackPodcasts;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Latest Podcast Header */}
      <EditableElement
        targetId="home.podcasts.title"
        componentKey="LatestPodcastSection"
        elementKey="title"
        label="Podcast Section Title"
        defaultValue="Latest Podcast"
      >
        <h2 className="text-2xl font-semibold mb-6">Latest Podcast</h2>
      </EditableElement>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts.map((pc: any, idx: number) => {
          const imgUrl = pc.img || pc.coverImage || pc.imageUrl || fallbackPodcasts[idx % fallbackPodcasts.length].img;
          const title = pc.title || fallbackPodcasts[idx % fallbackPodcasts.length].title;

          return (
            <motion.div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-md flex flex-col border border-zinc-100 dark:border-zinc-800"
              whileHover={{ scale: 1.02 }}
            >
              <EditableElement
                targetId={`home.podcasts.podcasts.${idx}.imageUrl`}
                componentKey="LatestPodcastSection"
                elementKey={`podcasts.${idx}.imageUrl`}
                label={`Podcast ${idx + 1} Image`}
                fieldType="image"
                defaultValue={imgUrl}
              >
                <img src={imgUrl} alt={title} className="w-full h-40 object-cover" />
              </EditableElement>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <EditableElement
                  targetId={`home.podcasts.podcasts.${idx}.title`}
                  componentKey="LatestPodcastSection"
                  elementKey={`podcasts.${idx}.title`}
                  label={`Podcast ${idx + 1} Title`}
                  defaultValue={title}
                >
                  <h3 className="font-semibold text-lg mb-4 text-zinc-900 dark:text-zinc-100">{title}</h3>
                </EditableElement>

                <EditableElement
                  targetId={`home.podcasts.podcasts.${idx}.cta`}
                  componentKey="LatestPodcastSection"
                  elementKey={`podcasts.${idx}.cta`}
                  label={`Podcast ${idx + 1} CTA`}
                  defaultValue="Listen Now"
                  inline
                >
                  <button className="mt-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition font-medium text-sm">
                    Listen Now
                  </button>
                </EditableElement>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <EditableElement
          targetId="home.podcasts.browseAllCta"
          componentKey="LatestPodcastSection"
          elementKey="browseAllCta"
          label="Browse All Podcasts Button"
          defaultValue="Browse All Podcasts"
          inline
        >
          <button className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full transition font-medium">
            Browse All Podcasts
          </button>
        </EditableElement>
      </div>
    </section>
  );
}
