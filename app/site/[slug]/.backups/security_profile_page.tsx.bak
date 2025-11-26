import React from 'react';
import { 
  LockClosedIcon, 
  MapPinIcon, 
  UserGroupIcon, 
  VideoCameraIcon, 
  BellAlertIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';

const SecurityDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans selection:bg-cyan-700 selection:text-white">
      
      {/* --- HEADER (The Control Panel) --- */}
      <header className="bg-gray-900 border-b border-gray-800 p-6 lg:p-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <LockClosedIcon className="w-8 h-8 text-cyan-500" />
            <div>
              <p className="text-sm font-mono text-gray-500 uppercase tracking-widest">Client Portal V4.1</p>
              <h1 className="text-2xl font-bold text-white">CENTRAL MONITORING OVERVIEW</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-mono text-gray-500">System Time</p>
              <p className="text-white font-bold">{new Date().toLocaleTimeString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-700"></div> {/* User Avatar Placeholder */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">

        {/* --- STATUS PANEL (Top Metrics) --- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <StatCard title="Overall Status" value="ACTIVE" accent="green" />
          <StatCard title="Guards Deployed" value="8" accent="cyan" />
          <StatCard title="Open Incidents" value="1" accent="amber" />
          <StatCard title="CCTV Feeds" value="12/12 ONLINE" accent="green" />

        </section>

        {/* --- MAIN GRID: DEPLOYMENT & LOGS --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Map & Active Deployment */}
          <div className="lg:col-span-2 space-y-8">
            
            <h2 className="text-xl font-bold text-white uppercase tracking-wide border-l-4 border-cyan-500 pl-3">Active Deployments</h2>
            
            {/* Simulated Live Map */}
            <div className="relative h-96 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl shadow-black/50">
              <img 
                 src="http://googleusercontent.com/image_collection/image_retrieval/some_id_string" 
                 alt="Simulated Deployment Map" 
                 className="w-full h-full object-cover opacity-30 blur-[2px]"
              />
              <div className="absolute inset-0 bg-gray-950/70 p-6">
                <div className="flex justify-between items-start">
                   <p className="text-xl font-mono text-cyan-400">ZONE ALPHA: HQ PERIMETER</p>
                   <div className="text-right">
                      <p className="text-xs font-mono text-gray-500">LAST CHECK</p>
                      <p className="text-sm font-bold text-green-500">05:48:32 ZULU</p>
                   </div>
                </div>
                
                {/* Deployment Pin 1 */}
                <DeploymentPin top="30%" left="20%" type="Guard Patrol" status="OK" color="green" animate={false} />
                {/* Deployment Pin 2 - Incident */}
                <DeploymentPin top="55%" left="70%" type="CCTV Alert" status="ALERT" color="amber" animate={true} />
                {/* Deployment Pin 3 */}
                <DeploymentPin top="80%" left="45%" type="Dog Unit" status="OK" color="green" animate={false} />
                <div className="absolute bottom-4 left-4 text-xs font-mono bg-black/70 p-2 rounded-lg border border-gray-700">
                   <p>LAT: 34.0522° LON: 118.2437°</p>
                </div>
              </div>
            </div>

            {/* Recent Incident Log */}
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide border-l-4 border-amber-500 pl-3 mb-4">Incident Log</h3>
              <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800 font-mono">
                <LogEntry time="05:45:12" code="CCTV-2" description="Movement detected in Zone Gamma. HIGH PRIORITY." severity="CRITICAL" />
                <LogEntry time="04:12:55" code="PAT-HQ-03" description="Routine perimeter check completed. Status OK." severity="INFO" />
                <LogEntry time="02:30:00" code="SYSTEM" description="Daily system check and data backup initiated." severity="SYSTEM" />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Management & Documents */}
          <div className="lg:col-span-1 space-y-8">

            {/* Account Manager Card */}
            <div className="bg-gray-900 p-6 rounded-xl border border-cyan-700 shadow-lg shadow-cyan-900/20">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                 <UserGroupIcon className="w-5 h-5 text-cyan-500" /> Account Manager
              </h3>
              <div className="flex items-center gap-4 border-b border-gray-800 pb-4 mb-4">
                 <img src="https://images.unsplash.com/photo-1570295999919-56ceb8e255f4?q=80&w=1000&auto=format&fit=crop" alt="Manager" className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500"/>
                 <div>
                    <p className="text-white font-semibold">Agent Jaxon Ryle</p>
                    <p className="text-xs text-gray-500">Director of Operations</p>
                 </div>
              </div>
              <div className="space-y-2 text-sm">
                <p>Phone: <span className="text-cyan-400 font-mono">+1 (555) 555-4040</span></p>
                <p>Email: <span className="text-cyan-400 font-mono">jaxon.ryle@secureco.com</span></p>
              </div>
              <button className="w-full mt-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-white font-medium text-sm transition-colors">
                Initiate Secure Call
              </button>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
               <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                 <CalendarDaysIcon className="w-5 h-5 text-gray-500" /> Upcoming Schedule
               </h3>
               <ScheduleItem date="NOV 28" event="Private Event Security (Gala)" guards="10 Personnel" />
               <ScheduleItem date="DEC 05" event="Executive Bodyguard Detail" guards="2 Personnel" />
            </div>

            {/* Document Status */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
               <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                 <DocumentTextIcon className="w-5 h-5 text-gray-500" /> Pending Documents
               </h3>
               <DocumentItem name="Q4 Service Report 2023" status="Pending Review" color="amber" />
               <DocumentItem name="Contract Renewal v2.1" status="Ready for Signature" color="green" />
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatCard = ({ title, value, accent }:{title: string; value: string; accent: 'green' | 'cyan' | 'amber'}) => {
  const accentClasses = {
    green: "bg-green-700/20 text-green-400 border-green-500",
    cyan: "bg-cyan-700/20 text-cyan-400 border-cyan-500",
    amber: "bg-amber-700/20 text-amber-400 border-amber-500",
  };
  
  // Custom ring animation for "ACTIVE" status
  const activeRing = accent === 'green' && value === 'ACTIVE' 
    ? "relative before:content-[''] before:absolute before:inset-0 before:ring-2 before:ring-green-500 before:animate-ping before:rounded-lg before:opacity-50" 
    : "";

  return (
    <div className={`p-4 rounded-lg border-l-4 ${accentClasses[accent]} ${activeRing}`}>
      <p className="text-xs font-mono uppercase tracking-widest text-gray-500">{title}</p>
      <div className="flex items-center gap-2 mt-1">
        {accent === 'green' && <div className={`w-3 h-3 rounded-full ${value === 'ACTIVE' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-500'}`} />}
        {accent === 'amber' && value !== '0' && <BellAlertIcon className="w-4 h-4 animate-pulse" />}
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

const LogEntry = ({ time, code, description, severity }:{time: string; code: string; description: string; severity: string}) => {
  const color = severity === 'CRITICAL' ? 'text-red-500' : severity === 'INFO' ? 'text-gray-500' : 'text-cyan-500';
  const dotColor = severity === 'CRITICAL' ? 'bg-red-500' : severity === 'INFO' ? 'bg-gray-500' : 'bg-cyan-500';
  
  return (
    <div className="flex items-start p-3 hover:bg-gray-800 transition-colors">
      <div className={`w-1/6 font-bold ${color} flex items-center gap-2`}>
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        {time}
      </div>
      <div className="w-1/6 text-gray-600 uppercase text-xs">{code}</div>
      <div className="w-4/6 text-sm text-gray-300">{description}</div>
    </div>
  );
};

const DeploymentPin = ({ top, left, type, status, color, animate }:{top: string; left: string; type: string; status: string; color: string; animate: boolean}) => (
  <div className="absolute flex flex-col items-center group cursor-pointer" style={{ top, left }}>
    <div className={`w-3 h-3 rounded-full ${color === 'green' ? 'bg-green-500' : 'bg-amber-500'} ${animate ? 'animate-pulse' : ''} shadow-xl shadow-black`}></div>
    <MapPinIcon className={`w-6 h-6 ${color === 'green' ? 'text-green-500' : 'text-amber-500'} -mt-2 group-hover:scale-110 transition-transform`} />
    <span className={`absolute top-0 mt-8 whitespace-nowrap bg-black/80 backdrop-blur-sm p-1 px-2 rounded text-xs font-mono text-white border border-gray-700 ${color === 'green' ? 'border-green-500/50' : 'border-amber-500/50'}`}>
      {type}: {status}
    </span>
  </div>
);

const ScheduleItem = ({ date, event, guards }:{date: string; event: string; guards: string}) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-800 last:border-b-0 group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="text-center bg-gray-800 p-2 rounded w-12 flex-shrink-0">
        <p className="text-xs font-mono text-gray-500 leading-none">{date.split(' ')[0]}</p>
        <p className="text-lg font-bold text-white leading-none">{date.split(' ')[1] || '00'}</p>
      </div>
      <div>
        <p className="font-semibold text-white group-hover:text-cyan-500 transition-colors">{event}</p>
        <p className="text-xs text-gray-500">{guards}</p>
      </div>
    </div>
    <ChevronRightIcon className="w-4 h-4 text-gray-600 group-hover:text-cyan-500 transition-colors" />
  </div>
);

const DocumentItem = ({ name, status, color }:{name: string; status: string; color: string}) => (
  <div className="flex justify-between items-center py-2 group cursor-pointer border-b border-gray-800 last:border-b-0">
    <div className="flex items-center gap-2">
      <DocumentTextIcon className="w-4 h-4 text-gray-500" />
      <p className="text-sm text-white group-hover:text-cyan-500">{name}</p>
    </div>
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${color === 'amber' ? 'bg-amber-800/50 text-amber-300' : 'bg-green-800/50 text-green-300'}`}>
      {status}
    </span>
  </div>
);

export default SecurityDashboard;