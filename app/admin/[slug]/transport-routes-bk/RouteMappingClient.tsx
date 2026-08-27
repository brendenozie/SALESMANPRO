"use client";
import React, { useState } from "react";
import { MapIcon, UserCircleIcon, ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";

const RouteMappingClient = ({ initialData, schoolId }: any) => {
  const [routes] = useState(initialData.routes);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-white">Route <span className="text-blue-400">Dispatch.</span></h1>
          <p className="text-slate-500 text-sm mt-2">Assign morning and afternoon shifts to active fleet units.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route List */}
          <div className="space-y-4">
            {routes.map((route: any) => (
              <div 
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${
                  selectedRoute?.id === route.id ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white">{route.name}</h3>
                  <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase font-black">
                    {JSON.parse(route.stops || "[]").length} Stops
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPinIcon className="h-4 w-4 text-blue-500" />
                  {route.startPoint} → {route.endPoint}
                </div>
              </div>
            ))}
          </div>

          {/* Map / Detail View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-8 min-h-[500px] relative overflow-hidden">
              {selectedRoute ? (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-white">Route Visualization</h2>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 transition-all">
                      Dispatch New Shift
                    </button>
                  </div>
                  
                  {/* Visual Timeline of Stops */}
                  <div className="space-y-6 relative">
                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-800 border-dashed border-l" />
                    {JSON.parse(selectedRoute.stops || "[]").map((stop: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-6 relative z-10">
                        <div className="h-8 w-8 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{stop.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{stop.timeHint || "Scheduled Stop"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-slate-600">
                  <MapIcon className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-sm font-medium">Select a route to view stop sequences and dispatch fleet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RouteMappingClient;