'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  TicketIcon,
  HeartIcon,
  Cog6ToothIcon,
  BellIcon,
  MapPinIcon,
  QrCodeIcon,
  ArrowRightIcon,
  FireIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import TicketModal from './components/TicketModal';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  tier?: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  image: string;
  category?: string;
  rating?: number;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- Sub-Components ---

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active
        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
  </button>
);

const EventCard = ({ event, isUpcoming, onOpenTicket }:{event: EventItem, isUpcoming: boolean, onOpenTicket: (event: any) => void}) => (
  <div className="group relative overflow-hidden rounded-2xl bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1">
    <div className="flex h-full">
      {/* Image Section */}
      <div className="w-1/3 relative">
        <img 
          src={event.image} 
          alt={event.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="w-2/3 p-5 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            {event.category || 'Event'}
          </span>
          {isUpcoming && <div className="bg-slate-700/50 p-1 rounded-lg"><QrCodeIcon className="w-5 h-5 text-white" /></div>}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
          {event.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
          <div className="flex items-center gap-1">
            <CalendarDaysIcon className="w-4 h-4" />
            {event.date}
          </div>
          {event.time && (
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              {event.time}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {isUpcoming ? (
            <button 
                onClick={() => onOpenTicket(event)}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-slate-700 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors w-fit"
              >
                View Ticket
                <ArrowRightIcon className="w-4 h-4" />
              </button>
          ) : (
            <div className="flex items-center gap-1 text-yellow-500">
              <StarIcon className="w-4 h-4" />
              <span className="font-bold text-white">{event.rating || 5}.0</span>
              <span className="text-slate-500 text-xs ml-1">(My Rating)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// --- Main Dashboard ---

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedTicket, setSelectedTicket] = useState(null);

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
      const [profileRes, eventsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`${apiBaseUrl}/site/${slug}/me/events`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const now = new Date();
        const upcoming: EventItem[] = [];
        const past: EventItem[] = [];
        
        (eventsData.items || []).forEach((event: any) => {
          const eventDate = new Date(event.startDate);
          const formattedEvent: any = {
            id: event.id,
            eventId: event.eventId,
            title: event.title,
            date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            location: event.location,
            image: event.imageUrl || 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category: event.ticketName || event.category || 'General Admission',
            rating: 5,
            ticketCode: event.ticketCode,
            ticketName: event.ticketName,
            attendeeName: event.attendeeName,
            checkInStatus: event.checkInStatus,
            qrCodeUrl: event.qrCodeUrl,
            paymentStatus: event.paymentStatus,
          };
          
          if (eventDate >= now) {
            upcoming.push(formattedEvent);
          } else {
            past.push(formattedEvent);
          }
        });
        
        setUpcomingEvents(upcoming);
        setPastEvents(past);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse text-xl text-slate-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <UserCircleIcon className="w-20 h-20 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Please sign in to access your dashboard.
          </h2>
          <Link href={`/auth/signin`}>
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // Display values with defaults
  const displayUser = {
    name: user?.name || session?.user?.name || 'Alex Rivera',
    handle: user?.email ? `@${user.email.split('@')[0]}` : '@user_events',
    role: user?.tier || 'Music Enthusiast',
    avatar: user?.avatar || session?.user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    location: 'San Francisco, CA',
    stats: {
      eventsAttended: pastEvents.length || 42,
      upcoming: upcomingEvents.length || 3,
      following: 128
    }
  };

  // Default events if none loaded
  const displayUpcomingEvents = upcomingEvents.length > 0 ? upcomingEvents : [
    {
      id: '1',
      title: 'Neon Nights Festival',
      date: 'Oct 24, 2024',
      time: '8:00 PM',
      location: 'Chase Center',
      image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      category: 'Music'
    },
    {
      id: '2',
      title: 'Future Tech Summit',
      date: 'Nov 02, 2024',
      time: '9:00 AM',
      location: 'Moscone Center',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      category: 'Tech'
    }
  ];

  const displayPastEvents = pastEvents.length > 0 ? pastEvents : [
    {
      id: '3',
      title: 'Jazz in the Park',
      date: 'Sep 15, 2024',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="font-bold text-xl tracking-tight">Event<span className="text-purple-500">Hive</span></div>
        <img src={displayUser.avatar} alt="User" className="w-8 h-8 rounded-full ring-2 ring-purple-500" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 h-screen sticky top-0 p-6 border-r border-slate-800/50">
          <div className="mb-10 flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <FireIcon className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-2xl font-bold text-white tracking-tight">Event<span className="text-purple-500">Hive</span></h1>
          </div>

          <nav className="space-y-2">
            <NavItem icon={TicketIcon} label="My Tickets" active={true} onClick={() => {}} />
            <NavItem icon={HeartIcon} label="Favorites" active={false} onClick={() => {}} />
            <NavItem icon={CalendarDaysIcon} label="Calendar" active={false} onClick={() => {}} />
            <NavItem icon={BellIcon} label="Notifications" active={false} onClick={() => {}} />
            
            <div className="pt-8 pb-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">Account</div>
              <NavItem icon={Cog6ToothIcon} label="Settings" active={false} onClick={() => {}} />
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          
          {/* Hero Profile Section */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 mb-8 group">
            {/* Banner Image */}
            <div className="h-48 w-full relative">
              <img src={displayUser.cover} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            </div>

            <div className="relative px-6 pb-6 -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
              <div className="relative">
                <img 
                  src={displayUser.avatar} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-2xl border-4 border-slate-900 shadow-2xl object-cover" 
                />
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full" />
              </div>
              
              <div className="flex-1 mb-2">
                <h2 className="text-3xl font-bold text-white">{displayUser.name}</h2>
                <p className="text-purple-400 font-medium">{displayUser.handle}</p>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <MapPinIcon className="w-4 h-4" />
                  {displayUser.location}
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                <div className="text-center px-6 py-2 bg-slate-800 rounded-xl border border-slate-700">
                   <span className="block text-xl font-bold text-white">{displayUser.stats.eventsAttended}</span>
                   <span className="text-xs text-slate-400 uppercase">Events</span>
                </div>
                <div className="text-center px-6 py-2 bg-slate-800 rounded-xl border border-slate-700">
                   <span className="block text-xl font-bold text-white">{displayUser.stats.following}</span>
                   <span className="text-xs text-slate-400 uppercase">Following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs & Content */}
          <div className="flex items-center gap-6 mb-6 border-b border-slate-800 pb-1">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'upcoming' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Upcoming Events
              {activeTab === 'upcoming' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'past' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Past Events
              {activeTab === 'past' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />}
            </button>
          </div>

          {/* Grid Layout for Events */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {activeTab === 'upcoming' ? (
               displayUpcomingEvents.map(event => (
                 <EventCard key={event.id} event={event} isUpcoming={true} onOpenTicket={setSelectedTicket} />
               ))
            ) : (
               displayPastEvents.map(event => (
                 <EventCard key={event.id} event={event} isUpcoming={false} onOpenTicket={setSelectedTicket}/>
               ))
            )}
          </div>
          
          {/* Empty State / Suggestion (Visual Filler) */}
          <div className="mt-8 p-8 rounded-2xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Want to find more experiences?</h3>
            <p className="text-slate-400 mb-4 max-w-md mx-auto">Browse our curated list of events happening in San Francisco this weekend.</p>
            <button className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-200 transition-colors">
              Explore Events
            </button>
          </div>

          {/* THE MODAL */}
          {selectedTicket && (
            <TicketModal 
              event={selectedTicket} 
              onClose={() => setSelectedTicket(null)} 
            />
          )}

        </main>
      </div>
    </div>
  );
}