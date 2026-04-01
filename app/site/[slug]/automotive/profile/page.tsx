'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  WrenchScrewdriverIcon, 
  TrophyIcon, 
  MapIcon, 
  ShoppingCartIcon, 
  BoltIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightIcon,
  FunnelIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  tier?: string;
}

interface AutomotiveListing {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  price: number;
  make: string | null;
  model: string | null;
  year: number | null;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const AutomotiveDashboard = () => {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<AutomotiveListing[]>([]);
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
      const [profileRes, automotiveRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`${apiBaseUrl}/site/${slug}/me/automotive`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }

      if (automotiveRes.ok) {
        const data = await automotiveRes.json();
        setListings(data.items || []);
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-pulse text-xl text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center">
          <UserCircleIcon className="w-20 h-20 mx-auto text-zinc-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Please sign in to access your garage.
          </h2>
          <Link href={`/auth/signin`}>
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // Display values with defaults
  const displayUser = {
    name: user?.name || session?.user?.name || 'Driver',
    handle: (user?.name || session?.user?.name || 'DRIVER').toUpperCase().replace(/\s/g, '_'),
    avatar: user?.avatar || session?.user?.image,
    vehicleCount: listings.length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      
      {/* --- BACKGROUND ELEMENTS --- */}
      {/* Carbon fiber-esque pattern feel */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none z-0"></div>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex min-h-screen">
        
        {/* --- SIDEBAR NAVIGATION (Slim & Technical) --- */}
        <aside className="w-20 lg:w-24 bg-zinc-900/80 backdrop-blur-md border-r border-zinc-800 flex flex-col items-center py-8 fixed h-full z-50">
          <div className="mb-12">
            <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center transform -skew-x-12">
               <BoltIcon className="w-6 h-6 text-white transform skew-x-12" />
            </div>
          </div>
          
          <nav className="flex-1 space-y-8 w-full flex flex-col items-center">
            <NavIcon icon={<UserCircleIcon />} label="Profile" active />
            <NavIcon icon={<WrenchScrewdriverIcon />} label="Garage" active={false} />
            <NavIcon icon={<MapIcon />} label="Routes" active={false} />
            <NavIcon icon={<ShoppingCartIcon />} label="Market" active={false} />
            <NavIcon icon={<TrophyIcon />} label="Events" active={false} />
          </nav>

          <div className="mt-auto space-y-4">
             <NavIcon icon={<CogIcon />} label="Settings" active={false} />
             <button 
               onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` })}
               className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors"
             >
               <ArrowRightOnRectangleIcon className="w-6 h-6" />
             </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 pl-20 lg:pl-24 w-full">
          
          {/* HEADER */}
          <header className="px-8 py-6 flex justify-between items-end border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-40">
            <div>
              <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase mb-1">Driver Profile</p>
              <h1 className="text-3xl font-black italic tracking-tighter text-white">{displayUser.handle}</h1>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-right hidden md:block">
                 <p className="text-xs text-zinc-500 font-mono">Vehicles</p>
                 <div className="flex items-center gap-1 text-red-500 font-bold">
                   <WrenchScrewdriverIcon className="w-4 h-4" /> 
                   <span>Level 42</span>
                 </div>
               </div>
               <div className="w-12 h-12 rounded-full border-2 border-zinc-800 overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" />
               </div>
            </div>
          </header>

          <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12">

            {/* --- HERO: CURRENT RIDE --- */}
            <section className="relative w-full aspect-[16/7] rounded-3xl overflow-hidden group border border-zinc-800 shadow-2xl shadow-black">
              {/* Image */}
              <img 
                src="https://images.unsplash.com/photo-1603584173870-7b299f589279?q=80&w=2069&auto=format&fit=crop" 
                alt="Main Car" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>

              {/* Car Stats Overlay */}
              <div className="absolute inset-y-0 left-0 p-8 flex flex-col justify-center max-w-lg">
                <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 w-fit uppercase tracking-widest mb-2 transform -skew-x-12">
                   Daily Driver
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
                  Porsche 911 <span className="text-red-600">GT3 RS</span>
                </h2>
                <div className="flex items-center gap-4 text-zinc-300 font-mono text-sm mb-8">
                  <span>2023 Model</span>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full"></span>
                  <span>Weissach Package</span>
                </div>

                {/* Technical Grid */}
                <div className="grid grid-cols-3 gap-4 border-t border-zinc-700/50 pt-6">
                  <div>
                    <p className="text-zinc-500 text-xs font-mono uppercase">Power</p>
                    <p className="text-2xl font-bold font-mono">518 <span className="text-sm text-red-500">HP</span></p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs font-mono uppercase">0-60 MPH</p>
                    <p className="text-2xl font-bold font-mono">2.7 <span className="text-sm text-zinc-500">s</span></p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs font-mono uppercase">Torque</p>
                    <p className="text-2xl font-bold font-mono">342 <span className="text-sm text-zinc-500">lb-ft</span></p>
                  </div>
                </div>

                <button className="mt-8 flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase text-sm tracking-wide hover:bg-zinc-200 transition-colors w-fit transform -skew-x-12 group-hover:skew-x-0 transition-transform">
                  <span className="transform skew-x-12 group-hover:skew-x-0">View Build Log</span>
                  <ArrowRightIcon className="w-4 h-4 transform skew-x-12 group-hover:skew-x-0" />
                </button>
              </div>
            </section>

            {/* --- DASHBOARD GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT: Garage List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold uppercase italic tracking-wide flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 skew-x-12"></div>
                    My Garage
                  </h3>
                  <button className="text-xs font-mono text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1 rounded hover:border-white transition-colors">
                    + Add Vehicle
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Car Card 1 */}
                  <CarCard 
                    image="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
                    name="Chevrolet Camaro SS"
                    year={2018}
                    tag="Project Car"
                    status="In Shop"
                  />
                  {/* Car Card 2 */}
                  <CarCard 
                    image="https://images.unsplash.com/photo-1580273916550-e323be2ed5d6?q=80&w=1974&auto=format&fit=crop"
                    name="BMW M4 Competition"
                    year={2021}
                    tag="Track Day"
                    status="Ready"
                  />
                </div>

                {/* Maintenance Timeline */}
                <div className="mt-12">
                   <h3 className="text-xl font-bold uppercase italic tracking-wide flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-zinc-600 skew-x-12"></div>
                    Service History
                  </h3>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[9px] before:w-[2px] before:bg-zinc-800">
                      <TimelineItem 
                         title="Oil Change & Filter" 
                         car="Porsche 911 GT3" 
                         date="2 Days ago" 
                         active 
                      />
                      <TimelineItem 
                         title="New Michelin Pilot Sport Cup 2" 
                         car="BMW M4" 
                         date="2 Weeks ago" 
                         active={false}
                      />
                       <TimelineItem 
                         title="Suspension Tuning" 
                         car="Camaro SS" 
                         date="1 Month ago" 
                          active={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Stats & Community */}
              <div className="space-y-8">
                
                {/* Driver Stats Box */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-md">
                   <h4 className="text-zinc-500 font-mono text-xs uppercase mb-4">Driving Stats</h4>
                   
                   <div className="space-y-4">
                      {/* Stat 1 */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-300">Track Days</span>
                          <span className="font-mono text-white">12/20</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full w-[60%] bg-gradient-to-r from-red-600 to-orange-500"></div>
                        </div>
                      </div>

                       {/* Stat 2 */}
                       <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-300">Garage Value</span>
                          <span className="font-mono text-green-400">+$12k</span>
                        </div>
                         <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold text-white">$482,000</span>
                         </div>
                      </div>
                   </div>

                   <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-zinc-950 rounded border border-zinc-800">
                         <BoltIcon className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                         <div className="text-xs text-zinc-500">Top Speed</div>
                         <div className="font-mono font-bold">198 mph</div>
                      </div>
                      <div className="text-center p-3 bg-zinc-950 rounded border border-zinc-800">
                         <MapIcon className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                         <div className="text-xs text-zinc-500">Miles Driven</div>
                         <div className="font-mono font-bold">14.2k</div>
                      </div>
                   </div>
                </div>

                {/* Upcoming Events */}
                <div>
                   <h4 className="text-white font-bold uppercase italic mb-4 flex justify-between items-center">
                     Upcoming Meets
                     <span className="text-xs not-italic font-normal text-red-500 cursor-pointer hover:underline">View Map</span>
                   </h4>
                   <div className="space-y-3">
                      <EventCard day="14" month="OCT" title="Cars & Coffee: Downtown" loc="Los Angeles, CA" />
                      <EventCard day="22" month="OCT" title="Track Day: Laguna Seca" loc="Monterey, CA" />
                   </div>
                </div>

                {/* Part Marketplace Promo */}
                <div className="relative h-40 rounded-xl overflow-hidden border border-zinc-800 group cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                     <p className="text-xs text-yellow-400 font-bold uppercase mb-1">Marketplace</p>
                     <p className="text-lg font-bold text-white leading-tight">Find Parts for <br/> your 911 GT3</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

// --- Sub Components ---

const NavIcon = ({ icon, label, active }:{icon: React.ReactNode, label: string, active: boolean}) => (
  <div className={`relative group cursor-pointer flex justify-center w-full py-3 border-l-2 transition-all duration-300 ${
    active ? 'border-red-600 bg-red-600/10' : 'border-transparent hover:bg-zinc-800'
  }`}>
    <div className={`w-6 h-6 transition-colors duration-300 ${
      active ? 'text-red-500' : 'text-zinc-500 group-hover:text-white'
    }`}>
      {icon}
    </div>
    {/* Tooltip */}
    <span className="absolute left-16 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
      {label}
    </span>
  </div>
);

const CarCard = ({ image, name, year, tag, status }:{image: string, name: string, year: number, tag: string, status: string}) => (
  <div className="group relative aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
    <img src={image} alt={name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white">
      {tag}
    </div>

    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-zinc-400 text-xs font-mono">{year}</p>
          <h4 className="text-white font-bold italic">{name}</h4>
        </div>
        <div className={`w-2 h-2 rounded-full mb-1 ${status === 'Ready' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-orange-500'}`}></div>
      </div>
    </div>
  </div>
);

const TimelineItem = ({ title, car, date, active }:{title: string, car: string, date: string, active: boolean}) => (
  <div className="relative pl-8 flex flex-col gap-1">
    <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-zinc-900 ${
      active ? 'bg-red-500' : 'bg-zinc-700'
    }`}></div>
    <h5 className={`font-bold text-sm ${active ? 'text-white' : 'text-zinc-400'}`}>{title}</h5>
    <p className="text-xs text-zinc-500">{car} • {date}</p>
  </div>
);

const EventCard = ({ day, month, title, loc }:{day: string, month: string, title: string, loc: string}) => (
  <div className="flex gap-4 p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/50 cursor-pointer transition-colors group">
     <div className="flex flex-col items-center justify-center w-14 bg-zinc-950 rounded border border-zinc-800 group-hover:border-red-600/50 transition-colors">
       <span className="text-[10px] text-zinc-500 uppercase">{month}</span>
       <span className="text-xl font-bold text-white">{day}</span>
     </div>
     <div className="flex-1 flex flex-col justify-center">
       <h5 className="text-white font-bold text-sm leading-tight group-hover:text-red-500 transition-colors">{title}</h5>
       <p className="text-zinc-500 text-xs mt-0.5">{loc}</p>
     </div>
  </div>
);

export default AutomotiveDashboard;