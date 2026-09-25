'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PlayCircleIcon, 
  BookmarkIcon, 
  UserCircleIcon, 
  SparklesIcon,
  FilmIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

interface ContentItem {
  id: string;
  type: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  url: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unlockedItems, setUnlockedItems] = useState<ContentItem[]>([]);
  const [bookmarks, setBookmarks] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        fetch(`${apiBaseUrl}/site/${slug}/me/content`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setUnlockedItems(contentData.subscribed || []);
        setBookmarks(contentData.bookmarked || []);
      }
    } catch (error) {
      console.error('Error fetching user profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f111a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-[#0f111a] px-4">
        <div className="text-center bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl">
          <UserCircleIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Please sign in to access your profile.
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Sign in with your customer account to view your purchased videos, saved items, and settings.
          </p>
          <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(window?.location?.href || `/site/${slug}/media/profile`)}`}>
            <button className="w-full px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-600/30">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  const displayName = user?.name || session?.user?.name || 'Member';
  const displayEmail = user?.email || session?.user?.email || '';

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-300 font-sans selection:bg-violet-500 selection:text-white">
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-violet-900/20 to-[#0f111a] -z-10" />
      <div className="fixed top-20 right-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cover Section */}
        <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-violet-900/40 to-slate-900 border border-slate-800 flex items-end p-6">
          <div className="absolute top-4 right-4 flex gap-2">
            <Link
              href={`/site/${slug}/media/dashboard`}
              className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-white/10 transition-all text-xs font-medium"
            >
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-violet-400" /> Member Dashboard
            </Link>
            <button 
              onClick={() => {
                const returnTo = window.location.origin;
                signOut({
                  redirect: true,
                  callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                });
              }}
              className="bg-black/40 backdrop-blur-md border border-white/10 text-rose-300 px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-rose-950/40 transition-all text-xs font-medium"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="relative -mt-16 px-4 md:px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-slate-800">
            <div className="w-28 h-28 rounded-full border-4 border-[#0f111a] bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
              {displayName[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                {displayName}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Consumer
                </span>
              </h1>
              <p className="text-violet-400 text-sm font-medium">{displayEmail}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/site/${slug}/media/dashboard?tab=library`}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-violet-600/20"
              >
                Open My Library
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-white">{unlockedItems.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">Purchased Content</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-white">{bookmarks.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">Saved Bookmarks</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-emerald-400">Active</div>
              <div className="text-xs text-slate-400 mt-0.5">Membership Status</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-violet-400">Verified</div>
              <div className="text-xs text-slate-400 mt-0.5">Account Security</div>
            </div>
          </div>

          {/* Unlocked Media Preview */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PlayCircleIcon className="w-6 h-6 text-violet-500" />
                Purchased & Unlocked Media ({unlockedItems.length})
              </h2>
              <Link
                href={`/site/${slug}/media/dashboard?tab=library`}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
              >
                View Full Library →
              </Link>
            </div>

            {unlockedItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800">
                <FilmIcon className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No purchased media in your library yet.</p>
                <Link
                  href={`/site/${slug}/media`}
                  className="mt-3 inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium"
                >
                  Explore Media Storefront
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                  >
                    <div className="aspect-video relative bg-slate-950 overflow-hidden">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <FilmIcon className="w-10 h-10" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/70 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3" /> Unlocked
                      </span>
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] text-violet-400 font-medium block">{item.category || item.type}</span>
                      <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{item.title}</h3>
                      <Link
                        href={item.url}
                        className="mt-3 w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <PlayCircleIcon className="w-4 h-4" /> Watch / Access
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}