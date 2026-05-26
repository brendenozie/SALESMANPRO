'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  BookOpenIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ClockIcon,
  FireIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  tier?: string;
}

interface BlogStats {
  orderCount: number;
  wishlistCount: number;
  blogCount: number;
  eventCount: number;
}

interface SavedPost {
  id: string;
  title: string;
  category: string | null;
  featuredImage: string | null;
  progress?: number;
  readTime?: string;
}

interface Activity {
  id: string;
  text: string;
  time: string;
  type: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const UserDashboard = () => {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
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
      const [profileRes, blogsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`${apiBaseUrl}/site/${slug}/me/blog?limit=5`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
        setStats({
          orderCount: profileData.points ? Math.floor(profileData.points / 10) : 0,
          wishlistCount: 0,
          blogCount: 0,
          eventCount: 0,
        });
      }

      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setSavedPosts(blogsData.items?.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          category: blog.category,
          featuredImage: blog.featuredImage,
          progress: Math.floor(Math.random() * 100),
          readTime: `${Math.floor(Math.random() * 10) + 2} min`,
        })) || []);
      }

      // Set default activity
      setRecentActivity([
        { id: '1', text: "Commented on 'React Hooks Guide'", time: "2 hours ago", type: "comment" },
        { id: '2', text: "Liked 'The Minimalist Lifestyle'", time: "5 hours ago", type: "like" },
        { id: '3', text: "Finished reading 'Color Theory'", time: "1 day ago", type: "read" },
        { id: '4', text: "Started following @sarah_ux", time: "2 days ago", type: "follow" },
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show sign-in prompt if not authenticated
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <UserCircleIcon className="w-20 h-20 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Please sign in to access your dashboard.
          </h2>
          <Link href={`/auth/signin`}>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // Default display values
  const displayUser = {
    name: user?.name || session?.user?.name || "User",
    role: user?.tier || "Member",
    avatar: user?.avatar || session?.user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    cover: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  };

  const displayStats = [
    { name: 'Articles Read', value: String(stats?.blogCount || 0), change: '+12%', icon: BookOpenIcon, color: 'bg-blue-500' },
    { name: 'Total Comments', value: String(stats?.orderCount || 0), change: '+4%', icon: ChatBubbleLeftRightIcon, color: 'bg-purple-500' },
    { name: 'Saved Posts', value: String(stats?.wishlistCount || 0), change: '0%', icon: HeartIcon, color: 'bg-pink-500' },
    { name: 'Reading Time', value: '32h', change: '+2.5h', icon: ClockIcon, color: 'bg-amber-500' },
  ];

  const displayPosts = savedPosts.length > 0 ? savedPosts : [
    {
      id: '1',
      title: "The Future of UI Design in 2024",
      category: "Design",
      featuredImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      progress: 75,
      readTime: "5 min"
    },
    {
      id: '2',
      title: "Mastering Tailwind CSS Grid",
      category: "Development",
      featuredImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      progress: 30,
      readTime: "12 min"
    },
    {
      id: '3',
      title: "Understanding Next.js Server Actions",
      category: "Engineering",
      featuredImage: "https://images.unsplash.com/photo-1618477247222-ac5913053c90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      progress: 100,
      readTime: "8 min"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen z-10 transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FireIcon className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 font-bold text-xl hidden lg:block text-slate-800">BlogFlow</span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-1 px-3">
          {[
            { name: 'Overview', icon: HomeIcon, active: true },
            { name: 'Reading List', icon: BookOpenIcon, active: false },
            { name: 'Interactions', icon: ChatBubbleLeftRightIcon, active: false },
            { name: 'Settings', icon: Cog6ToothIcon, active: false },
          ].map((item) => (
            <button 
              key={item.name}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${item.active 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon className="h-6 w-6 shrink-0" />
              <span className="font-medium hidden lg:block">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={()=> {
              const returnTo = window.location.origin;

              signOut({
                redirect: true,
                callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
              });
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" />
            <span className="font-medium hidden lg:block">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header / Banner */}
        <div className="relative bg-white pb-32">
            <div className="h-48 w-full relative overflow-hidden">
                <img src={displayUser.cover} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-full px-8 pb-6 translate-y-1/2 flex items-end justify-between">
                <div className="flex items-end gap-6">
                    <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden relative bg-white">
                        <img src={displayUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="mb-2">
                        <h1 className="text-3xl font-bold text-slate-900">{displayUser.name}</h1>
                        <p className="text-slate-500 font-medium flex items-center gap-1">
                          {displayUser.role} <StarIcon className="h-4 w-4 text-yellow-400" />
                        </p>
                    </div>
                </div>
                <div className="mb-4 hidden sm:block">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-indigo-200 transition-all">
                    Edit Profile
                  </button>
                </div>
            </div>
        </div>

        <div className="px-6 lg:px-10 pt-20 pb-12 max-w-7xl mx-auto space-y-8">
            
            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayStats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <span className={`text-sm font-semibold ${stat.change.includes('+') ? 'text-green-600' : 'text-slate-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">{stat.name}</p>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Saved/In-Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Continue Reading</h2>
                        <a href="#" className="text-indigo-600 text-sm font-medium hover:underline">View All</a>
                    </div>

                    <div className="grid gap-5">
                        {displayPosts.map((post) => (
                          <div key={post.id} className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col sm:flex-row gap-4 sm:items-center">
                            <div className="h-32 sm:h-24 w-full sm:w-32 shrink-0 rounded-xl overflow-hidden relative">
                              <img src={post.featuredImage || "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                            </div>
                            <div className="flex-1 py-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{post.category || 'Article'}</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <ClockIcon className="h-3 w-3" /> {post.readTime}
                                </span>
                              </div>
                              <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">{post.title}</h3>
                              
                              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${post.progress}%` }}></div>
                              </div>
                              <p className="text-xs text-slate-400 mt-1.5">{post.progress === 100 ? 'Completed' : `${post.progress}% complete`}</p>
                            </div>
                            <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                              <HeartIcon className="h-6 w-6" />
                            </button>
                          </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative">
                      <div className="absolute top-6 bottom-6 left-9 w-0.5 bg-slate-100"></div>
                      <div className="space-y-8 relative">
                        {recentActivity.map((item) => (
                          <div key={item.id} className="flex items-start gap-4">
                            <div className={`relative z-10 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center shrink-0 
                              ${item.type === 'like' ? 'bg-pink-100' : 
                                item.type === 'comment' ? 'bg-blue-100' : 
                                item.type === 'follow' ? 'bg-purple-100' : 'bg-emerald-100'}`}>
                               <div className={`w-2 h-2 rounded-full 
                                  ${item.type === 'like' ? 'bg-pink-500' : 
                                    item.type === 'comment' ? 'bg-blue-500' : 
                                    item.type === 'follow' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700 leading-none">{item.text}</p>
                              <span className="text-xs text-slate-400 mt-1 block">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-8 py-2 text-sm text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg hover:border-indigo-200 transition-all">
                        View Full History
                      </button>
                    </div>

                    {/* Engagement Teaser */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                      <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2">Write a Story</h3>
                        <p className="text-indigo-100 text-sm mb-4">Share your knowledge with the community and grow your audience.</p>
                        <button className="bg-white text-indigo-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                          Start Writing
                        </button>
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;