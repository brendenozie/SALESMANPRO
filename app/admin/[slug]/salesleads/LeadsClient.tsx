"use client";

import { 
  InboxIcon, PauseIcon, PlayIcon, 
  CheckCircleIcon, PaperAirplaneIcon, 
  DevicePhoneMobileIcon, ArrowPathIcon,
  ClockIcon, SparklesIcon, ShieldCheckIcon,
  ChevronRightIcon, BeakerIcon, UserGroupIcon,
  SpeakerWaveIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";

export default function LeadsClient({ initialLeads, companyId }: { initialLeads: any[], companyId: string }) {
  // --- STATE MANAGEMENT ---
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [isSmartPausing, setIsSmartPausing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>("Standby");
  const [activeScript, setActiveScript] = useState<'A' | 'B' | 'C'>('A');
  const [activeStage, setActiveStage] = useState('cold');
  const [timeLeft, setTimeLeft] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [currentProcessingId, setCurrentProcessingId] = useState<string | null>(null);

  const scrollParentRef = useRef<HTMLDivElement>(null);

  // --- CONFIGURATION ---
  const DAILY_MAX = 50;
  const BATCH_SIZE = 10;
  const SMART_PAUSE_DURATION = 900; // 15 minutes in seconds

  const scripts = {
    A: "Hi 👋 hope you’re well. I work with small businesses to help them get more customers using simple websites. Quick question — do you currently use a website?",
    B: "Hi 👋 Quick one — do you use a website for your business or side hustle?",
    C: "Hi 👋 hope uko poa. Quick one — do you already have a website for your biashara?"
  };

  const stages = [
    { id: "cold", label: "Discovery", icon: UserGroupIcon, color: "bg-blue-500" },
    { id: "replied", label: "Engaged", icon: SparklesIcon, color: "bg-purple-500" },
    { id: "interested", label: "Warm", icon: BeakerIcon, color: "bg-orange-500" },
    { id: "paid", label: "Converted", icon: CheckCircleIcon, color: "bg-emerald-500" },
  ];

  // --- UTILITIES ---
  const playNotification = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => console.log("Audio blocked by browser"));
  };

  // --- AUTO-SCROLL EFFECT ---
  useEffect(() => {
    if (currentProcessingId) {
      const element = document.getElementById(`lead-${currentProcessingId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentProcessingId]);

  // --- THE ENGINE ---
  const startEngine = async () => {
    const queue = selectedLeads.length > 0 
      ? leads.filter(l => selectedLeads.includes(l.id))
      : leads.filter(l => l.stage === 'cold' && l.automationStatus !== 'sent');

    if (queue.length === 0) return alert("No leads to process!");
    setIsAutoRunning(true);

    for (const lead of queue) {
      if (!isAutoRunning || dailyCount >= DAILY_MAX) break;

      // 1. Check for Smart Pause (Every 10 leads)
      if (batchCount > 0 && batchCount % BATCH_SIZE === 0) {
        setIsSmartPausing(true);
        setCurrentAction("Smart Pause: Simulating Human Break");
        
        let pauseTime = SMART_PAUSE_DURATION;
        setTimeLeft(pauseTime);
        
        const timer = setInterval(() => {
          pauseTime--;
          setTimeLeft(pauseTime);
          if (pauseTime <= 0) clearInterval(timer);
        }, 1000);

        await new Promise(r => setTimeout(r, SMART_PAUSE_DURATION * 1000));
        playNotification();
        setIsSmartPausing(false);
        setBatchCount(0);
      }

      // 2. Process Lead
      setCurrentProcessingId(lead.id);
      setCurrentAction(`Preparing ${lead.name || 'Lead'}...`);
      
      const success = await sendWhatsApp(lead.id, lead.name || '', activeScript);

      if (success) {
        setDailyCount(prev => prev + 1);
        setBatchCount(prev => prev + 1);
        
        // 3. Randomized Cooldown (45-90s)
        setIsCoolingDown(true);
        const cooldown = Math.floor(Math.random() * (90 - 45 + 1) + 45);
        let cdLeft = cooldown;
        setTimeLeft(cdLeft);
        setCurrentAction("Randomizing interval...");

        const cdTimer = setInterval(() => {
          cdLeft--;
          setTimeLeft(cdLeft);
          if (cdLeft <= 0) clearInterval(cdTimer);
        }, 1000);

        await new Promise(r => setTimeout(r, cooldown * 1000));
        setIsCoolingDown(false);
      }
    }
    
    setIsAutoRunning(false);
    setCurrentProcessingId(null);
    setCurrentAction("Ready");
  };

  const sendWhatsApp = async (leadId: string, leadName: string, version: 'A' | 'B' | 'C') => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return false;

    const message = scripts[version];
    const cleanPhone = lead.phone.replace(/\D/g, "");
    
    // Open WA Web
    const waUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    window.open(waUrl, '_blank');

    // Update DB
    try {
      const res = await fetch('/api/admin/leads/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, scriptVersion: version })
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, automationStatus: 'sent', scriptVersion: version } : l));
        return true;
      }
    } catch (err) {
      return false;
    }
    return false;
  };

  const remainingLeads = leads.filter(l => 
    (selectedLeads.length > 0 ? selectedLeads.includes(l.id) : l.stage === activeStage) && 
    l.automationStatus !== 'sent'
  ).length;

  const estimatedMinutes = Math.round((remainingLeads * 67.5) / 60);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-400 font-sans selection:bg-indigo-500/30">
      
      {/* NAVIGATION */}
      <nav className="border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <PaperAirplaneIcon className="w-5 h-5 text-white -rotate-12" />
            </div>
            <span className="text-white font-bold tracking-tight text-lg">PAPA<span className="text-indigo-500">CRM</span></span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
             <SpeakerWaveIcon className="w-4 h-4 text-emerald-500" />
             Alerts Enabled
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto flex gap-8 p-6 lg:p-10">
        
        {/* SIDEBAR: PROGRESS & PIPELINE */}
        <aside className="w-72 flex-shrink-0 hidden lg:flex flex-col h-[calc(100vh-140px)] sticky top-24">
          <div className="flex-1 space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 px-4">Pipeline</p>
              <nav className="space-y-1">
                {stages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStage(stage.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeStage === stage.id ? 'bg-zinc-800 text-white shadow-lg' : 'hover:bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <stage.icon className="w-5 h-5" />
                      <span className="text-sm font-semibold">{stage.label}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                      {leads.filter(l => l.stage === stage.id).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* BATCH TRACKER */}
            <div className="px-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {isSmartPausing ? 'Break in Progress' : 'Batch Progress'}
                </span>
                <span className="text-[10px] font-bold text-indigo-400">{batchCount}/10</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isSmartPausing ? 'bg-orange-500 animate-pulse' : 'bg-indigo-500'}`} 
                  style={{ width: isSmartPausing ? '100%' : `${(batchCount / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* GAUGE CARD */}
          <div className="bg-zinc-900/50 rounded-[2.5rem] p-6 border border-zinc-800">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                <circle
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * dailyCount) / DAILY_MAX}
                  strokeLinecap="round" fill="transparent"
                  className={`transition-all duration-1000 ${dailyCount > 40 ? 'text-rose-500' : 'text-indigo-500'}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white leading-none">{dailyCount}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase mt-1">/{DAILY_MAX}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-zinc-500">Queue: <span className="text-white">{remainingLeads}</span></span>
                <span className="text-zinc-500">Est: <span className="text-indigo-400">{estimatedMinutes}m</span></span>
              </div>
              <button 
                onClick={() => setDailyCount(0)}
                className="w-full py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-500 hover:text-white transition-all"
              >
                RESET DAILY LIMIT
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER: LEAD LIST */}
        <section className="flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-sm pb-40">
          <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-20">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {stages.find(s => s.id === activeStage)?.label} Leads
              </h2>
            </div>
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {['A', 'B', 'C'].map((v) => (
                <button 
                  key={v}
                  onClick={() => setActiveScript(v as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeScript === v ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500'
                  }`}
                >
                  V-{v}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollParentRef} className="divide-y divide-zinc-800/50 overflow-y-auto max-h-[calc(100vh-320px)]">
            {leads.filter(l => l.stage === activeStage).map((lead) => {
               const isProcessing = currentProcessingId === lead.id;
               return (
                <div 
                  key={lead.id} 
                  id={`lead-${lead.id}`}
                  className={`group p-5 flex items-center justify-between transition-all duration-500 ${
                    isProcessing ? 'bg-indigo-500/10 border-l-4 border-l-indigo-500' : 'hover:bg-zinc-800/20 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => setSelectedLeads(prev => prev.includes(lead.id) ? prev.filter(i => i !== lead.id) : [...prev, lead.id])}
                      className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <div>
                      <h4 className={`text-sm font-bold transition-colors ${isProcessing ? 'text-indigo-400' : 'text-zinc-200'}`}>
                        {lead.name || lead.phone}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{lead.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {lead.automationStatus === 'sent' && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded-md">
                        <CheckCircleIcon className="w-3 h-3" /> Sent V{lead.scriptVersion}
                      </div>
                    )}
                    <button onClick={() => sendWhatsApp(lead.id, lead.name || '', activeScript)} className="p-2 bg-zinc-800 hover:bg-blue-600 rounded-lg text-white transition-all">
                      <DevicePhoneMobileIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
               )
            })}
          </div>
        </section>
      </main>

      {/* DYNAMIC ISLAND CONTROL */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-6">
        <div className={`
          relative overflow-hidden rounded-[2.5rem] border border-white/10 p-2 backdrop-blur-2xl transition-all duration-500
          ${isAutoRunning ? 'bg-zinc-900 shadow-2xl scale-105 ring-2 ring-indigo-500/30' : 'bg-zinc-900/80 shadow-xl'}
        `}>
          <div className="flex items-center justify-between pl-6 pr-2 py-2">
            <div className="flex items-center gap-4">
              <div className="relative">
                {(isCoolingDown || isSmartPausing) ? (
                   <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isSmartPausing ? 'bg-orange-500/20 text-orange-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                     <ClockIcon className="w-6 h-6 animate-pulse" />
                   </div>
                ) : (
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isAutoRunning ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">
                  {isSmartPausing ? 'Smart Pause' : isAutoRunning ? 'Engine Active' : 'Standby'}
                </p>
                <p className="text-sm font-bold text-zinc-200">
                  {isSmartPausing ? `Resuming in ${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s` : isCoolingDown ? `Next lead in ${timeLeft}s` : currentAction}
                </p>
              </div>
            </div>

            <button 
              onClick={isAutoRunning ? () => { setIsAutoRunning(false); setIsSmartPausing(false); } : startEngine}
              className={`
                h-14 px-8 rounded-full font-black flex items-center gap-3 transition-all active:scale-95
                ${isAutoRunning ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-white text-black hover:bg-zinc-200'}
              `}
            >
              {isAutoRunning ? <><PauseIcon className="w-6 h-6" /> STOP</> : <><PlayIcon className="w-6 h-6" /> START</>}
            </button>
          </div>
          
          {/* Progress bar at the bottom of the island */}
          {(isCoolingDown || isSmartPausing) && (
            <div className="absolute bottom-0 left-8 right-8 h-1 bg-zinc-800 rounded-full overflow-hidden">
               <div 
                className={`h-full transition-all duration-1000 ${isSmartPausing ? 'bg-orange-500' : 'bg-indigo-500'}`} 
                style={{ width: `${(timeLeft / (isSmartPausing ? 900 : 90)) * 100}%` }}
               />
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
}