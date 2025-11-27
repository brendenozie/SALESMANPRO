'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
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
} from '@heroicons/react/24/outline';
import { StarIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  tier?: string;
}

interface PropertyListing {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  price: number;
  status: string;
  area: string | null;
  bedrooms: number | null;
  bathrooms: string | null;
  amenities: string[];
  location: string | null;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Sub-Components ---

const BedIcon = (props:{className:string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493M6 17h12m-6-4v4m0 0v4m0-4H6m6 0h6m2 4v-4m0 0V5a2 2 0 00-2-2h-1.28a1 1 0 00-.948.684l-1.498 4.493M18 17H6" />  
  </svg>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }:{icon: React.ElementType, label: string, active: boolean, onClick: () => void, badge?: string | number}) => (
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
    {badge !== undefined && (
      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ icon: Icon, label, value, colorClass }:{icon: React.ElementType, label: string, value: string | number, colorClass: {bg: string, text: string}}) => (
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

const PropertyCard = ({ property }:{property: {id: string | number, title: string, address: string, price: string | number, beds: number, baths: number, sqft: number, image: string, status: string}}) => (
  <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
    {/* Image Container */}
    <div className="relative aspect-[4/3] overflow-hidden">
      <img 
        src={property.image} 
        alt={property.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full 
          ${property.status === 'Active' || property.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
          {property.status}
        </span>
      </div>
      <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-rose-500 transition-colors shadow-sm">
        <HeartSolidIcon className="w-5 h-5" />
      </button>

      {/* Price Overlay (Visible on hover generally, but kept static for clarity) */}
      <div className="absolute bottom-4 left-4 text-white">
         <h3 className="text-2xl font-bold drop-shadow-md">{typeof property.price === 'number' ? `$${property.price.toLocaleString()}` : property.price}</h3>
      </div>
    </div>

    {/* Content */}
    <div className="p-5">
      <h4 className="font-bold text-lg text-slate-800 truncate">{property.title}</h4>
      <div className="flex items-center gap-1 text-slate-500 text-sm mt-1 mb-4">
        <MapPinIcon className="w-4 h-4" />
        <span className="truncate">{property.address}</span>
      </div>

      {/* Specs Grid */}
      <div className="flex items-center justify-between py-3 border-t border-slate-100 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <BedIcon className="w-5 h-5 text-slate-400" />
          <span className="font-semibold">{property.beds}</span> Beds
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[1px] h-4 bg-slate-200"></div>
        </div>
         <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-1.5M2.25 12h19.5m-9.75 5.25l-1.5-1.5m3 0l-1.5 1.5" />
          </svg>
          <span className="font-semibold">{property.baths}</span> Baths
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[1px] h-4 bg-slate-200"></div>
        </div>
        <div className="flex items-center gap-2">
          <Squares2X2Icon className="w-5 h-5 text-slate-400" />
          <span className="font-semibold">{property.sqft.toLocaleString()}</span> Sq Ft
        </div>
      </div>
    </div>
  </div>
);

// --- Main Dashboard Layout ---

export default function RealEstateDashboard() {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('overview');

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
      const [profileRes, propertiesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`${apiBaseUrl}/site/${slug}/me/realestate`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData.items || []);
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
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // Display values with defaults
  const displayUser = {
    name: user?.name || session?.user?.name || 'Sarah Jenkins',
    avatar: user?.avatar || session?.user?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    location: 'Seattle, WA',
    stats: {
      savedHomes: properties.length || 12,
      savedSearches: 4,
      upcomingTours: 2
    }
  };

  const NEXT_TOUR = {
    id: 101,
    propertyTitle: 'The Emerald Penthouse',
    address: '1200 Stewart St, Seattle, WA',
    date: 'Tomorrow, Oct 26',
    time: '10:00 AM',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    agent: {
      name: 'David Chen',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      phone: '(206) 555-0192'
    }
  };

  // Default properties if none loaded
  const displayProperties = properties.length > 0 ? properties.map(p => ({
    id: p.id,
    title: p.title,
    address: p.location || 'Unknown location',
    price: p.price,
    beds: p.bedrooms || 0,
    baths: parseFloat(p.bathrooms || '0'),
    sqft: parseInt(p.area || '0'),
    image: p.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: p.status
  })) : [
    {
      id: '1',
      title: 'Modern Lakeside Villa',
      address: '45 Lake Washington Blvd',
      price: '$2,450,000',
      beds: 4,
      baths: 3.5,
      sqft: 3200,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      status: 'Active'
    },
    {
      id: '2',
      title: 'Downtown Loft with View',
      address: '888 Western Ave #12B',
      price: '$895,000',
      beds: 2,
      baths: 2,
      sqft: 1450,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      status: 'Pending'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="font-bold text-xl tracking-tight text-slate-900">Luxe<span className="text-emerald-600">Estate</span>.</div>
        <img src={displayUser.avatar} alt="User" className="w-8 h-8 rounded-full ring-2 ring-slate-100" />
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 p-5 bg-slate-900 border-r border-slate-800/50 text-slate-100">
          <div className="mb-12 flex items-center gap-2 px-2">
             <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <HomeIcon className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-2xl font-bold tracking-tight">Luxe<span className="text-emerald-400">Estate</span>.</h1>
          </div>

          {/* User Profile Summary in Sidebar */}
          <div className="flex items-center gap-4 mb-8 p-4 bg-slate-800/50 rounded-2xl">
             <img src={displayUser.avatar} alt={displayUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" />
             <div>
                <h3 className="font-bold">{displayUser.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" /> {displayUser.location}
                </p>
             </div>
          </div>

          <nav className="space-y-2 flex-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-4">Dashboard</div>
            <SidebarItem icon={HomeIcon} label="Overview" active={activeNav === 'overview'} onClick={() => setActiveNav('overview')} />
            <SidebarItem icon={HeartIcon} label="Saved Homes" active={activeNav === 'saved'} onClick={() => setActiveNav('saved')} badge={displayUser.stats.savedHomes} />
            <SidebarItem icon={MagnifyingGlassIcon} label="Saved Searches" active={activeNav === 'searches'} onClick={() => setActiveNav('searches')} badge={displayUser.stats.savedSearches} />
            <SidebarItem icon={CalendarDaysIcon} label="Tours & Events" active={activeNav === 'tours'} onClick={() => setActiveNav('tours')} badge={displayUser.stats.upcomingTours} />
            
            <div className="mt-10 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-4">Account</div>
            <SidebarItem icon={BellIcon} label="Notifications" active={activeNav === 'notifications'} onClick={() => setActiveNav('notifications')} />
            <SidebarItem icon={Cog6ToothIcon} label="Settings" active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} />
          </nav>
          
          <button 
            onClick={() => signOut({ callbackUrl: `/site/${slug}` })}
            className="mb-4 flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>

           <div className="p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500/20">
            <h4 className="font-bold text-white mb-1">Need help buying?</h4>
            <p className="text-xs text-slate-300 mb-3">Connect with a premium agent today.</p>
            <button className="w-full py-2 text-sm font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">Find an Agent</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Welcome back, {displayUser.name?.split(' ')[0] || 'there'}.</h1>
              <p className="text-slate-500 mt-1">Here's whats happening with your property search.</p>
            </div>
            <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
              <MagnifyingGlassIcon className="w-5 h-5" />
              Start New Search
            </button>
          </header>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <StatCard 
               icon={HeartIcon} 
               label="Saved Properties" 
               value={displayUser.stats.savedHomes} 
               colorClass={{bg: 'bg-rose-100', text: 'text-rose-600'}}
             />
             <StatCard 
               icon={MagnifyingGlassIcon} 
               label="Active Searches" 
               value={displayUser.stats.savedSearches} 
               colorClass={{bg: 'bg-blue-100', text: 'text-blue-600'}}
             />
             <StatCard 
               icon={CalendarDaysIcon} 
               label="Upcoming Tours" 
               value={displayUser.stats.upcomingTours} 
               colorClass={{bg: 'bg-emerald-100', text: 'text-emerald-600'}}
             />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Main Column: Saved Properties */}
            <div className="xl:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold text-slate-900">Recently Saved Homes</h2>
                 <button className="text-emerald-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                   View all {displayUser.stats.savedHomes} <ArrowRightIcon className="w-4 h-4"/>
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayProperties.slice(0,2).map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
               </div>
                {/* Horizontal Banner Ad / Feature */}
               <div className="relative h-48 rounded-2xl overflow-hidden flex items-center bg-slate-900 mt-6">
                  <img src="https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Luxury" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                  <div className="relative z-10 p-8">
                     <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">New Collection</span>
                     <h3 className="text-2xl font-bold text-white mt-2 mb-4 max-w-md">Explore exclusive waterfront properties in Seattle.</h3>
                     <button className="bg-white text-slate-900 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-slate-100">Browse Collection</button>
                  </div>
               </div>
            </div>

             {/* Right Column: Up Next & Activity */}
             <div className="space-y-8">
               
               {/* Next Tour Card - High Priority */}
               <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Up Next</h2>
                  <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                        Confirmed
                     </div>
                     
                     <div className="flex gap-4 mb-4">
                        <img src={NEXT_TOUR.image} alt="Tour" className="w-20 h-20 rounded-xl object-cover" />
                        <div>
                           <h3 className="font-bold text-slate-900 leading-tight">{NEXT_TOUR.propertyTitle}</h3>
                           <p className="text-sm text-slate-500 mt-1">{NEXT_TOUR.address}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 py-3 border-y border-slate-100 mb-4">
                        <div className="flex items-center gap-2">
                           <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
                           <div>
                              <p className="text-xs text-slate-400 font-bold uppercase">Date</p>
                              <p className="text-sm font-semibold text-slate-900">{NEXT_TOUR.date}</p>
                           </div>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-100"></div>
                        <div className="flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           <div>
                              <p className="text-xs text-slate-400 font-bold uppercase">Time</p>
                              <p className="text-sm font-semibold text-slate-900">{NEXT_TOUR.time}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <img src={NEXT_TOUR.agent.image} alt={NEXT_TOUR.agent.name} className="w-8 h-8 rounded-full border border-slate-200" />
                           <span className="text-sm font-medium text-slate-700">{NEXT_TOUR.agent.name}</span>
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

               {/* Saved Searches List */}
               <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-bold text-slate-900">Saved Searches</h2>
                     <Cog6ToothIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                        <div>
                           <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                              Seattle, WA 
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">2 New</span>
                           </h4>
                           <p className="text-xs text-slate-500 mt-1">2+ Beds · $800k - $1.2M · Condo</p>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                     </div>
                     <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                        <div>
                           <h4 className="font-semibold text-slate-800">Bellevue Waterfront</h4>
                           <p className="text-xs text-slate-500 mt-1">3+ Beds · $2M+ · House</p>
                        </div>
                         <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </section>

             </div>
          </div>

        </main>
      </div>
    </div>
  );
}