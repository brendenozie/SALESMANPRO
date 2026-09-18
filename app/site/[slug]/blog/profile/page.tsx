'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  BookOpenIcon, 
  HeartIcon, 
  ShareIcon,
  BookmarkIcon,
  LockOpenIcon,
  SparklesIcon,
  ClockIcon,
  PlayCircleIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  FireIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon, HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  tier?: string;
  points?: number;
  createdAt?: string;
}

interface ContentItem {
  id: string;
  type: 'BLOG' | 'PODCAST';
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  category?: string | null;
  author?: string;
  duration?: string;
  price?: number;
  currency?: string;
  unlockedAt?: string;
  url: string;
  isPremium?: boolean;
}

interface ContentStats {
  subscribedCount: number;
  likedCount: number;
  sharedCount: number;
  bookmarkedCount: number;
  articlesReadCount: number;
}

type TabType = 'overview' | 'subscribed' | 'bookmarked' | 'liked' | 'shared';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Content collections
  const [subscribed, setSubscribed] = useState<ContentItem[]>([]);
  const [liked, setLiked] = useState<ContentItem[]>([]);
  const [shared, setShared] = useState<ContentItem[]>([]);
  const [bookmarked, setBookmarked] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    subscribedCount: 0,
    likedCount: 0,
    sharedCount: 0,
    bookmarkedCount: 0,
    articlesReadCount: 0,
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session, slug]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, contentRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`/api/site/${slug}/me/content`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        if (contentData.success) {
          setSubscribed(contentData.subscribed || []);
          setLiked(contentData.liked || []);
          setShared(contentData.shared || []);
          setBookmarked(contentData.bookmarked || []);
          setStats(contentData.stats || {
            subscribedCount: 0,
            likedCount: 0,
            sharedCount: 0,
            bookmarkedCount: 0,
            articlesReadCount: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user content data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove bookmark handler
  const handleRemoveBookmark = async (item: ContentItem) => {
    // Optimistically remove from state
    setBookmarked((prev) => prev.filter((b) => b.id !== item.id));
    setStats((prev) => ({ ...prev, bookmarkedCount: Math.max(0, prev.bookmarkedCount - 1) }));

    try {
      await fetch(`/api/site/${slug}/me/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unbookmark',
          contentType: item.type,
          contentId: item.id,
        }),
      });
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      fetchUserData(); // rollback on failure
    }
  };

  // Filter items by search
  const filterBySearch = (items: ContentItem[]) => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term))
    );
  };

  const filteredSubscribed = useMemo(() => filterBySearch(subscribed), [subscribed, searchTerm]);
  const filteredBookmarked = useMemo(() => filterBySearch(bookmarked), [bookmarked, searchTerm]);
  const filteredLiked = useMemo(() => filterBySearch(liked), [liked, searchTerm]);
  const filteredShared = useMemo(() => filterBySearch(shared), [shared, searchTerm]);

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Loading Profile & Activity...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated prompt
  if (status === 'unauthenticated') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <UserCircleIcon className="w-16 h-16 mx-auto text-indigo-500 mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Reader Profile
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Sign in to access your subscribed premium content, saved bookmarks, liked stories, and reading activity.
          </p>
          <Link href={`/auth/signin?callbackUrl=/site/${slug}/blog/profile`}>
            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
              Sign In to Continue
            </button>
          </Link>
        </div>
      </section>
    );
  }

  const displayUser = {
    name: user?.name || session?.user?.name || "Reader",
    email: user?.email || session?.user?.email || "",
    role: user?.tier || "Community Reader",
    avatar: user?.avatar || session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&auto=format&fit=crop&q=80",
  };

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: HomeIcon, count: null },
    { id: 'subscribed', label: 'Subscribed Content', icon: LockOpenIcon, count: stats.subscribedCount },
    { id: 'bookmarked', label: 'Reading List', icon: BookmarkIcon, count: stats.bookmarkedCount },
    { id: 'liked', label: 'Liked Stories', icon: HeartIcon, count: stats.likedCount },
    { id: 'shared', label: 'Shared Clips', icon: ShareIcon, count: stats.sharedCount },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col sticky top-0 h-screen z-20 transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
            <FireIcon className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 font-extrabold text-lg hidden lg:block tracking-tight text-slate-900 dark:text-white">
            ReaderHub
          </span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-1.5 px-3">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSearchTerm('');
                }}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  <span className="text-sm hidden lg:block">{tab.label}</span>
                </div>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full hidden lg:inline-block ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => {
              const returnTo = window.location.origin;
              signOut({
                redirect: true,
                callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
              });
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 w-full transition-colors text-xs font-semibold"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
            <span className="hidden lg:block">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Banner Header */}
        <div className="relative bg-white dark:bg-slate-900 pb-28 sm:pb-32 border-b border-slate-200 dark:border-slate-800">
          <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-950">
            <img src={displayUser.cover} alt="Cover" className="w-full h-full object-cover opacity-60 filter blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 w-full px-6 sm:px-10 pb-6 translate-y-1/2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-5">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden relative bg-white dark:bg-slate-800 shrink-0">
                <img src={displayUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {displayUser.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span>{displayUser.email}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                    <StarIcon className="h-3.5 w-3.5 fill-amber-400" /> {displayUser.role}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/site/${slug}/blog/products`}>
                <button className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition">
                  Explore Stories
                </button>
              </Link>
              <Link href={`/site/${slug}/blog/podcasts`}>
                <button className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition">
                  Listen Podcasts
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Body */}
        <div className="px-4 sm:px-8 lg:px-10 pt-20 sm:pt-24 pb-16 max-w-7xl mx-auto space-y-8">

          {/* Metric Stats Banner */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
            <div 
              onClick={() => setActiveTab('subscribed')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'subscribed'
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <LockOpenIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Unlocked
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.subscribedCount}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Subscribed Content</p>
            </div>

            <div 
              onClick={() => setActiveTab('bookmarked')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'bookmarked'
                  ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <BookmarkIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  Saved
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.bookmarkedCount}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Reading List</p>
            </div>

            <div 
              onClick={() => setActiveTab('liked')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'liked'
                  ? 'bg-rose-500/10 border-rose-500/40 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <HeartIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  Liked
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.likedCount}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Liked Stories</p>
            </div>

            <div 
              onClick={() => setActiveTab('shared')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'shared'
                  ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <ShareIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  Shared
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.sharedCount}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Shared Content</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <BookOpenIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Read
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.articlesReadCount}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Articles Explored</p>
            </div>
          </section>

          {/* Mobile Tab Navigation Strip */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-2 custom-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {typeof tab.count === 'number' && tab.count > 0 && ` (${tab.count})`}
                </button>
              );
            })}
          </div>

          {/* Search bar when viewing lists */}
          {activeTab !== 'overview' && (
            <div className="relative max-w-md">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab} content...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
              />
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Subscribed & Reading List Previews */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Subscribed Showcase */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LockOpenIcon className="h-5 w-5 text-amber-500" /> Subscribed & Unlocked Content
                      </h2>
                      <p className="text-xs text-slate-400">Stories and podcast master tracks you own full access to.</p>
                    </div>
                    {subscribed.length > 0 && (
                      <button 
                        onClick={() => setActiveTab('subscribed')}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                      >
                        View All ({subscribed.length})
                      </button>
                    )}
                  </div>

                  {subscribed.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <LockOpenIcon className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Subscribed Content Yet</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                        Discover exclusive premium articles and podcasts unlocked instantly via M-Pesa.
                      </p>
                      <Link href={`/site/${slug}/blog/products`}>
                        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm">
                          Browse Premium Stories
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {subscribed.slice(0, 4).map((item) => (
                        <ContentCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Bookmarked / Reading List Showcase */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookmarkIcon className="h-5 w-5 text-indigo-500" /> Saved to Reading List
                      </h2>
                      <p className="text-xs text-slate-400">Articles and episodes bookmarked for later review.</p>
                    </div>
                    {bookmarked.length > 0 && (
                      <button 
                        onClick={() => setActiveTab('bookmarked')}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                      >
                        View All ({bookmarked.length})
                      </button>
                    )}
                  </div>

                  {bookmarked.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <BookmarkIcon className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Reading List is Empty</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                        Tap "Save" while reading any story or listening to podcasts to save them here.
                      </p>
                      <Link href={`/site/${slug}/blog/products`}>
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">
                          Discover Stories
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {bookmarked.slice(0, 4).map((item) => (
                        <ContentCard key={item.id} item={item} onRemove={() => handleRemoveBookmark(item)} />
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Community & Quick Engagement */}
              <div className="space-y-6">
                
                {/* Liked & Shared Quick Peek */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Engagement
                  </h3>

                  <div className="space-y-3">
                    <div 
                      onClick={() => setActiveTab('liked')}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <HeartSolidIcon className="h-5 w-5 text-rose-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Liked Stories</p>
                          <p className="text-[11px] text-slate-400">{stats.likedCount} recommendations</p>
                        </div>
                      </div>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400" />
                    </div>

                    <div 
                      onClick={() => setActiveTab('shared')}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <ShareIcon className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Shared Content</p>
                          <p className="text-[11px] text-slate-400">{stats.sharedCount} stories & clips distributed</p>
                        </div>
                      </div>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Reader Club Promo Box */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-200 font-bold block mb-1">
                    COMMUNITY PERSPECTIVE
                  </span>
                  <h4 className="text-lg font-black mb-2">Publish Your Story</h4>
                  <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                    Have insights, tech breakthroughs, or personal journey essays? Join as a contributing author.
                  </p>
                  <Link href={`/site/${slug}/blog/contact`}>
                    <button className="px-4 py-2 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition shadow-sm">
                      Submit Article Pitch
                    </button>
                  </Link>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SUBSCRIBED CONTENT */}
          {activeTab === 'subscribed' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LockOpenIcon className="h-6 w-6 text-amber-500" /> Subscribed & Paid Access Content
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Every article and podcast episode you have unlocked. Permanent, uninterrupted access granted.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {filteredSubscribed.length} Unlocked
                </span>
              </div>

              {filteredSubscribed.length === 0 ? (
                <EmptyState
                  title="No Subscribed Content"
                  description="You haven't purchased or unlocked any premium paywalled articles or episodes yet."
                  actionLabel="Browse Premium Stories"
                  actionHref={`/site/${slug}/blog/products`}
                />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubscribed.map((item) => (
                    <ContentCard key={item.id} item={item} showUnlockBadge />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BOOKMARKED / READING LIST */}
          {activeTab === 'bookmarked' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookmarkIcon className="h-6 w-6 text-indigo-500" /> Reading List & Saved Tracks
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Articles and podcast tracks you've pinned to read or stream later.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
                  {filteredBookmarked.length} Saved
                </span>
              </div>

              {filteredBookmarked.length === 0 ? (
                <EmptyState
                  title="No Saved Content"
                  description="Your reading list is empty. Click 'Save' while reading articles or browsing episodes to bookmark them."
                  actionLabel="Discover Content"
                  actionHref={`/site/${slug}/blog/products`}
                />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBookmarked.map((item) => (
                    <ContentCard 
                      key={item.id} 
                      item={item} 
                      onRemove={() => handleRemoveBookmark(item)} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LIKED STORIES */}
          {activeTab === 'liked' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HeartSolidIcon className="h-6 w-6 text-rose-500" /> Liked Content
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Stories and podcast episodes you've recommended and liked.
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  {filteredLiked.length} Liked
                </span>
              </div>

              {filteredLiked.length === 0 ? (
                <EmptyState
                  title="No Liked Content"
                  description="You haven't liked any articles or podcasts yet. Tap the like button on pieces you enjoy."
                  actionLabel="Explore Articles"
                  actionHref={`/site/${slug}/blog/products`}
                />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLiked.map((item) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SHARED STORIES */}
          {activeTab === 'shared' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShareIcon className="h-6 w-6 text-blue-500" /> Shared Stories & Podcasts
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Pieces you've shared with friends, peers, and social networks.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {filteredShared.length} Shared
                </span>
              </div>

              {filteredShared.length === 0 ? (
                <EmptyState
                  title="No Shared Content"
                  description="You haven't shared any content yet. Share stories you love directly from the reader."
                  actionLabel="Discover Stories"
                  actionHref={`/site/${slug}/blog/products`}
                />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShared.map((item) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// Reusable Content Card Component
function ContentCard({
  item,
  showUnlockBadge = false,
  onRemove,
}: {
  item: ContentItem;
  showUnlockBadge?: boolean;
  onRemove?: () => void;
}) {
  const isPodcast = item.type === 'PODCAST';

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-all duration-300 flex flex-col">
      {/* Media Cover */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        <img
          src={item.coverImage || (isPodcast ? "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80" : "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80")}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = isPodcast
              ? "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80"
              : "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80";
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${
            isPodcast
              ? 'bg-purple-600/90 text-white shadow-sm'
              : 'bg-indigo-600/90 text-white shadow-sm'
          }`}>
            {isPodcast ? 'Podcast' : 'Article'}
          </span>

          {showUnlockBadge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
              <LockOpenIcon className="h-3 w-3 stroke-[2.5]" /> Unlocked
            </span>
          )}

          {item.isPremium && !showUnlockBadge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-500/90 text-slate-950 shadow-sm">
              🔒 Premium
            </span>
          )}
        </div>

        {/* Quick Delete / Unbookmark action */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            title="Remove from bookmarks"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-950/70 hover:bg-rose-600 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content Meta & Details */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1.5">
          <span>{item.category || (isPodcast ? "Audio Clip" : "Editorial")}</span>
          {item.duration && <span>• {item.duration}</span>}
          {item.author && <span>• By {item.author}</span>}
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {item.title}
        </h3>

        {item.excerpt && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow">
            {item.excerpt}
          </p>
        )}

        {/* Footer CTA */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            {item.unlockedAt ? `Unlocked ${new Date(item.unlockedAt).toLocaleDateString()}` : "Ready to view"}
          </span>

          <Link href={item.url}>
            <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform">
              {isPodcast ? "Play Episode" : "Read Story"}
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Reusable Empty State Component
function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
        <SparklesIcon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        {description}
      </p>
      <Link href={actionHref}>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition">
          {actionLabel}
        </button>
      </Link>
    </div>
  );
}