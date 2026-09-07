'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BuildingLibraryIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  BellIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  ScaleIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  tier?: string;
}

interface FinanceData {
  id: string;
  total: number;
  status: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const FinanceLegalDashboard = () => {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [financeData, setFinanceData] = useState<FinanceData[]>([]);
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
      const [profileRes, financeRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`${apiBaseUrl}/site/${slug}/me/finance`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }

      if (financeRes.ok) {
        const data = await financeRes.json();
        setFinanceData(data.items || []);
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
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // Display values with defaults
  const displayUser = {
    name: user?.name || session?.user?.name || 'User',
    tier: user?.tier || 'Premium Tier',
    totalWorth: financeData.reduce((sum, item) => sum + (item.total || 0), 0),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="fixed inset-y-0 left-0 w-20 lg:w-64 bg-[#0B1120] text-white transition-all z-20 flex flex-col justify-between">
        <div>
          {/* Logo Area */}
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-white/10">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <span className="hidden lg:block ml-3 font-serif text-xl tracking-wide">Vanguard Legal</span>
          </div>

          {/* Nav Items */}
          <nav className="mt-8 px-4 space-y-2">
            <NavItem icon={<BuildingLibraryIcon className="w-5 h-5"/>} label="Overview" active />
            <NavItem icon={<CreditCardIcon className="w-5 h-5"/>} label="Accounts" active={false}/>
            <NavItem icon={<DocumentTextIcon className="w-5 h-5"/>} label="Documents" active={false} />
            <NavItem icon={<ScaleIcon className="w-5 h-5"/>} label="Case Status" active={false} />
            <NavItem icon={<ArrowTrendingUpIcon className="w-5 h-5"/>} label="Investments" active={false} />
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-300"></div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium">{displayUser.name}</p>
              <p className="text-xs text-slate-400">{displayUser.tier}</p>
            </div>
          </div>
          <button 
            onClick={()=> {
              const returnTo = window.location.origin;

              signOut({
                redirect: true,
                callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
              });
            }}
            className="mt-2 w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="hidden lg:block text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="pl-20 lg:pl-64 transition-all">
        
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-slate-900">Executive Overview</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheckIcon className="w-3 h-3 text-green-600" />
              Encrypted connection • Last synced 2 mins ago
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="bg-[#0B1120] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
              New Transfer
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* --- TOP METRICS ROW --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1: Net Worth */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <BuildingLibraryIcon className="w-24 h-24" />
              </div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Net Worth</p>
              <h3 className="text-3xl font-serif font-bold text-slate-900 mt-2">$2,450,293.00</h3>
              <div className="flex items-center gap-2 mt-4 text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
                <ArrowTrendingUpIcon className="w-4 h-4" />
                <span>+4.2% this month</span>
              </div>
            </div>

            {/* Metric 2: Active Legal Cases */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Matters</p>
                  <h3 className="text-3xl font-serif font-bold text-slate-900 mt-2">3 Cases</h3>
                </div>
                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                  <ScaleIcon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Estate Planning</span>
                  <span className="text-orange-600 font-medium">Action Required</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-2/3"></div>
                </div>
              </div>
            </div>

            {/* Metric 3: Upcoming Tax/Dates */}
            <div className="bg-[#0B1120] p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
               <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
               <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Next Deadline</p>
               <h3 className="text-2xl font-serif mt-2">Quarterly Tax Filing</h3>
               <p className="text-slate-400 text-sm mt-1">Due in 14 days</p>
               <button className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors">
                 Review Documents
               </button>
            </div>
          </div>

          {/* --- MAIN GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Recent Transactions / Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg text-slate-900">Recent Activity</h3>
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">View All</button>
              </div>
              
              <div className="divide-y divide-slate-100">
                {/* Item 1 */}
                <TransactionItem 
                  icon={<ScaleIcon className="w-5 h-5 text-indigo-600" />}
                  bg="bg-indigo-50"
                  title="Retainer Fee: Johnson & Partners"
                  date="Today, 10:23 AM"
                  amount="-$2,500.00"
                  status="Processing"
                />
                {/* Item 2 */}
                <TransactionItem 
                  icon={<ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />}
                  bg="bg-green-50"
                  title="Dividend Payout: S&P 500 ETF"
                  date="Yesterday"
                  amount="+$450.20"
                  status="Completed"
                />
                {/* Item 3 */}
                <TransactionItem 
                  icon={<DocumentTextIcon className="w-5 h-5 text-slate-600" />}
                  bg="bg-slate-100"
                  title="Document Notarization"
                  date="Nov 24, 2023"
                  amount="-$150.00"
                  status="Completed"
                />
                 {/* Item 4 */}
                 <TransactionItem 
                  icon={<CreditCardIcon className="w-5 h-5 text-purple-600" />}
                  bg="bg-purple-50"
                  title="Amex Platinum Payment"
                  date="Nov 21, 2023"
                  amount="-$4,120.50"
                  status="Completed"
                />
              </div>
            </div>

            {/* RIGHT: Document Action Center */}
            <div className="space-y-6">
              
              {/* Action Required Box */}
              <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
                <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">Signature Required</span>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-slate-900 mb-1">NDA Agreement v2.pdf</h4>
                  <p className="text-sm text-slate-500 mb-4">Uploaded by Legal Team • 5.2 MB</p>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800">Sign Now</button>
                    <button className="px-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                       <ArrowDownTrayIcon className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Your Team */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-serif font-bold text-lg text-slate-900 mb-4">Your Advisory Team</h3>
                <div className="space-y-4">
                  <AdvisorRow 
                    img="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"
                    name="James Sterling"
                    role="Senior Wealth Manager"
                  />
                  <AdvisorRow 
                    img="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                    name="Sarah Conners"
                    role="Legal Counsel"
                  />
                </div>
                <button className="w-full mt-6 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Schedule Consultation
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub Components ---

const NavItem = ({ icon, label, active }:{icon: React.ReactNode, label: string, active: boolean}) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
    active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`}>
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const TransactionItem = ({ icon, bg, title, date, amount, status }: {icon: React.ReactNode, bg: string, title: string, date: string, amount: string, status: string}) => (
  <div className="p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</p>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`font-bold font-mono ${amount.startsWith('+') ? 'text-green-600' : 'text-slate-900'}`}>
        {amount}
      </p>
      <div className="flex items-center justify-end gap-1 mt-1">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          status === 'Processing' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
        }`}>
          {status}
        </span>
      </div>
    </div>
  </div>
);

const AdvisorRow = ({ img, name, role }: {img: string, name: string, role: string}) => (
  <div className="flex items-center gap-3">
    <img src={img} alt={name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
    <div>
      <p className="text-sm font-bold text-slate-900">{name}</p>
      <p className="text-xs text-slate-500">{role}</p>
    </div>
    <button className="ml-auto p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
      <BellIcon className="w-5 h-5" />
    </button>
  </div>
);

export default FinanceLegalDashboard;