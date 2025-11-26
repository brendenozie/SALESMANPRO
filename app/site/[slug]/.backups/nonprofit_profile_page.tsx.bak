import React from 'react';
import { 
  HeartIcon, 
  UsersIcon, 
  CalendarIcon, 
  ArrowRightIcon, 
  GlobeAmericasIcon,
  SparklesIcon,
  HandThumbUpIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const CommunityDashboard = () => {
  // Mock Data
  const user = {
    name: "Elena Rodriguez",
    badge: "Community Hero",
    impactScore: 850,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  const impactStats = [
    { label: 'Trees Planted', value: '124', icon: GlobeAmericasIcon, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Hours Volunteered', value: '42', icon: HandThumbUpIcon, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Donations', value: '$1,250', icon: HeartIcon, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  const activeCampaigns = [
    {
      id: 1,
      title: "Clean Water for Rural Schools",
      location: "Kenya",
      image: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      raised: 12500,
      goal: 15000,
      daysLeft: 5,
      donors: 142
    },
    {
      id: 2,
      title: "Urban Garden Initiative",
      location: "Chicago, IL",
      image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      raised: 3200,
      goal: 8000,
      daysLeft: 21,
      donors: 45
    }
  ];

  const upcomingEvents = [
    { id: 1, day: "12", month: "OCT", title: "Annual Beach Cleanup", time: "09:00 AM", attendees: 34 },
    { id: 2, day: "24", month: "OCT", title: "Charity Gala Night", time: "07:00 PM", attendees: 120 },
    { id: 3, day: "02", month: "NOV", title: "Food Bank Drive", time: "10:00 AM", attendees: 15 },
  ];

  return (
    <div className="min-h-screen bg-[#F3F6F4] font-sans text-slate-800">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
                <HeartSolid className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-950">Hope<span className="text-emerald-600">Connect</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#" className="text-emerald-600">My Impact</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Campaigns</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Events</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Stories</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900">{user.name}</span>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">{user.badge}</span>
            </div>
            <img src={user.avatar} className="h-10 w-10 rounded-full border-2 border-white shadow-sm" alt="User" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        
        {/* Welcome & Impact Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Greeting */}
            <div className="lg:col-span-2 bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, {user.name.split(' ')[0]}!</h1>
                        <p className="text-emerald-100 text-lg max-w-lg">
                            Thanks to you, 3 families received clean water this month. Your compassion is changing the world.
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <button className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                            Donate Now
                        </button>
                        <button className="bg-emerald-700/50 backdrop-blur text-white border border-emerald-600 px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                            Find Volunteer Work
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100/50 flex flex-col justify-center gap-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-amber-500" /> Lifetime Impact
                </h3>
                <div className="space-y-6">
                    {impactStats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Active Campaigns Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Urgent Causes</h2>
                    <a href="#" className="text-emerald-600 font-medium hover:underline flex items-center gap-1">
                        View all <ArrowRightIcon className="h-4 w-4" />
                    </a>
                </div>

                <div className="grid gap-6">
                    {activeCampaigns.map((campaign) => {
                        const percent = Math.round((campaign.raised / campaign.goal) * 100);
                        return (
                            <div key={campaign.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300">
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                                        <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1">
                                            <MapPinIcon className="h-3 w-3" /> {campaign.location}
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{campaign.title}</h3>
                                                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-lg">{campaign.daysLeft} days left</span>
                                            </div>
                                            
                                            <div className="mt-4 mb-2 flex justify-between text-sm">
                                                <span className="font-bold text-slate-900">${campaign.raised.toLocaleString()} <span className="font-normal text-slate-500">raised</span></span>
                                                <span className="text-slate-500">of ${campaign.goal.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {[1,2,3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {i === 3 ? `+${campaign.donors}` : ''}
                                                    </div>
                                                ))}
                                                <span className="ml-4 text-sm text-slate-500 self-center">donors</span>
                                            </div>
                                            <button className="text-emerald-700 font-bold text-sm border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors">
                                                Support
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Sidebar: Events & Community */}
            <div className="space-y-8">
                
                {/* Upcoming Events */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/50">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-emerald-600" /> Upcoming Events
                    </h3>
                    <div className="space-y-6">
                        {upcomingEvents.map((event) => (
                            <div key={event.id} className="flex items-center gap-4 group cursor-pointer">
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <span className="text-xs font-bold uppercase">{event.month}</span>
                                    <span className="text-xl font-bold">{event.day}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{event.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                        <span>{event.time}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span>{event.attendees} going</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">
                        View Calendar
                    </button>
                </div>

                {/* Newsletter / Story Teaser */}
                <div className="relative rounded-3xl overflow-hidden h-64 group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Volunteer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">FEATURED STORY</span>
                        <h3 className="text-xl font-bold mb-1">Why I Volunteer</h3>
                        <p className="text-slate-300 text-sm line-clamp-2">"It started as a weekend activity, but it became my life's passion..."</p>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityDashboard;