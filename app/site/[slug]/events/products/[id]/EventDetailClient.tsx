"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CalendarIcon,
  MapPinIcon,
  TicketIcon,
  UserGroupIcon,
  ClockIcon,
  InformationCircleIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { IEvent, StoreForm } from "@/types/typings";
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

interface EventDetailClientProps {
  event: IEvent;
  related: IEvent[];
  storeData: StoreForm;
}

export default function EventDetailClient({
  event,
  related,
  storeData,
}: EventDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const primary = storeData.themeSettings?.primaryColor || '#6366f1';
  const secondary = storeData.themeSettings?.secondaryColor || '#4f46e5';

  const [loading, setLoading] = useState(false);

  const isExpired = event.endDateTime
    ? new Date(event.endDateTime) < new Date()
    : false;

  const formattedDate = useMemo(() => {
    if (!event.startDateTime) return "Date TBA";
    return new Date(event.startDateTime).toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [event.startDateTime]);

  const startTime = useMemo(() => {
    if (!event.startDateTime) return "";
    return new Date(event.startDateTime).toLocaleTimeString("en-KE", {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [event.startDateTime]);

  /**
   * MAIN CTA HANDLER
   */
  const handleCheckout = () => {
    if (isExpired || loading) return;
    const targetSlug = storeData?.slug || 'event-ticketing';
    router.push(`/site/${targetSlug}/events/checkout/${event.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* HERO */}
      <section className="relative h-[55vh] rounded-[2.5rem] overflow-hidden bg-zinc-900">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="absolute bottom-0 p-10 text-white max-w-4xl">
          <span
            className="inline-block px-4 py-1.5 text-[10px] font-black tracking-widest rounded-full mb-4"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
          >
            {event.eventType || 'EVENT'}
          </span>

          <h1 className="text-4xl sm:text-6xl font-black italic mb-4">
            {event.title}
          </h1>

          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-zinc-300">
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" />
              {event.location || 'TBA'}
            </span>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="text-2xl font-black italic mb-4">About the Experience</h2>
            <p className="text-zinc-600 leading-relaxed">
              {event.description}
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-50 border">
            <h3 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <InformationCircleIcon className="w-4 h-4" />
              Key Highlights
            </h3>
            <p className="text-sm text-zinc-600">
              {event.summary}
            </p>
          </section>
        </div>

        {/* CHECKOUT SIDEBAR */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="p-8 rounded-[2rem] border bg-zinc-50 space-y-6">
            <div className="flex justify-between">
              <div>
                <p className="text-xs uppercase font-black tracking-widest text-zinc-400">
                  Admission
                </p>
                <h3 className="text-3xl font-black">
                  {event.isPaid ? `KES ${event.price?.toLocaleString()}` : 'FREE'}
                </h3>
              </div>
              <TicketIcon className="w-8 h-8 text-zinc-400" />
            </div>

            {event.tickets && (event.tickets as any[]).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase font-black tracking-widest text-zinc-400">
                  Ticket Options
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(event.tickets as any[]).map((t: any) => {
                    const remaining = Math.max(0, t.quantityTotal - t.quantitySold);
                    return (
                      <div key={t.id} className="p-3 bg-white rounded-xl border border-zinc-200 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-zinc-900">{t.name}</p>
                          <p className="text-[11px] text-zinc-500">{remaining > 0 ? `${remaining} remaining` : 'Sold out'}</p>
                        </div>
                        <span className="font-black text-indigo-600 font-mono">
                          {t.price > 0 ? `KES ${t.price.toLocaleString()}` : 'FREE'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs font-bold">
              <div className="flex justify-between bg-white p-3 rounded-xl border">
                <span className="flex items-center gap-2 text-zinc-400">
                  <ClockIcon className="w-4 h-4" /> Doors Open
                </span>
                <span>{startTime}</span>
              </div>

              {event.maxCapacity && (
                <div className="flex justify-between bg-white p-3 rounded-xl border">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <UserGroupIcon className="w-4 h-4" /> Capacity
                  </span>
                  <span>{event.maxCapacity}</span>
                </div>
              )}
            </div>

            <motion.button
              onClick={handleCheckout}
              disabled={isExpired || loading}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center"
              style={{
                background: isExpired
                  ? '#ccc'
                  : `linear-gradient(135deg, ${primary}, ${secondary})`,
              }}
            >
              {loading
                ? 'Processing...'
                : isExpired
                ? 'Event Ended'
                : event.isPaid
                ? 'Proceed to Checkout'
                : 'Register Free'}
            </motion.button>

            {event.onlineMeetingLink && (
              <a
                href={event.onlineMeetingLink}
                target="_blank"
                className="block text-center text-xs font-black tracking-widest uppercase pt-4"
                style={{ color: primary }}
              >
                Join Virtual Event <ArrowRightIcon className="inline w-3 h-3" />
              </a>
            )}
          </div>
        </aside>
      </main>

      {typeof window !== 'undefined' && (
        <WhatsAppInquiry
          productName={event.title}
          productPrice={event.price || 0}
          productUrl={window.location.href}
          phoneNumber="254712345678"
        />
      )}
    </div>
  );
}