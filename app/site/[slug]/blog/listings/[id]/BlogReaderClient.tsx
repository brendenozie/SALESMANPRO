"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  CalendarIcon, 
  EyeIcon, 
  HandThumbUpIcon, 
  ChevronLeftIcon,
  LockClosedIcon,
  SparklesIcon,
  ShareIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { resolveBlogMedia } from "@/lib/media/content-media-resolver";
import { useContentTelemetry } from "@/hooks/useContentTelemetry";

interface BlogReaderClientProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content?: string | null;
    coverImage: string | null;
    categories: string[];
    publishedAt: string | null;
    createdAt: string;
    views: number;
    likes: number;
    isPremium?: boolean;
    price?: number;
    currency?: string;
    previewExcerpt?: string | null;
    companyId?: string;
    author: { name: string; profileImage?: string } | null;
  };
}

export default function BlogReaderClient({ blog }: BlogReaderClientProps) {
  const media = resolveBlogMedia(blog);
  const isPremium = Boolean(blog.isPremium && (blog.price || 0) > 0);

  // Paywall & Access State
  const [hasAccess, setHasAccess] = useState(!isPremium);
  const [checkingAccess, setCheckingAccess] = useState(isPremium);
  const [phone, setPhone] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(blog.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  // Telemetry Hook
  const {
    recordScrollDepth,
    recordBlogLike,
    recordBlogShare,
    recordBlogPaywallView,
    recordBlogPurchase,
  } = useContentTelemetry({
    blogId: blog.id,
    companyId: blog.companyId,
    channel: "STORE",
  });

  // Reading progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Check scroll progress for telemetry
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      recordScrollDepth(v);
    });
  }, [scrollYProgress, recordScrollDepth]);

  // Check Content Access
  useEffect(() => {
    if (!isPremium) {
      setHasAccess(true);
      setCheckingAccess(false);
      return;
    }

    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/content/access?contentType=BLOG&contentId=${blog.id}`);
        const data = await res.json();
        if (data.hasAccess) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          recordBlogPaywallView(blog.price);
        }
      } catch {
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [blog.id, isPremium, blog.price, recordBlogPaywallView]);

  // Handle Paywall Unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blog.companyId) return;

    setPurchasing(true);
    setPurchaseMessage(null);

    try {
      const res = await fetch("/api/content/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "BLOG",
          contentId: blog.id,
          companyId: blog.companyId,
          phoneNumber: phone,
          paymentMethod: "MPESA",
        }),
      });

      const data = await res.json();
      if (data.success && data.hasAccess) {
        setHasAccess(true);
        recordBlogPurchase(blog.price || 0);
        setPurchaseMessage("Access granted! Enjoy the full article.");
      } else {
        throw new Error(data.error || "Payment prompt sent. Please authorize on your phone.");
      }
    } catch (err: any) {
      setPurchaseMessage(err.message || "Failed to initiate payment");
    } finally {
      setPurchasing(false);
    }
  };

  const handleLike = () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikesCount((prev) => prev + 1);
    recordBlogLike();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog.title, url: window.location.href });
    }
    recordBlogShare();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pb-32 font-sans relative selection:bg-slate-800 selection:text-white">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-amber-500 origin-left z-50 opacity-90 shadow-sm shadow-amber-500/50"
        style={{ scaleX }}
      />

      {/* Nav Context */}
      <nav className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto h-14 flex items-center justify-between">
          <Link
            href="/blog/products"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-wider group"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Articles
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            {isPremium && (
              <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px] uppercase font-bold">
                <SparklesIcon className="w-3 h-3" /> Premium
              </span>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <ShareIcon className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="max-w-3xl mx-auto px-4 pt-16 sm:pt-24 pb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {blog.categories?.map((category) => (
            <span
              key={category}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono tracking-wider text-slate-400 uppercase"
            >
              {category}
            </span>
          ))}
          <span className="text-[10px] font-mono text-slate-500">• {media.durationFormatted}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase mb-6 leading-tight">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal mb-8 border-l-2 border-amber-500/60 pl-4">
            {blog.excerpt}
          </p>
        )}

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-900 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2.5">
            {blog.author?.profileImage && (
              <img
                src={blog.author.profileImage}
                alt={blog.author.name}
                className="w-7 h-7 rounded-full grayscale border border-slate-800 object-cover"
              />
            )}
            <span className="text-slate-300 font-medium">By {blog.author?.name || "Editorial Team"}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-slate-600" />
              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4 text-slate-600" />
              {blog.views || 0} VIEWS
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image Stage */}
      {media.coverUrl && (
        <div className="max-w-4xl mx-auto px-4 mb-12">
          <div className="w-full aspect-[21/10] bg-slate-900 border border-slate-900 rounded-xl overflow-hidden shadow-2xl relative">
            <img
              src={media.coverUrl}
              alt={blog.title}
              className="w-full h-full object-cover opacity-90 transition duration-700 hover:scale-[1.01]"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1080&q=80";
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content & Paywall Container */}
      <main className="max-w-3xl mx-auto px-4 relative">
        {hasAccess ? (
          <article
            className="prose prose-invert prose-slate max-w-none text-slate-300
              prose-headings:text-white prose-headings:uppercase prose-headings:tracking-wide prose-headings:font-bold
              prose-h2:text-lg prose-h2:border-b prose-h2:border-slate-900 prose-h2:pb-2 prose-h2:mt-12
              prose-h3:text-sm prose-h3:tracking-normal
              prose-p:text-sm prose-p:leading-relaxed prose-p:mb-6 prose-p:text-slate-300
              prose-a:text-amber-400 prose-a:underline hover:prose-a:text-amber-300 prose-a:transition-colors
              prose-code:text-slate-200 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
              prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:p-4
              prose-blockquote:border-l-amber-500 prose-blockquote:text-slate-400 prose-blockquote:italic
              prose-ul:list-disc prose-ol:list-decimal prose-li:text-sm prose-li:text-slate-300"
            dangerouslySetInnerHTML={{
              __html:
                blog.content ||
                `<p className="text-xs font-mono text-slate-600">No content records compiled for this article.</p>`,
            }}
          />
        ) : (
          <div className="relative">
            {/* Teaser Preview */}
            <div className="prose prose-invert prose-slate max-w-none text-slate-300 line-clamp-4">
              <p>
                {blog.previewExcerpt ||
                  blog.excerpt ||
                  "This is a premium research and editorial publication. Unlock access to continue reading the complete report, including full analysis, strategies, and key takeaways."}
              </p>
            </div>

            {/* Gradient Mask & Paywall Card */}
            <div className="relative pt-12 pb-8">
              <div className="absolute -top-16 inset-x-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none" />

              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 text-center shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
                  <LockClosedIcon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Premium Member Content</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                  This exclusive article requires a one-time unlock pass of{" "}
                  <strong className="text-amber-400 font-bold">
                    {blog.currency || "KES"} {(blog.price || 0).toLocaleString()}
                  </strong>
                  . Complete via M-Pesa to read immediately.
                </p>

                <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1 text-left uppercase">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={purchasing}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {purchasing ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" /> Processing STK Push...
                      </>
                    ) : (
                      <>Unlock Full Article ({blog.currency || "KES"} {blog.price})</>
                    )}
                  </button>

                  {purchaseMessage && (
                    <p className="text-xs font-mono text-amber-400 pt-2">{purchaseMessage}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Footer & Recommendations Signoff */}
        <div className="mt-20 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            LOG END SECTION // SHUTTING DOWN VIEWPORT LINK
          </div>
          <button
            onClick={handleLike}
            className={`h-9 px-4 border rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
              hasLiked
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <HandThumbUpIcon className="h-4 w-4" /> {likesCount} Recommendations
          </button>
        </div>
      </main>
    </div>
  );
}