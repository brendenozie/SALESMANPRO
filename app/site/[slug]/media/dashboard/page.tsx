'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PlayCircleIcon, 
  BookmarkIcon, 
  ReceiptPercentIcon, 
  ClockIcon, 
  UserCircleIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  FilmIcon,
  BookOpenIcon,
  PhotoIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  FolderIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface MediaContentItem {
  id: string;
  type: 'VIDEO' | 'ALBUM' | 'PHOTO_ALBUM' | 'CONTENT' | 'BLOG' | 'PODCAST';
  title: string;
  excerpt?: string;
  description?: string;
  coverImage?: string;
  mediaUrl?: string;
  category?: string;
  author?: string;
  duration?: string;
  itemCount?: number;
  price?: number;
  currency?: string;
  unlockedAt?: string;
  url: string;
  isPremium?: boolean;
}

interface PurchaseItem {
  id: string;
  contentId: string;
  contentType: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  accessGranted: boolean;
  date: string;
}

export default function ConsumerDashboard() {
  const { data: session, status } = useSession();
  const params = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug || '';

  const initialTab = searchParams.get('tab') || 'library';
  const [activeTab, setActiveTab] = useState<'library' | 'purchases' | 'bookmarks' | 'history' | 'settings'>(
    initialTab as any
  );

  const [loading, setLoading] = useState(true);
  const [subscribedItems, setSubscribedItems] = useState<MediaContentItem[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<MediaContentItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);

  const loadData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const [contentRes, purchasesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/content`),
        fetch(`${apiBaseUrl}/site/${slug}/me/purchases`),
      ]);

      if (contentRes.ok) {
        const cData = await contentRes.json();
        setSubscribedItems(cData.subscribed || []);
        setBookmarkedItems(cData.bookmarked || []);
      }

      if (purchasesRes.ok) {
        const pData = await purchasesRes.json();
        setPurchases(pData.purchases || []);
        setTotalSpent(pData.totalSpent || 0);
      }
    } catch (err) {
      console.error('Failed to load consumer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, loadData]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b10]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b10] px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <UserCircleIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Member Access Required</h2>
          <p className="text-slate-400 text-sm mb-6">
            Sign in to access your purchased media, saved bookmarks, and transaction records.
          </p>
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(window?.location?.href || `/site/${slug}/media/dashboard`)}`}
            className="w-full inline-block py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all shadow-lg shadow-violet-600/30"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-200">
      {/* Subtle Ambient Backdrops */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-600/30">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                {session?.user?.name || 'Consumer Dashboard'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                  Member
                </span>
              </h1>
              <p className="text-xs text-slate-400">{session?.user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/site/${slug}/media`}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400" />
              Back to Storefront
            </Link>
            <button
              onClick={() => {
                const returnTo = window.location.origin;
                signOut({
                  redirect: true,
                  callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                });
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-rose-300 bg-rose-950/30 border border-rose-900/40 hover:bg-rose-900/40 transition-colors flex items-center gap-1.5"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-400" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto border-t border-slate-800/40">
          {[
            { id: 'library', label: 'My Library', icon: FilmIcon, count: subscribedItems.length },
            { id: 'purchases', label: 'Purchases & Billing', icon: ReceiptPercentIcon, count: purchases.length },
            { id: 'bookmarks', label: 'Bookmarks', icon: BookmarkIcon, count: bookmarkedItems.length },
            { id: 'history', label: 'Watch History', icon: ClockIcon },
            { id: 'settings', label: 'Account Profile', icon: Cog6ToothIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  router.push(`/site/${slug}/media/dashboard?tab=${tab.id}`);
                }}
                className={`flex items-center gap-2 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* TAB: MY LIBRARY */}
            {activeTab === 'library' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/60 mb-6 gap-2">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <SparklesIcon className="w-6 h-6 text-violet-400" />
                      Purchased & Unlocked Library
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Direct access to all your purchased videos, exclusive galleries, and premium articles.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    {subscribedItems.length} Available Assets
                  </span>
                </div>

                {subscribedItems.length === 0 ? (
                  <div className="text-center py-20 bg-slate-950/40 rounded-3xl border border-slate-800/80">
                    <FolderIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300 mb-1">Your library is currently empty</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                      Explore the public storefront to discover premium videos, exclusive masterclasses, and photo albums.
                    </p>
                    <Link
                      href={`/site/${slug}/media`}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition-colors inline-block shadow-lg shadow-violet-600/20"
                    >
                      Browse Storefront
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscribedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col group"
                      >
                        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700">
                              <FilmIcon className="w-12 h-12" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" />
                              Unlocked
                            </span>
                          </div>
                          {item.duration && (
                            <div className="absolute bottom-3 right-3 text-xs bg-black/70 px-2 py-0.5 rounded text-white font-mono">
                              {item.duration}
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs text-violet-400 font-medium mb-1">
                              <span>{item.category || item.type}</span>
                              {item.unlockedAt && (
                                <span className="text-slate-500">
                                  {new Date(item.unlockedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {item.excerpt || item.description || 'Premium content available in your library.'}
                            </p>
                          </div>

                          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                            <Link
                              href={item.url}
                              className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-600/20"
                            >
                              <PlayCircleIcon className="w-4 h-4" />
                              Play / Access Content
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PURCHASES */}
            {activeTab === 'purchases' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/60 mb-6 gap-2">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <ReceiptPercentIcon className="w-6 h-6 text-emerald-400" />
                      Purchases & Entitlements
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Complete history of your media purchases, subscriptions, and receipts.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Spent</span>
                    <span className="text-lg font-bold text-emerald-400">
                      ${totalSpent.toFixed(2)}
                    </span>
                  </div>
                </div>

                {purchases.length === 0 ? (
                  <div className="text-center py-20 bg-slate-950/40 rounded-3xl border border-slate-800/80">
                    <ReceiptPercentIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300 mb-1">No transactions recorded yet</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      When you purchase pay-per-view videos, gallery passes, or premium articles, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Transaction Ref</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Access Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {purchases.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-200">
                              {p.reference}
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                {p.contentType}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-400">
                              {new Date(p.date).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-sm font-semibold text-white">
                              ${p.amount.toFixed(2)} {p.currency}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: BOOKMARKS */}
            {activeTab === 'bookmarks' && (
              <div>
                <div className="pb-6 border-b border-slate-800/60 mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookmarkIcon className="w-6 h-6 text-amber-400" />
                    Saved Bookmarks
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Content you've bookmarked to read or watch later.
                  </p>
                </div>

                {bookmarkedItems.length === 0 ? (
                  <div className="text-center py-20 bg-slate-950/40 rounded-3xl border border-slate-800/80">
                    <BookmarkIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300 mb-1">No bookmarked items</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Use the bookmark button on any article or video across the storefront to save it here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden p-5 flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-xs text-amber-400 font-medium mb-1 block">
                            {item.category || item.type}
                          </span>
                          <h3 className="text-base font-bold text-white line-clamp-1">{item.title}</h3>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                            {item.excerpt || item.description || ''}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <Link
                            href={item.url}
                            className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                          >
                            Open Item →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: HISTORY */}
            {activeTab === 'history' && (
              <div>
                <div className="pb-6 border-b border-slate-800/60 mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-sky-400" />
                    Activity & Watch History
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Your recent viewing session logs and engagement.
                  </p>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-8 text-center">
                  <ClockIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    Streaming sessions and article read progress are automatically recorded to resume playback.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS & PROFILE */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <div className="pb-6 border-b border-slate-800/60 mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Cog6ToothIcon className="w-6 h-6 text-violet-400" />
                    Account Settings
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage your account details and login preferences.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={session?.user?.name || ''}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={session?.user?.email || ''}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-500">
                      Logged in via SalesmanPro secure session.
                    </span>
                    <button
                      onClick={() => {
                        const returnTo = window.location.origin;
                        signOut({
                          redirect: true,
                          callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                        });
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/30 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
