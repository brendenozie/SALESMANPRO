'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPinIcon, 
  LinkIcon, 
  CalendarDaysIcon, 
  PencilSquareIcon,
  PlayCircleIcon,
  HeartIcon,
  StarIcon,
  Cog6ToothIcon,
  FireIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  tier?: string;
  createdAt: string;
}

interface MediaItem {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  videos: string[] | null;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const UserProfile = () => {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
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
      const [profileRes, mediaRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`${apiBaseUrl}/site/${slug}/me/media`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMedia(mediaData.items || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show sign-in prompt if not authenticated
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f111a]">
        <div className="animate-pulse text-xl text-slate-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-[#0f111a]">
        <div className="text-center">
          <UserCircleIcon className="w-20 h-20 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Please sign in to access your profile.
          </h2>
          <Link href={`/auth/signin`}>
            <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // Display values with defaults
  const displayUser = {
    name: user?.name || session?.user?.name || 'Creator',
    handle: `@${(user?.email || session?.user?.email || 'user').split('@')[0]}`,
    avatar: user?.avatar || session?.user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop',
    bio: user?.bio || 'Visual storyteller & film enthusiast. Creating digital dreams one pixel at a time. 🎥 ✨',
    joinedYear: user?.createdAt ? new Date(user.createdAt).getFullYear() : 2024,
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-300 font-sans selection:bg-violet-500 selection:text-white">
      
      {/* --- BACKGROUND ACCENTS --- */}
      {/* These provide the subtle glowing background atmosphere */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-violet-900/20 to-[#0f111a] -z-10" />
      <div className="fixed top-20 right-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
      
      {/* --- MAIN CONTAINER --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- HEADER / COVER IMAGE --- */}
        <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 group">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
            alt="Cover" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-transparent to-transparent opacity-90" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="bg-black/30 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-all text-sm font-medium">
              <PencilSquareIcon className="w-4 h-4" /> Edit Cover
            </button>
            <button 
              onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` })}
              className="bg-black/30 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-500/20 transition-all text-sm font-medium"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* --- PROFILE DATA SECTION --- */}
        <div className="relative -mt-20 px-4 md:px-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* LEFT COLUMN: Avatar & Bio */}
            <div className="w-full lg:w-1/4 flex flex-col items-center lg:items-start z-10">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-violet-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000"></div>
                <div className="relative w-36 h-36 rounded-full border-4 border-[#0f111a] overflow-hidden">
                  <img 
                    src={displayUser.avatar} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#0f111a] rounded-full"></div>
              </div>

              {/* User Details */}
              <div className="mt-4 text-center lg:text-left space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {displayUser.name}
                </h1>
                <p className="text-violet-400 font-medium">{displayUser.handle}</p>
                
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  {displayUser.bio}
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                    <MapPinIcon className="w-4 h-4 text-slate-500" /> Tokyo, JP
                  </span>
                  <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                    <LinkIcon className="w-4 h-4 text-slate-500" /> elena.io
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4 text-slate-500" /> Joined {displayUser.joinedYear}
                  </span>
                </div>

                <div className="flex gap-3 mt-6 w-full">
                  <button className="flex-1 bg-white text-black font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors shadow-lg shadow-white/5">
                    Follow
                  </button>
                  <button className="p-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-white hover:bg-slate-800 transition-colors">
                    <Cog6ToothIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Mini Stats Grid */}
              <div className="grid grid-cols-3 gap-2 w-full mt-8 p-4 bg-slate-900/50 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">2.4k</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Followers</div>
                </div>
                <div className="text-center border-l border-white/5">
                  <div className="text-lg font-bold text-white">142</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Reviews</div>
                </div>
                <div className="text-center border-l border-white/5">
                  <div className="text-lg font-bold text-white">89</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Lists</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Dashboard Content */}
            <div className="w-full lg:w-3/4 pt-4 lg:pt-12">
              
              {/* Tabs */}
              <div className="flex items-center gap-8 border-b border-white/5 pb-4 mb-8 overflow-x-auto">
                <button className="text-white font-medium border-b-2 border-violet-500 pb-4 -mb-4.5 whitespace-nowrap">Overview</button>
                <button className="text-slate-500 hover:text-white transition-colors whitespace-nowrap font-medium">Watchlist</button>
                <button className="text-slate-500 hover:text-white transition-colors whitespace-nowrap font-medium">Reviews</button>
                <button className="text-slate-500 hover:text-white transition-colors whitespace-nowrap font-medium">Likes</button>
              </div>

              {/* Continue Watching Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlayCircleIcon className="w-6 h-6 text-violet-500" /> Continue Watching
                  </h2>
                  <a href="#" className="text-sm text-violet-400 hover:text-violet-300">View All</a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {/* Card 1 */}
                   <MediaCard 
                      image="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop" 
                      title="Cyberpunk: Neon City" 
                      subtitle="S1:E4 • 24m remaining"
                      progress={60}
                   />
                   {/* Card 2 */}
                   <MediaCard 
                      image="https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=2000&auto=format&fit=crop" 
                      title="The Deep Blue" 
                      subtitle="2h 14m remaining"
                      progress={15}
                   />
                   {/* Card 3 */}
                   <MediaCard 
                      image="https://images.unsplash.com/photo-1512070679635-db48bd796be3?q=80&w=2070&auto=format&fit=crop" 
                      title="Abstract Art" 
                      subtitle="Docuseries • Ep 2"
                      progress={85}
                   />
                </div>
              </div>

              {/* Favorites / Activity Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Favorites Section (2/3 width) */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <HeartIcon className="w-6 h-6 text-rose-500" /> Favorites
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                     {[1,2,3].map((i) => (
                       <div key={i} className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-slate-800">
                         <img 
                           src={`https://source.unsplash.com/random/400x600?movie&sig=${i}`} 
                           // Note: Unsplash random might be deprecated, using static placeholders in real prod
                           srcSet={`https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop`}
                           alt="Movie Poster"
                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <span className="text-white font-bold text-sm">Interstellar</span>
                            <span className="text-slate-300 text-xs">2014 • Sci-Fi</span>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>

                {/* Recent Activity (1/3 width) */}
                <div className="lg:col-span-1">
                   <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FireIcon className="w-6 h-6 text-orange-500" /> Activity
                  </h2>
                  <div className="space-y-4">
                    <ActivityItem 
                      icon={<StarIcon className="w-4 h-4 text-yellow-500" />}
                      text={<span>Rated <strong className="text-white">Dune Part Two</strong></span>}
                      time="2h ago"
                    />
                    <ActivityItem 
                      icon={<HeartIcon className="w-4 h-4 text-rose-500" />}
                      text={<span>Liked <strong className="text-white">Oppenheimer</strong> review</span>}
                      time="5h ago"
                    />
                    <ActivityItem 
                      icon={<PlayCircleIcon className="w-4 h-4 text-violet-500" />}
                      text={<span>Watched <strong className="text-white">The Bear S2</strong></span>}
                      time="1d ago"
                    />
                    
                    {/* Glass box promo */}
                    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-indigo-500/20 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/30 blur-2xl rounded-full -mr-10 -mt-10"></div>
                      <h3 className="text-white font-bold relative z-10">Go Premium</h3>
                      <p className="text-xs text-indigo-200 mt-1 mb-3 relative z-10">Unlock 4K streaming and exclusive badges.</p>
                      <button className="text-xs bg-white text-indigo-900 font-bold px-4 py-2 rounded-lg relative z-10 hover:bg-indigo-50 transition-colors">Upgrade</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub Components ---

const MediaCard = ({ image, title, subtitle, progress } : { image: string; title: string; subtitle: string; progress: number }) => (
  <div className="group relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-black/40">
    <img 
      src={image} 
      alt={title} 
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
    
    {/* Play Button */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
        <PlayCircleIcon className="w-8 h-8 text-white" />
      </div>
    </div>

    {/* Content */}
    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
      <h3 className="text-white font-bold text-sm truncate">{title}</h3>
      <p className="text-slate-400 text-xs mb-2">{subtitle}</p>
      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-violet-500" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ icon, text, time }:{ icon: React.ReactNode; text: React.ReactNode; time: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
    <div className="mt-0.5 min-w-[1rem]">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-slate-300 leading-tight">{text}</p>
      <p className="text-xs text-slate-500 mt-1">{time}</p>
    </div>
  </div>
);

export default UserProfile;