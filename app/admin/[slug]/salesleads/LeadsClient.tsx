"use client";

import { 
  PauseIcon, PlayIcon, 
  CheckCircleIcon, PaperAirplaneIcon, 
  DevicePhoneMobileIcon, ClockIcon, SparklesIcon,
  BeakerIcon, UserGroupIcon, SpeakerWaveIcon,
  CheckIcon, QueueListIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";

type ScriptVersion = 'A' | 'B' | 'C' | 'D';
const SCRIPT_VERSIONS: ScriptVersion[] = ['A', 'B', 'C', 'D'];

export default function LeadsClient({ initialLeads, companyId }: { initialLeads: any[], companyId: string }) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [isSmartPausing, setIsSmartPausing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>("Standby");
  const [activeScript, setActiveScript] = useState<ScriptVersion>('A');
  const [activeStage, setActiveStage] = useState('cold');
  const [timeLeft, setTimeLeft] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [currentProcessingId, setCurrentProcessingId] = useState<string | null>(null);
  const [maxCooldown, setMaxCooldown] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoRunningRef = useRef(false);

  const DAILY_MAX = 50;
  const BATCH_SIZE = 10;
  const SMART_PAUSE_DURATION = 900; // 15 mins
  
  const scripts: Record<ScriptVersion, string> = {
    A: "Sasa! 👋 Hope biashara is good today. Quick question, how are you interacting with customer orders, manually? in the DMs? I help local businesses set up instant, affordable websites in under an hour so customers can view your catalog and order directly. Mind if I send a quick 10-second demo video?",
    B: "Hi there 👋 Hope uko poa! Quick one, do you already have a website for your work? I build clean, super affordable sites for businesses and have them live in less than 60 minutes. Would you be opposed to checking out a quick sample link?",
    C: "Hey! 👋 Hope business is moving well. I’m helping local hustles get simple, professional websites up and running super fast (under an hour) for a very friendly budget. Is getting a website something you've been looking to do for your business recently?",
    D: "Sasa 👋 Hope day iko sawa! Quick one, if you don't have a website yet, I can build and launch one for your business today in less than an hour, without breaking the bank. Can I drop a quick 15-second screen recording showing how it works?"
  };

  const stages = [
    { id: "cold", label: "Discovery", icon: UserGroupIcon },
    { id: "replied", label: "Engaged", icon: SparklesIcon },
    { id: "interested", label: "Warm", icon: BeakerIcon },
    { id: "paid", label: "Converted", icon: CheckCircleIcon },
  ];

  const formatMessage = (template: string, lead: any) => {
    const bName = lead.businessName || lead.name || "your business";
    return template.replace(/{{businessName}}/g, bName);
  };

  const playNotification = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const waitWithCountdown = (seconds: number) => {
    return new Promise((resolve) => {
      setTimeLeft(seconds);
      setMaxCooldown(seconds);
      
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            resolve(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });
  };

  const startEngine = async () => {
    const queue = selectedLeads.length > 0 
      ? leads.filter(l => selectedLeads.includes(l.id))
      : leads.filter(l => l.stage === activeStage && l.automationStatus !== 'sent');

    if (queue.length === 0) return alert("No valid leads left in queue to process!");
    
    setIsAutoRunning(true);
    isAutoRunningRef.current = true;

    // Start rotation from currently selected script index
    let scriptIndex = SCRIPT_VERSIONS.indexOf(activeScript);
    if (scriptIndex === -1) scriptIndex = 0;

    for (const lead of queue) {
      if (!isAutoRunningRef.current || dailyCount >= DAILY_MAX) break;

      // Select and display current auto-rotated script version
      const currentVersion = SCRIPT_VERSIONS[scriptIndex];
      setActiveScript(currentVersion);

      // 1. Smart Pause Logic
      if (batchCount > 0 && batchCount % BATCH_SIZE === 0) {
        setIsSmartPausing(true);
        setCurrentAction("Human Break Simulation");
        await waitWithCountdown(SMART_PAUSE_DURATION);
        if (!isAutoRunningRef.current) break;
        playNotification();
        setIsSmartPausing(false);
        setBatchCount(0);
      }

      // 2. Process Lead
      setCurrentProcessingId(lead.id);
      setCurrentAction(`Messaging ${lead.name || lead.phone} (V-${currentVersion})...`);
      
      const success = await sendWhatsApp(lead.id, currentVersion);

      if (success) {
        setDailyCount(prev => prev + 1);
        setBatchCount(prev => prev + 1);
        
        // Rotate to the next script variant for the next lead
        scriptIndex = (scriptIndex + 1) % SCRIPT_VERSIONS.length;

        // 3. Randomized Cooldown (45-90s)
        setIsCoolingDown(true);
        setCurrentAction("Cooldown Interval");
        const cooldown = Math.floor(Math.random() * (90 - 45 + 1) + 45);
        await waitWithCountdown(cooldown);
        if (!isAutoRunningRef.current) break;
        setIsCoolingDown(false);
      }
    }
    
    stopEngine();
  };

  const stopEngine = () => {
    isAutoRunningRef.current = false;
    setIsAutoRunning(false);
    setIsCoolingDown(false);
    setIsSmartPausing(false);
    setCurrentProcessingId(null);
    setCurrentAction("Standby");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const sendWhatsApp = async (leadId: string, version: ScriptVersion) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return false;

    const message = scripts[version];
    const personalizedMessage = formatMessage(message, lead);
    const cleanPhone = lead.phone.replace(/\D/g, "");
    
    const waUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(personalizedMessage)}&type=phone_number&app_absent=0`;
    window.open(waUrl, '_blank');

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

  const stageLeads = leads.filter(l => l.stage === activeStage);
  const remainingLeads = stageLeads.filter(l => l.automationStatus !== 'sent').length;

  const toggleSelectAll = () => {
    if (selectedLeads.length === stageLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(stageLeads.map(l => l.id));
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-400 font-sans pb-28">
      {/* Header Bar */}
      <nav className="border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <PaperAirplaneIcon className="w-5 h-5 text-white -rotate-12" />
            </div>
            <span className="text-white font-bold tracking-tight text-base sm:text-lg">WhatsApp Outreach Engine</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold">
            <span className={`w-2 h-2 rounded-full ${isAutoRunning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            <SpeakerWaveIcon className={`w-3.5 h-3.5 ${isAutoRunning ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline text-zinc-300">{isAutoRunning ? "Engine Active" : "Engine Ready"}</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Desktop Navigation Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-6 sticky top-22 h-[calc(100vh-120px)]">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3 space-y-1">
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">Pipeline Stages</p>
            {stages.map((stage) => {
              const count = leads.filter(l => l.stage === stage.id).length;
              const isActive = activeStage === stage.id;
              return (
                <button 
                  key={stage.id} 
                  onClick={() => setActiveStage(stage.id)} 
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-medium' : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <stage.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{stage.label}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Daily Quota Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-zinc-400">Daily Messaging Limit</span>
              <span className="text-xs font-mono font-bold text-white">{dailyCount} / {DAILY_MAX}</span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min((dailyCount / DAILY_MAX) * 100, 100)}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Mobile Horizontal Stage Bar */}
        <div className="lg:hidden overflow-x-auto flex gap-2 pb-2 scrollbar-none sticky top-16 bg-[#09090b]/95 backdrop-blur-md z-20 py-2 -mx-4 px-4 border-b border-zinc-800/80">
          {stages.map((stage) => {
            const count = leads.filter(l => l.stage === stage.id).length;
            const isActive = activeStage === stage.id;
            return (
              <button 
                key={stage.id} 
                onClick={() => setActiveStage(stage.id)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                }`}
              >
                <stage.icon className="w-4 h-4" />
                <span>{stage.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-indigo-700 text-white' : 'bg-zinc-950 text-zinc-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lead Queue Content */}
        <section className="flex-1 bg-zinc-900/20 border border-zinc-800/60 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col">
          
          {/* Section Toolbar */}
          <div className="p-4 sm:p-5 border-b border-zinc-800/60 bg-zinc-900/40 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSelectAll} 
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all"
                title="Select All"
              >
                <QueueListIcon className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-bold text-white capitalize">{activeStage} Leads</h2>
                <p className="text-xs text-zinc-500">{remainingLeads} pending dispatch</p>
              </div>
            </div>

            {/* Script Variant Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 w-full sm:w-auto justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2">Script:</span>
              {SCRIPT_VERSIONS.map((v) => (
                <button 
                  key={v} 
                  onClick={() => setActiveScript(v)} 
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeScript === v ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  V-{v}
                </button>
              ))}
            </div>
          </div>

          {/* Script Template Visualizer Box */}
          <div className="p-3.5 bg-indigo-950/20 border-b border-indigo-900/20 px-5 flex items-start gap-3">
            <SparklesIcon className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-200/80 italic leading-relaxed line-clamp-2">
              "{scripts[activeScript]}"
            </p>
          </div>

          {/* Leads List */}
          <div className="divide-y divide-zinc-800/40 overflow-y-auto max-h-[calc(100vh-320px)]">
            {stageLeads.length === 0 ? (
              <div className="p-12 text-center text-zinc-600">
                <p className="text-sm">No leads in this stage.</p>
              </div>
            ) : (
              stageLeads.map((lead) => {
                const isProcessing = currentProcessingId === lead.id;
                const isSelected = selectedLeads.includes(lead.id);

                return (
                  <div 
                    key={lead.id} 
                    className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-all ${
                      isProcessing 
                        ? 'bg-indigo-500/10 border-l-4 border-l-indigo-500' 
                        : isSelected 
                        ? 'bg-zinc-800/30' 
                        : 'hover:bg-zinc-900/30 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => setSelectedLeads(prev => prev.includes(lead.id) ? prev.filter(i => i !== lead.id) : [...prev, lead.id])} 
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                      />
                      <div className="truncate">
                        <h4 className={`text-sm font-semibold truncate ${isProcessing ? 'text-indigo-300' : 'text-zinc-200'}`}>
                          {lead.businessName || lead.name || "Unnamed Business"}
                        </h4>
                        <span className="text-xs font-mono text-zinc-500">{lead.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isProcessing && (isCoolingDown || isSmartPausing) && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-full">
                          <ClockIcon className="w-3 h-3 text-indigo-400 animate-spin" />
                          <span className="text-[10px] font-mono text-indigo-300 font-bold">{timeLeft}s</span>
                        </div>
                      )}

                      {lead.automationStatus === 'sent' && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                          <CheckIcon className="w-3 h-3" />
                          <span>V-{lead.scriptVersion || activeScript}</span>
                        </div>
                      )}

                      <button 
                        disabled={isAutoRunning} 
                        onClick={() => sendWhatsApp(lead.id, activeScript)} 
                        className="p-2 rounded-xl text-zinc-300 bg-zinc-800/80 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all border border-zinc-700/50"
                        title="Send WhatsApp Message"
                      >
                        <DevicePhoneMobileIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Floating HUD Controller */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
        <div className="relative overflow-hidden rounded-full border border-zinc-700/60 p-2 bg-zinc-950/90 backdrop-blur-xl shadow-2xl shadow-black/80">
          <div className="flex items-center justify-between pl-4 pr-1 py-1">
            
            {/* Status Information */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center ${isAutoRunning ? 'bg-indigo-600 shadow-md shadow-indigo-600/40' : 'bg-zinc-800'}`}>
                {isCoolingDown || isSmartPausing ? (
                  <ClockIcon className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <SparklesIcon className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="truncate">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  {isAutoRunning ? 'Automation Running' : 'Engine Ready'}
                </p>
                <p className="text-xs font-bold text-zinc-200 truncate">
                  {isSmartPausing 
                    ? `Pause: ${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s` 
                    : isCoolingDown 
                    ? `Next in ${timeLeft}s` 
                    : currentAction}
                </p>
              </div>
            </div>

            {/* Action Trigger Button */}
            <button 
              onClick={isAutoRunning ? stopEngine : startEngine}
              className={`h-11 px-6 rounded-full font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shadow-md ${
                isAutoRunning 
                  ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30' 
                  : 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
              }`}
            >
              {isAutoRunning ? (
                <><PauseIcon className="w-4 h-4" /> STOP</>
              ) : (
                <><PlayIcon className="w-4 h-4 fill-current" /> START</>
              )}
            </button>
          </div>
          
          {/* Dynamic Progress Bar Overlay */}
          {(isCoolingDown || isSmartPausing) && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${isSmartPausing ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                style={{ width: `${(timeLeft / maxCooldown) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}