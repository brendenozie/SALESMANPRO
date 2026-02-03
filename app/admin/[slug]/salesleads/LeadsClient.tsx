"use client";

import { 
  InboxIcon, PauseIcon, PlayIcon, 
  CheckCircleIcon, PaperAirplaneIcon, 
  DevicePhoneMobileIcon, ArrowPathIcon,
  ClockIcon, SparklesIcon, ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect, useMemo } from "react";

export default function LeadsClient({ initialLeads, companyId }: { initialLeads: any[], companyId: string }) {
  // --- STATE MANAGEMENT ---
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>("System Ready");
  const [activeScript, setActiveScript] = useState<'A' | 'B' | 'C'>('A');
  const [timeLeft, setTimeLeft] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);

  const DAILY_MAX = 50;
  const scripts = {
    A: "Hi 👋 hope you’re well. I work with small businesses to help them get more customers using simple websites. Quick question — do you currently use a website?",
    B: "Hi 👋 Quick one — do you use a website for your business or side hustle?",
    C: "Hi 👋 hope uko poa. Quick one — do you already have a website for your biashara?"
  };

  const stages = [
    { id: "cold", label: "Cold Lead", color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: "replied", label: "Replied", color: "text-purple-400", bg: "bg-purple-400/10" },
    { id: "interested", label: "Interested", color: "text-orange-400", bg: "bg-orange-400/10" },
    { id: "negotiating", label: "Negotiating", color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { id: "paid", label: "Closed Won", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  // --- PERSISTENCE LOGIC (Safety Governor) ---
  useEffect(() => {
    const saved = localStorage.getItem("papa_crm_stats");
    if (saved) {
      const { count, lastResetDate } = JSON.parse(saved);
      if (lastResetDate !== new Date().toLocaleDateString()) {
        setDailyCount(0); // Midnight Reset
      } else {
        setDailyCount(count);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("papa_crm_stats", JSON.stringify({
      count: dailyCount,
      lastResetDate: new Date().toLocaleDateString()
    }));
  }, [dailyCount]);

  // --- THE BRAIN: HUMAN-SIMULATED ENGINE ---
  const startEngine = async () => {
    const queue = selectedLeads.length > 0 
      ? leads.filter(l => selectedLeads.includes(l.id))
      : leads.filter(l => l.stage === 'cold' && l.automationStatus !== 'sent');

    if (queue.length === 0) return alert("No leads to process!");
    if (dailyCount >= DAILY_MAX) return alert("Daily Safety Limit Reached!");

    setIsAutoRunning(true);

    for (const lead of queue) {
      if (!isAutoRunning || dailyCount >= DAILY_MAX) break;

      const message = scripts[activeScript];
      
      // 1. Simulate Human "Thinking & Typing"
      const typingSpeed = Math.floor(Math.random() * (80 - 40) + 40); // ms per char
      const thinkingTime = Math.floor(Math.random() * (3000 - 1500) + 1500);
      const simulationTime = (message.length * typingSpeed) + thinkingTime;

      setCurrentAction(`Typing to ${lead.name || lead.phone}...`);
      await new Promise(r => setTimeout(r, simulationTime));

      // 2. Dispatch Message
      const success = await sendWhatsApp(lead.id, activeScript);

      if (success) {
        setDailyCount(prev => prev + 1);
        
        // 3. Post-Send Cool-down (Human Rest)
        setIsCoolingDown(true);
        const cooldown = Math.floor(Math.random() * (60 - 30) + 30);
        setTimeLeft(cooldown);

        const timer = setInterval(() => {
          setTimeLeft(p => {
            if (p <= 1) { clearInterval(timer); return 0; }
            return p - 1;
          });
        }, 1000);

        setCurrentAction(`Resting...`);
        await new Promise(r => setTimeout(r, cooldown * 1000));
        setIsCoolingDown(false);
      }
    }

    setIsAutoRunning(false);
    setCurrentAction("Queue Finished");
    setSelectedLeads([]);
  };

  const sendWhatsApp = async (leadId: string, version: 'A' | 'B' | 'C', method: 'api' | 'web' = 'api') => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return false;

    if (method === 'web') {
      window.open(`https://wa.me/${lead.phone}?text=${encodeURIComponent(scripts[version])}`, '_blank');
      return true;
    }

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, scriptVersion: version, companyId })
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, automationStatus: 'sent', scriptVersion: version } : l));
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-slate-300 selection:bg-emerald-500/30">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic flex items-center gap-3">
            PAPA CRM <span className="text-emerald-500 text-sm not-italic font-mono bg-emerald-500/10 px-2 py-1 rounded">V2.4</span>
          </h1>
          <p className="text-slate-500 font-medium ml-1">Automated WhatsApp Outreach</p>
        </div>

        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
          {Object.keys(scripts).map((v) => (
            <button 
              key={v}
              onClick={() => setActiveScript(v as any)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                activeScript === v ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-white'
              }`}
            >
              SCRIPT {v}
            </button>
          ))}
        </div>
      </header>

      {/* COMMAND CENTER GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-12">
        
        {/* ENGINE CONTROL */}
        <div className={`xl:col-span-3 group relative p-[2px] rounded-[3rem] transition-all duration-700 ${
          isAutoRunning ? 'bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 animate-gradient-x' : 'bg-slate-800'
        }`}>
          <div className="bg-[#0a0a0a] rounded-[2.9rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`p-5 rounded-3xl transition-all duration-500 ${isAutoRunning ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-slate-900'}`}>
                  {isCoolingDown ? <ClockIcon className="w-10 h-10 text-orange-400 animate-pulse" /> : <SparklesIcon className={`w-10 h-10 ${isAutoRunning ? 'text-black' : 'text-slate-600'}`} />}
                </div>
                {isCoolingDown && (
                  <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90">
                    <circle cx="36" cy="36" r="32" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-orange-500/20" />
                    <circle cx="36" cy="36" r="32" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="201" strokeDashoffset={201 - (201 * timeLeft) / 60} className="text-orange-500 transition-all duration-1000" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-2">
                  {isCoolingDown ? `Cooldown: ${timeLeft}s` : isAutoRunning ? "Engine Active" : "Engine Standby"}
                </h2>
                <div className="flex items-center gap-2 text-slate-500 font-mono text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAutoRunning ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoRunning ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
                  </span>
                  {currentAction}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {selectedLeads.length > 0 && (
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Targeting</p>
                  <p className="text-xl font-black text-white">{selectedLeads.length} Leads</p>
                </div>
              )}
              <button 
                onClick={isAutoRunning ? () => setIsAutoRunning(false) : startEngine}
                className={`flex items-center gap-3 px-12 py-5 rounded-[2rem] font-black transition-all hover:scale-105 active:scale-95 ${
                  isAutoRunning ? 'bg-red-500 text-white shadow-2xl shadow-red-900/20' : 'bg-white text-black shadow-2xl shadow-white/10'
                }`}
              >
                {isAutoRunning ? <><PauseIcon className="w-6 h-6" /> STOP</> : <><PlayIcon className="w-6 h-6" /> IGNITE</>}
              </button>
            </div>
          </div>
        </div>

        {/* SAFETY SHIELD */}
        <div className="bg-slate-900/40 border-2 border-slate-800 rounded-[3rem] p-8 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Safety Governor</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">
                {dailyCount}<span className="text-slate-700">/{DAILY_MAX}</span>
              </h3>
            </div>
            <button onClick={() => setDailyCount(0)} className="text-slate-700 hover:text-white transition-colors">
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-1000 ${dailyCount > (DAILY_MAX * 0.8) ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${(dailyCount / DAILY_MAX) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <ShieldCheckIcon className="w-4 h-4" /> ACCOUNT HEALTH: {dailyCount > 40 ? 'CAUTION' : 'OPTIMAL'}
            </p>
          </div>
        </div>
      </div>

      {/* KANBAN GRID */}
      <div className="flex gap-8 overflow-x-auto pb-12 snap-x">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-[22rem] snap-center">
            <div className="flex items-center gap-3 mb-6 px-4">
              <div className={`w-2 h-2 rounded-full ${stage.color.replace('text', 'bg')}`} />
              <h2 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400">
                {stage.label}
              </h2>
              <span className="bg-slate-900 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold">
                {leads.filter(l => l.stage === stage.id).length}
              </span>
            </div>

            <div className="space-y-4 min-h-[60vh] bg-slate-900/20 p-5 rounded-[3rem] border border-slate-800/40 backdrop-blur-sm">
              {leads.filter(l => l.stage === stage.id).map((lead) => (
                <div 
                  key={lead.id} 
                  className={`group relative bg-[#0a0a0a] border-2 rounded-[2rem] p-6 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    selectedLeads.includes(lead.id) ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <input 
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => setSelectedLeads(prev => prev.includes(lead.id) ? prev.filter(i => i !== lead.id) : [...prev, lead.id])}
                    className="absolute top-6 right-6 accent-emerald-500 w-5 h-5 cursor-pointer rounded-full"
                  />

                  <div className="mb-6">
                    <h3 className="font-black text-white text-lg tracking-tight mb-1">{lead.name || lead.phone}</h3>
                    <p className="text-xs font-mono text-slate-500 tracking-wider uppercase">{lead.phone}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => sendWhatsApp(lead.id, activeScript, 'api')}
                      className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-500 hover:text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" /> API
                    </button>
                    <button 
                      onClick={() => sendWhatsApp(lead.id, activeScript, 'web')}
                      className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-500 hover:text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <DevicePhoneMobileIcon className="w-4 h-4" /> WEB
                    </button>
                  </div>

                  {lead.automationStatus === 'sent' && (
                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase">
                      <CheckCircleIcon className="w-4 h-4" /> Delivered (Script {lead.scriptVersion})
                    </div>
                  )}
                </div>
              ))}
              
              {leads.filter(l => l.stage === stage.id).length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-700">
                  <InboxIcon className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest opacity-20">Empty Stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
}