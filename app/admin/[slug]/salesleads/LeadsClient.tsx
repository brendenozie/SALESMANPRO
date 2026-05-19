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
  const [isProcessingManual, setIsProcessingManual] = useState(false);
  const [maxCooldown, setMaxCooldown] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const DAILY_MAX = 50;
  const BATCH_SIZE = 10;
  const SMART_PAUSE_DURATION = 900; 

  // const scripts = {
  //   A: "Hi,{{businessName}}👋 hope you’re well. I work with small businesses to help them get more customers using simple websites. Quick question — do you currently use a website?",
  //   B: "Hi,{{businessName}} 👋 Quick one — do you use a website for your business or side hustle?",
  //   C: "Hi,{{businessName}} 👋 hope uko poa. Quick one — do you already have a website for your biashara?"
  // };

  
  const scripts = {
    A: "Hi [Name], Brenden here. 👋 I help local businesses turn their hustle into a fully functional enterprise by building automated systems that bring in clients on autopilot.\n I noticed your page and love what you're doing. Quick question—are you guys still taking all your orders manually over WhatsApp, or do you have an automated system handling that for you?",
    B: "Hi, Brenden here. 👋 I work with businesses to help them scale up into functional enterprises by setting up systems that consistently attract and convert premium clients.Quick one—is your business currently relying mostly on word-of-mouth referrals right now, or do you have a predictable digital system bringing in new clients every week?",
    // C: "Hi,{{businessName}} 👋 Quick one — do you use a website for your business or side hustle?",
    // D: "Hi,{{businessName}} 👋 hope uko poa. Quick one — do you already have a website for your biashara?"
    // "Awesome, thanks for confirming! The reason I asked is because I see a lot of businesses losing up to 40% of their clients because of manual delays. I actually mapped out a quick blueprint on how you can turn your setup into a smooth, automated checkout enterprise. Can I drop a 2-minute breakdown here?"
  };

  const stages = [
    { id: "cold", label: "Discovery", icon: UserGroupIcon, color: "bg-blue-500" },
    { id: "replied", label: "Engaged", icon: SparklesIcon, color: "bg-purple-500" },
    { id: "interested", label: "Warm", icon: BeakerIcon, color: "bg-orange-500" },
    { id: "paid", label: "Converted", icon: CheckCircleIcon, color: "bg-emerald-500" },
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

  // --- HELPER: UPDATES UI EVERY SECOND ---
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

  // --- THE ENGINE ---
  const startEngine = async () => {
    const queue = selectedLeads.length > 0 
      ? leads.filter(l => selectedLeads.includes(l.id))
      : leads.filter(l => l.stage === activeStage && l.automationStatus !== 'sent');

    if (queue.length === 0) return alert("No leads to process!");
    
    setIsAutoRunning(true);
    // Use a local variable to track running state within the loop
    let running = true;

    for (const lead of queue) {
      // Check if user stopped the engine
      if (!running || dailyCount >= DAILY_MAX) break;

      // 1. Smart Pause Logic
      if (batchCount > 0 && batchCount % BATCH_SIZE === 0) {
        setIsSmartPausing(true);
        setCurrentAction("Simulating Human Break");
        await waitWithCountdown(SMART_PAUSE_DURATION);
        playNotification();
        setIsSmartPausing(false);
        setBatchCount(0);
      }

      // 2. Process Lead
      setCurrentProcessingId(lead.id);
      setCurrentAction(`Messaging ${lead.name || 'Lead'}...`);
      
      const success = await sendWhatsApp(lead.id, lead.name || '', activeScript);

      if (success) {
        setDailyCount(prev => prev + 1);
        setBatchCount(prev => prev + 1);
        
        // 3. Randomized Cooldown (45-90s)
        setIsCoolingDown(true);
        setCurrentAction("Randomizing interval...");
        const cooldown = Math.floor(Math.random() * (90 - 45 + 1) + 45);
        await waitWithCountdown(cooldown);
        setIsCoolingDown(false);
      }
    }
    
    stopEngine();
  };

  const stopEngine = () => {
    setIsAutoRunning(false);
    setIsCoolingDown(false);
    setIsSmartPausing(false);
    setCurrentProcessingId(null);
    setCurrentAction("Ready");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const sendWhatsApp = async (leadId: string, leadName: string, version: 'A' | 'B' | 'C') => {
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

  const remainingLeads = leads.filter(l => 
    (selectedLeads.length > 0 ? selectedLeads.includes(l.id) : l.stage === activeStage) && 
    l.automationStatus !== 'sent'
  ).length;

  const estimatedMinutes = Math.round((remainingLeads * 67.5) / 60);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-400 font-sans">
      <nav className="border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <PaperAirplaneIcon className="w-5 h-5 text-white -rotate-12" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
             <SpeakerWaveIcon className="w-4 h-4 text-emerald-500" />
             AI Engine Active
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto flex gap-8 p-6 lg:p-10">
        <aside className="w-72 flex-shrink-0 hidden lg:flex flex-col h-[calc(100vh-140px)] sticky top-24">
          <div className="flex-1 space-y-8">
            <nav className="space-y-1">
              {stages.map((stage) => (
                <button key={stage.id} onClick={() => setActiveStage(stage.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeStage === stage.id ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-500'}`}>
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

            <div className="bg-zinc-900/50 rounded-[2.5rem] p-6 border border-zinc-800">
               <div className="text-center">
                 <p className="text-2xl font-black text-white leading-none">{dailyCount}</p>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Daily Limit: {DAILY_MAX}</p>
               </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl overflow-hidden pb-40">
          <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-20">
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">{activeStage} Queue</h2>
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {['A', 'B', 'C'].map((v) => (
                <button key={v} onClick={() => setActiveScript(v as any)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeScript === v ? 'bg-indigo-600 text-white' : 'text-zinc-500'}`}>V-{v}</button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-zinc-800/50">
            {leads.filter(l => l.stage === activeStage).map((lead) => {
               const isProcessing = currentProcessingId === lead.id;
               return (
                <div key={lead.id} className={`p-5 flex items-center justify-between transition-all ${isProcessing ? 'bg-indigo-500/10 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => setSelectedLeads(prev => prev.includes(lead.id) ? prev.filter(i => i !== lead.id) : [...prev, lead.id])} className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-indigo-600" />
                    <div>
                      <h4 className={`text-sm font-bold ${isProcessing ? 'text-indigo-400' : 'text-zinc-200'}`}>{lead.name || lead.phone}</h4>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{lead.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isProcessing && (isCoolingDown || isSmartPausing) && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Wait: {timeLeft}s</span>
                      </div>
                    )}
                    {lead.automationStatus === 'sent' && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded-md">
                        <CheckCircleIcon className="w-3 h-3" /> Sent V{lead.scriptVersion}
                      </div>
                    )}
                    <button disabled={isAutoRunning} onClick={() => sendWhatsApp(lead.id, lead.name || '', activeScript)} className="p-2 rounded-lg text-white bg-zinc-800 hover:bg-blue-600 disabled:opacity-30">
                      <DevicePhoneMobileIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
               )
            })}
          </div>
        </section>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-6">
        <div className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 p-2 backdrop-blur-2xl transition-all duration-500 bg-zinc-900 shadow-2xl`}>
          <div className="flex items-center justify-between pl-6 pr-2 py-2">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isAutoRunning ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                {isCoolingDown || isSmartPausing ? <ClockIcon className="w-6 h-6 animate-pulse text-white" /> : <SparklesIcon className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{isAutoRunning ? 'Engine Running' : 'Engine Ready'}</p>
                <p className="text-sm font-bold text-zinc-200">
                  {isSmartPausing ? `Pause: ${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s` : isCoolingDown ? `Next lead in ${timeLeft}s` : currentAction}
                </p>
              </div>
            </div>

            <button 
              onClick={isAutoRunning ? stopEngine : startEngine}
              className={`h-14 px-8 rounded-full font-black flex items-center gap-3 transition-all ${isAutoRunning ? 'bg-rose-500 text-white' : 'bg-white text-black'}`}
            >
              {isAutoRunning ? <><PauseIcon className="w-6 h-6" /> STOP</> : <><PlayIcon className="w-6 h-6" /> START</>}
            </button>
          </div>
          
          {(isCoolingDown || isSmartPausing) && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
               <div 
                className={`h-full transition-all duration-1000 ease-linear ${isSmartPausing ? 'bg-orange-500' : 'bg-indigo-500'}`} 
                style={{ width: `${(timeLeft / maxCooldown) * 100}%` }}
               />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}