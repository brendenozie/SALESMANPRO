'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  BellIcon,
  MapPinIcon,
  Squares2X2Icon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// --- Types ---

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  tier?: string;
  stats: {
    savedHomes: number;
    savedSearches: number;
    upcomingTours: number;
  }
}

interface PropertyListing {
  id: string | number;
  title: string;
  address: string; // Unified 'location' to 'address' for consistency
  price: number | string;
  status: 'Active' | 'Pending' | 'Sold';
  area: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  isLiked?: boolean; // Added for UI state
}

interface SavedSearch {
  id: string;
  title: string;
  filters: string;
  newMatches: number;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- Sub-Components ---

const BedIcon = (props: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493M6 17h12m-6-4v4m0 0v4m0-4H6m6 0h6m2 4v-4m0 0V5a2 2 0 00-2-2h-1.28a1 1 0 00-.948.684l-1.498 4.493M18 17H6" />
  </svg>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void, badge?: string | number }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group font-medium
      ${active
        ? 'bg-slate-800 text-white shadow-md'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
  >
    <Icon className={`w-6 h-6 ${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-300'}`} />
    <span>{label}</span>
    {badge !== undefined && badge !== 0 && (
      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ icon: Icon, label, value, colorClass }: { icon: React.ElementType, label: string, value: string | number, colorClass: { bg: string, text: string } }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
    <div className={`p-3 rounded-xl ${colorClass.bg}`}>
      <Icon className={`w-6 h-6 ${colorClass.text}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
    </div>
  </div>
);

// Updated Property Card with Interaction
const PropertyCard = ({ property, onToggleLike }: { property: PropertyListing, onToggleLike: (id: string | number) => void }) => (
  <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full">
    <div className="relative aspect-[4/3] overflow-hidden">
      <img
        src={property.images[0]}
        alt={property.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="absolute top-3 left-3 flex gap-2">
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full 
          ${property.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
          {property.status}
        </span>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleLike(property.id); }}
        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
      >
        {property.isLiked ? <HeartSolidIcon className="w-5 h-5 text-rose-500" /> : <HeartIcon className="w-5 h-5 text-slate-500" />}
      </button>

      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-2xl font-bold drop-shadow-md">
          {typeof property.price === 'number' ? `$${property.price.toLocaleString()}` : property.price}
        </h3>
      </div>
    </div>

    <div className="p-5 flex-1 flex flex-col">
      <h4 className="font-bold text-lg text-slate-800 truncate">{property.title}</h4>
      <div className="flex items-center gap-1 text-slate-500 text-sm mt-1 mb-4">
        <MapPinIcon className="w-4 h-4" />
        <span className="truncate">{property.address}</span>
      </div>

      <div className="mt-auto flex items-center justify-between py-3 border-t border-slate-100 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <BedIcon className="w-5 h-5 text-slate-400" />
          <span className="font-semibold">{property.bedrooms}</span> Beds
        </div>
        <div className="w-[1px] h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-1.5M2.25 12h19.5m-9.75 5.25l-1.5-1.5m3 0l-1.5 1.5" />
          </svg>
          <span className="font-semibold">{property.bathrooms}</span> Baths
        </div>
        <div className="w-[1px] h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <Squares2X2Icon className="w-5 h-5 text-slate-400" />
          <span className="font-semibold">{property.area.toLocaleString()}</span> Sq Ft
        </div>
      </div>
    </div>
  </div>
);

// --- Main Dashboard Layout ---

export default function RealEstateDashboard() {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  const router = useRouter();

  // State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    { id: '1', title: 'Seattle, WA', filters: '2+ Beds · $800k - $1.2M · Condo', newMatches: 2 },
    { id: '2', title: 'Bellevue Waterfront', filters: '3+ Beds · $2M+ · House', newMatches: 0 }
  ]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('overview');

  // Initial Mock Data Loading
  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }

    // Simulate API Fetch
    const loadData = async () => {
      setLoading(true);
      // In a real app, replace this setTimeout with your fetch calls
      await new Promise(resolve => setTimeout(resolve, 800));

      setUser({
        id: 'user_123',
        name: session?.user?.name || 'Sarah Jenkins',
        email: session?.user?.email || 'sarah@example.com',
        avatar: session?.user?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        stats: { savedHomes: 3, savedSearches: 2, upcomingTours: 1 }
      });

      setProperties([
        {
          id: '1',
          title: 'Modern Lakeside Villa',
          address: '45 Lake Washington Blvd',
          price: 2450000,
          status: 'Active',
          area: 3200,
          bedrooms: 4,
          bathrooms: 3.5,
          images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          isLiked: true
        },
        {
          id: '2',
          title: 'Downtown Loft with View',
          address: '888 Western Ave #12B',
          price: 895000,
          status: 'Pending',
          area: 1450,
          bedrooms: 2,
          bathrooms: 2,
          images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          isLiked: true
        },
        {
          id: '3',
          title: 'Forest Retreat',
          address: '1092 Pine Cone Way',
          price: 1250000,
          status: 'Active',
          area: 2800,
          bedrooms: 3,
          bathrooms: 3,
          images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          isLiked: true
        }
      ]);
      setLoading(false);
    };

    if (status === 'authenticated') {
      loadData();
    }
  }, [status, session]);

  // Handlers
  const handleToggleLike = (id: string | number) => {
    setProperties(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, isLiked: !p.isLiked };
      }
      return p;
    }));
    // In real app: await fetch('/api/likes', { method: 'POST', body: ... })
  };

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
    if(user) setUser({ ...user, stats: { ...user.stats, savedSearches: user.stats.savedSearches - 1 }});
  };

  // --- Render Views ---
  
  const renderContent = useCallback(() => {
    switch (activeNav) {
      case 'saved':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Saved Properties ({properties.filter(p => p.isLiked).length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.filter(p => p.isLiked).map(property => (
                <PropertyCard key={property.id} property={property} onToggleLike={handleToggleLike} />
              ))}
              {properties.filter(p => p.isLiked).length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                  <HeartIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No saved homes yet. Start exploring!</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'searches':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Saved Searches</h2>
            <div className="space-y-4">
              {savedSearches.map(search => (
                 <div key={search.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-colors shadow-sm group">
                  <div className="flex-1">
                     <h4 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                       {search.title}
                       {search.newMatches > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">{search.newMatches} New Matches</span>}
                     </h4>
                     <p className="text-slate-500 mt-1 flex items-center gap-2"><MagnifyingGlassIcon className="w-4 h-4" /> {search.filters}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="text-slate-400 hover:text-emerald-600 font-semibold text-sm">View Results</button>
                    <button onClick={() => handleDeleteSearch(search.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                 </div>
              ))}
              {savedSearches.length === 0 && (
                 <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                  <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No saved searches.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'overview':
      default:
        // The original Overview Dashboard
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                <button onClick={() => setActiveNav('saved')} className="text-emerald-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  View all saved <ArrowRightIcon className="w-4 h-4"/>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.slice(0, 2).map(property => (
                  <PropertyCard key={property.id} property={property} onToggleLike={handleToggleLike} />
                ))}
              </div>

               <div className="relative h-48 rounded-2xl overflow-hidden flex items-center bg-slate-900 mt-6 shadow-xl">
                 <img src="https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Luxury" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                 <div className="relative z-10 p-8">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">New Collection</span>
                    <h3 className="text-2xl font-bold text-white mt-2 mb-4 max-w-md">Explore exclusive waterfront properties in Seattle.</h3>
                    <button className="bg-white text-slate-900 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-colors">Browse Collection</button>
                 </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Upcoming Tour */}
               <section>
                 <h2 className="text-xl font-bold text-slate-900 mb-6">Up Next</h2>
                 <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Confirmed</div>
                    
                    <div className="flex gap-4 mb-4">
                       <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Tour" className="w-20 h-20 rounded-xl object-cover" />
                       <div>
                          <h3 className="font-bold text-slate-900 leading-tight">The Emerald Penthouse</h3>
                          <p className="text-sm text-slate-500 mt-1">1200 Stewart St, Seattle, WA</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 py-3 border-y border-slate-100 mb-4">
                       <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
                          <div>
                             <p className="text-xs text-slate-400 font-bold uppercase">Date</p>
                             <p className="text-sm font-semibold text-slate-900">Tomorrow, Oct 26</p>
                          </div>
                       </div>
                       <div className="w-[1px] h-8 bg-slate-100"></div>
                       <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <div>
                             <p className="text-xs text-slate-400 font-bold uppercase">Time</p>
                             <p className="text-sm font-semibold text-slate-900">10:00 AM</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Agent" className="w-8 h-8 rounded-full border border-slate-200" />
                          <span className="text-sm font-medium text-slate-700">David Chen</span>
                       </div>
                       <div className="flex gap-2">
                          <button className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                             <ChatBubbleLeftRightIcon className="w-5 h-5" />
                          </button>
                          <button className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                             <PhoneIcon className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Quick Saved Searches Widget */}
              <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Quick Searches</h2>
                    <button onClick={() => setActiveNav('searches')} className="text-emerald-600 text-xs font-bold hover:underline">View All</button>
                 </div>
                 <div className="space-y-3">
                   {savedSearches.slice(0, 3).map(search => (
                      <div key={search.id} onClick={() => setActiveNav('searches')} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                        <div>
                           <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                             {search.title} 
                             {search.newMatches > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{search.newMatches} New</span>}
                           </h4>
                           <p className="text-xs text-slate-500 mt-1 truncate max-w-[150px]">{search.filters}</p>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                   ))}
                 </div>
              </section>
            </div>
          </div>
        );
    }
  }, [activeNav, properties, savedSearches, handleToggleLike, handleDeleteSearch]);

  // --- Auth Check UI ---

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-slate-600 font-medium">Loading your dashboard...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md">
          <UserCircleIcon className="w-20 h-20 mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-6">Please sign in to access your saved homes, searches, and tour schedule.</p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/30"
          >
            Sign In
          </button>
        </div>
      </section>
    );
  }

  // --- Render Main Layout ---

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
        {/* <div className="font-bold text-xl tracking-tight text-slate-900">Luxe<span className="text-emerald-600">Estate</span>.</div> */}
        <img src={user?.avatar || ''} alt="User" className="w-8 h-8 rounded-full ring-2 ring-slate-100" />
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        
        {/* Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 p-5 bg-slate-900 border-r border-slate-800/50 text-slate-100 shadow-2xl z-10">
          <div className="mb-12 flex items-center gap-2 px-2">
             <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <HomeIcon className="w-6 h-6 text-white" />
             </div>
             {/* <h1 className="text-2xl font-bold tracking-tight">Luxe<span className="text-emerald-400">Estate</span>.</h1> */}
          </div>

          <div className="flex items-center gap-4 mb-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
             <img src={user?.avatar || ''} alt={user?.name || ''} className="w-12 h-12 rounded-full object-cover border-2 border-slate-600" />
             <div className="overflow-hidden">
                <h3 className="font-bold truncate">{user?.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" /> Seattle, WA
                </p>
             </div>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-4">Dashboard</div>
            <SidebarItem icon={HomeIcon} label="Overview" active={activeNav === 'overview'} onClick={() => setActiveNav('overview')} />
            <SidebarItem 
              icon={HeartIcon} 
              label="Saved Homes" 
              active={activeNav === 'saved'} 
              onClick={() => setActiveNav('saved')} 
              badge={properties.filter(p => p.isLiked).length} 
            />
            <SidebarItem 
              icon={MagnifyingGlassIcon} 
              label="Saved Searches" 
              active={activeNav === 'searches'} 
              onClick={() => setActiveNav('searches')} 
              badge={savedSearches.length} 
            />
            <SidebarItem icon={CalendarDaysIcon} label="Tours & Events" active={activeNav === 'tours'} onClick={() => setActiveNav('tours')} badge={user?.stats.upcomingTours} />
            
            <div className="mt-10 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-4">Account</div>
            <SidebarItem icon={BellIcon} label="Notifications" active={activeNav === 'notifications'} onClick={() => setActiveNav('notifications')} />
            <SidebarItem icon={Cog6ToothIcon} label="Settings" active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} />
          </nav>
          
          <button 
            onClick={()=> {
              const returnTo = window.location.origin;

              signOut({
                redirect: true,
                callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
              });
            }}
            className="mb-4 mt-4 flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-red-900/30 hover:text-red-300 transition-all group"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen scroll-smooth">
          
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {activeNav === 'overview' ? `Welcome back, ${user?.name?.split(' ')[0]}.` : 
                 activeNav === 'saved' ? 'Your Saved Collection' :
                 activeNav === 'searches' ? 'Managed Searches' : 'Dashboard'}
              </h1>
              <p className="text-slate-500 mt-1">
                {activeNav === 'overview' ? "Here's what's happening with your property search." : 
                 activeNav === 'saved' ? "Review the properties you've shortlisted." : "Manage your alerts and search criteria."}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                 <BellIcon className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 transform active:scale-95 duration-150">
                <MagnifyingGlassIcon className="w-5 h-5" />
                Start New Search
              </button>
            </div>
          </header>

          {/* Conditional Content Rendering */}
          <div className="animate-fade-in">
             {/* Stats Row - Always visible on overview, optional on others */}
             {activeNav === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard 
                    icon={HeartIcon} 
                    label="Saved Properties" 
                    value={properties.filter(p => p.isLiked).length} 
                    colorClass={{bg: 'bg-rose-100', text: 'text-rose-600'}}
                  />
                  <StatCard 
                    icon={MagnifyingGlassIcon} 
                    label="Active Searches" 
                    value={savedSearches.length} 
                    colorClass={{bg: 'bg-blue-100', text: 'text-blue-600'}}
                  />
                  <StatCard 
                    icon={CalendarDaysIcon} 
                    label="Upcoming Tours" 
                    value={user?.stats.upcomingTours || 0} 
                    colorClass={{bg: 'bg-emerald-100', text: 'text-emerald-600'}}
                  />
                </div>
             )}

             {/* Dynamic Content */}
             {renderContent()}
          </div>

        </main>
      </div>
    </div>
  );
}