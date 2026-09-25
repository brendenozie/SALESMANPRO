"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  PlayIcon, 
  ShareIcon, 
  HandThumbUpIcon,
  TicketIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  ClockIcon,
  CheckCircleIcon,
  LockClosedIcon,
  SparklesIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/solid';
import AdaptiveVideoPlayer from '@/components/media/AdaptiveVideoPlayer';

const loader = ({ src }: { src: string }) => src;

interface MediaEntertainmentViewProps {
  media: any;
  related?: any[];
  storeFormData?: any;
}

export default function MediaEntertainmentView({ media, related, storeFormData }: MediaEntertainmentViewProps) {
  const { data: session, status: authStatus } = useSession();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#8b5cf6'; // Violet default

  // Access state
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessReason, setAccessReason] = useState<string>('');
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);

  // Purchase modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Likes & Shares
  const [isLiked, setIsLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const price = media?.finalPrice || media?.sellingPrice || media?.price || 0;
  const currency = media?.currency || 'USD';
  const isPaid = price > 0 || media?.isPaid || media?.isPremium;

  // Check entitlement on load
  const verifyAccess = useCallback(async () => {
    if (!media?.id) return;
    setCheckingAccess(true);
    try {
      const contentType = media.contentType || 'CONTENT';
      const res = await fetch(`/api/content/access?contentType=${contentType}&contentId=${media.id}`);
      if (res.ok) {
        const data = await res.json();
        setHasAccess(data.hasAccess);
        setAccessReason(data.reason || '');
      } else {
        setHasAccess(!isPaid);
      }
    } catch {
      setHasAccess(!isPaid);
    } finally {
      setCheckingAccess(false);
    }
  }, [media?.id, isPaid]);

  useEffect(() => {
    verifyAccess();
  }, [verifyAccess, authStatus]);

  // Request secure signed stream URL
  const handlePlayContent = async () => {
    if (!hasAccess) {
      setIsCheckoutOpen(true);
      return;
    }

    setLoadingStream(true);
    try {
      const contentType = media.contentType || 'CONTENT';
      const res = await fetch(`/api/content/stream?contentType=${contentType}&contentId=${media.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.streamUrl) {
          setStreamUrl(data.streamUrl);
          setIsPlaying(true);
        } else {
          alert('Media stream not found for this item.');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Access denied or media expired.');
      }
    } catch (err: any) {
      alert(err.message || 'Error initializing secure playback.');
    } finally {
      setLoadingStream(false);
    }
  };

  // Perform purchase checkout
  const handleConfirmPurchase = async () => {
    if (authStatus === 'unauthenticated') {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`;
      return;
    }

    setPurchasing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/content/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: media.contentType || 'CONTENT',
          contentId: media.id,
          amount: price,
          currency,
          paymentMethod: 'TEST_INSTANT',
          companyId: media.companyId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Payment failed to process');
      }

      setPurchaseSuccess(true);
      setHasAccess(true);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setPurchaseSuccess(false);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing error');
    } finally {
      setPurchasing(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const heroImage = media?.images?.[0] || media?.backdropUrl || media?.mediaAsset?.url || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1600';

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-violet-500/30 font-sans">
      
      {/* --- CINEMATIC IMMERSIVE HERO --- */}
      <section className="relative min-h-[75vh] w-full overflow-hidden flex flex-col justify-end">
        {/* Background Backdrop */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={media?.name || "Media Feature"}
            fill
            className="object-cover brightness-[0.35] saturate-[0.9]"
            loader={loader}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 w-full pt-32">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                {media?.category || 'Feature'}
              </span>
              {isPaid ? (
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <LockClosedIcon className="w-3 h-3" />
                  Premium ({currency} {price.toFixed(2)})
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Public Free
                </span>
              )}
              {hasAccess && (
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" />
                  Access Unlocked
                </span>
              )}
            </div>

            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              {media?.name || "Exclusive Media Feature"}
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 line-clamp-3">
              {media?.description || "Experience high-definition storytelling, video features, and multimedia productions curated exclusively for our audience."}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {checkingAccess ? (
                <div className="h-14 px-8 rounded-full bg-slate-800 text-slate-400 font-semibold text-xs flex items-center gap-2 animate-pulse">
                  Verifying Access...
                </div>
              ) : hasAccess ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePlayContent}
                  disabled={loadingStream}
                  className="h-14 px-8 rounded-full text-white font-bold uppercase text-xs tracking-wider flex items-center gap-3 shadow-xl transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <PlayIcon className="w-5 h-5" />
                  {loadingStream ? 'Authorizing Stream...' : isPlaying ? 'Restart Playback' : 'Watch / Play Content'}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsCheckoutOpen(true)}
                  className="h-14 px-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold uppercase text-xs tracking-wider flex items-center gap-3 shadow-xl transition-all"
                >
                  <TicketIcon className="w-5 h-5" />
                  Unlock Digital Access — {currency} {price.toFixed(2)}
                </motion.button>
              )}

              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`w-14 h-14 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center transition-all ${
                  isLiked ? 'bg-rose-600/30 text-rose-400 border-rose-500/50' : 'hover:bg-white/10 text-white'
                }`}
                title="Like"
              >
                <HandThumbUpIcon className="w-5 h-5" />
              </button>

              <button 
                onClick={handleShare}
                className="w-14 h-14 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/10 text-white transition-all relative"
                title="Share link"
              >
                <ShareIcon className="w-5 h-5" />
                {copiedLink && (
                  <span className="absolute -top-8 px-2 py-0.5 rounded bg-violet-600 text-[10px] text-white whitespace-nowrap shadow-lg">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- EMBEDDED CINEMATIC PLAYER --- */}
      <AnimatePresence>
        {isPlaying && streamUrl && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-6xl mx-auto px-6 lg:px-8 py-8"
          >
            <div className="bg-black rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-2 relative">
              <div className="flex justify-between items-center px-4 py-2 text-xs text-slate-400 border-b border-slate-800 mb-2">
                <span className="flex items-center gap-2 text-emerald-400 font-mono">
                  <CheckCircleIcon className="w-4 h-4" />
                  Secure Entitled Stream Active (Expiring Signed Token)
                </span>
                <button
                  onClick={() => setIsPlaying(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <AdaptiveVideoPlayer
                src={streamUrl}
                poster={heroImage}
                className="w-full aspect-video rounded-2xl bg-black"
                autoPlay={true}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* --- MEDIA METADATA & SPECS --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <section className="mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Synopsis & Details</h2>
            <p className="text-lg text-slate-300 font-light leading-relaxed">
              {media?.description || "No full synopsis provided for this content record."}
            </p>
          </section>

          {media?.images && media.images.length > 1 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-6">Production Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {media.images.slice(1).map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800">
                    <img src={imgUrl} alt={`Still ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Details Card */}
        <aside className="lg:col-span-4 h-fit">
          <div className="p-8 bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-xl space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-slate-800 pb-4">
              Access & Production Metadata
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <TicketIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Access Status</p>
                  <p className="text-sm font-semibold text-white">
                    {hasAccess ? 'Authorized / Unlocked' : isPaid ? `Purchase Required (${currency} ${price})` : 'Public Content'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Format</p>
                  <p className="text-sm font-semibold text-white">Digital On-Demand</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              {hasAccess ? (
                <button
                  onClick={handlePlayContent}
                  className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold uppercase text-xs tracking-wider transition-colors shadow-lg shadow-violet-600/20"
                >
                  Stream Now
                </button>
              ) : (
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold uppercase text-xs tracking-wider transition-colors shadow-lg shadow-amber-500/20"
                >
                  Buy Access ({currency} {price.toFixed(2)})
                </button>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* --- PURCHASE CHECKOUT MODAL --- */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
                  <TicketIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Unlock Digital Content</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Instant, unlimited access added directly to your Consumer Library.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6">
                <div className="flex justify-between items-center text-sm font-semibold text-white mb-2">
                  <span className="truncate pr-4">{media?.name}</span>
                  <span className="text-amber-400 font-mono">${price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Licence</span>
                  <span>Consumer Lifetime Entitlement</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 mb-4 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {purchaseSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-900 text-center text-emerald-300 text-sm font-semibold flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Entitlement Confirmed! Unlocking player...
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={purchasing}
                    className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
                  >
                    {purchasing ? 'Processing Order...' : `Confirm & Pay $${price.toFixed(2)}`}
                  </button>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs transition-colors hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}