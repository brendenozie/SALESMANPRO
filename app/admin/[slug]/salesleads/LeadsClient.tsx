"use client";

import { InboxIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useState } from "react";




export default function LeadsClient({ initialLeads, companyId }: { initialLeads: any[]; companyId: string }) {
  
  const [leads, setLeads] = useState(initialLeads);
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  const startAutoPing = async () => {
  const coldLeads = leads.filter(l => l.stage === 'cold' && l.automationStatus !== 'sent');
  
  for (const lead of coldLeads) {
    if (!isAutoRunning) break; // Allow user to stop the loop

    await sendWhatsApp(lead.id, 'A'); // Calls the API route above
    
    // The "Human" Delay: Wait 60 to 90 seconds between messages
    const delay = Math.floor(Math.random() * (90000 - 60000) + 60000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

  // Your Kenyan Script Templates
  const scripts = {
    A: "Hi 👋 hope you’re well. I work with small businesses to help them get more customers using simple websites. Quick question — do you currently use a website?",
    B: "Hi 👋 Quick one — do you use a website for your business or side hustle?",
    C: "Hi 👋 hope uko poa. Quick one — do you already have a website for your biashara?"
  };

  const sendWhatsApp = async (leadId: string, version: 'A' | 'B' | 'C') => {
    // This would call your /api/whatsapp/send endpoint
    const message = scripts[version];
    console.log(`Sending to ${leadId}: ${message}`);
    
    // Update UI state
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, automationStatus: 'sent' } : l));
  };

  const stages = [
    { id: "cold", label: "Cold Lead", color: "bg-blue-500/10 text-blue-500" },
    { id: "replied", label: "Replied", color: "bg-purple-500/10 text-purple-500" },
    { id: "interested", label: "Interested", color: "bg-orange-500/10 text-orange-500" },
    { id: "negotiating", label: "Negotiating", color: "bg-yellow-500/10 text-yellow-500" },
    { id: "paid", label: "Closed Won", color: "bg-emerald-500/10 text-emerald-500" },
  ];

  const updateLeadStage = async (leadId: string, newStage: string) => {
    // Optimistic Update
    const previousLeads = [...leads];
    setLeads(leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l));

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setLeads(previousLeads); // Rollback on error
      alert("Failed to update stage");
    }
  };

  return (
    <div className="p-8 bg-[#0a0a0a] min-h-screen text-slate-200">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WhatsApp Sales Pipeline</h1>
          <p className="text-slate-500 text-sm">Manage and track your lead conversions</p>
        </div>
        <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition">
          + Add Lead
        </button>
      </header>

      {/* 🚀 Automation Control Bar */}
      <div className="mb-8 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <InboxIcon className="text-emerald-400 w-6 h-6" />
            Outreach Engine
          </h2>
          <p className="text-sm text-slate-400">Targeting {leads.filter(l => l.stage === 'cold').length} Cold Leads</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAutoRunning(!isAutoRunning)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${
              isAutoRunning ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {isAutoRunning ? <><PauseIcon className="w-5 h-5" /> Stop Bot</> : <><PlayIcon className="w-5 h-5" /> Start Auto-Ping</>}
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stage.color.split(' ')[1]}`} />
                <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
                  {stage.label}
                </h2>
                <span className="ml-2 bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-500">
                  {leads.filter(l => l.stage === stage.id).length}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[500px] bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
              {leads
                .filter((l) => l.stage === stage.id)
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="group bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-slate-600 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-1 rounded">
                        {lead.businessType || "General"}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 text-slate-500 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12H6.01M12 12H12.01M18 12H18.01" />
                        </svg>
                      </button>
                    </div>

                    <h3 className="font-medium text-slate-100 mb-1 flex items-center gap-2">
                      {lead.name || lead.phone}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {lead.phone}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                       <div className="flex -space-x-2">
                          {lead.hasWebsite && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5a2 2 0 002 2zM8 13h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v5a2 2 0 002 2z" />
                            </svg>
                          )}
                          {lead.hasEmail && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          )}
                       </div>
                       
                       <select
                        value={lead.stage}
                        onChange={(e) => updateLeadStage(lead.id, e.target.value)}
                        className="bg-transparent text-xs font-medium text-slate-400 hover:text-white cursor-pointer outline-none transition"
                      >
                        {stages.map((s) => (
                          <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                            Move to {s.label}
                          </option>
                          
                        ))}
                      </select>

                      
                    </div>

                    {/* Quick Script Actions - Only show for Cold leads */}
                    {stage.label === 'cold' && (
                      <div className="grid grid-cols-3 gap-1 mt-4">
                        {['A', 'B', 'C'].map(v => (
                          <button
                            key={v}
                            onClick={() => sendWhatsApp(lead.id, v as any)}
                            className="text-[10px] bg-slate-800 hover:bg-emerald-600 p-1 rounded transition"
                          >
                            Send {v}
                          </button>
                        ))}
                      </div>
                    )}

                    {stage.label === 'replied' && (
                      <button className="w-full mt-3 text-xs bg-blue-600 py-2 rounded font-bold">
                        View Conversation
                      </button>
                    )}
                  </div>
                ))}
                
            </div>

            
          </div>
        ))}
      </div>
    </div>
  );
}