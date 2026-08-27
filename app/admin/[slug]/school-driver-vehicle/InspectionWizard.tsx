'use client';

import React, { useState } from 'react';
import { 
  CheckIcon, 
  XMarkIcon, 
  CameraIcon, 
  ChevronRightIcon, 
  LightBulbIcon, // For Lights
  LifebuoyIcon, // For Tires
  WrenchIcon, // For Brakes
  BeakerIcon, // For Fluids
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const INSPECTION_STEPS = [
  { id: 'lights', label: 'Exterior Lights', icon: LightBulbIcon, subtasks: ['Headlights', 'Turn Signals', 'Brake Lights', 'Stop Arm'] },
  { id: 'tires', label: 'Wheels & Tires', icon: LifebuoyIcon, subtasks: ['Tread Depth', 'Pressure', 'Lug Nuts', 'Side Walls'] },
  { id: 'fluids', label: 'Under Hood', icon: BeakerIcon, subtasks: ['Oil Level', 'Coolant', 'Windshield Wash', 'Belts/Hoses'] },
  { id: 'safety', label: 'Brakes & Air', icon: WrenchIcon, subtasks: ['Service Brake', 'Parking Brake', 'Air Pressure Leak', 'Warning Buzzer'] },
];

export default function InspectionWizard({ onComplete, onCancel }: { onComplete: () => void, onCancel: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSubtasks, setCompletedSubtasks] = useState<Record<string, boolean>>({});
  const [showCamera, setShowCamera] = useState(false);

  const activeStep = INSPECTION_STEPS[currentStep];
  
  const toggleSubtask = (task: string) => {
    setCompletedSubtasks(prev => ({ ...prev, [task]: !prev[task] }));
  };

  const isStepComplete = activeStep.subtasks.every(task => completedSubtasks[task]);

  const handleNext = () => {
    if (currentStep < INSPECTION_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0C10] z-[200] flex flex-col font-sans">
      
      {/* TOP PROGRESS BAR */}
      <div className="p-6 bg-[#12161F] border-b border-white/10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onCancel} className="text-slate-500 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
            Step {currentStep + 1} of {INSPECTION_STEPS.length}
          </span>
          <div className="w-6" />
        </div>
        <div className="flex gap-1">
          {INSPECTION_STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= currentStep ? 'bg-blue-600' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {/* ACTIVE STEP CONTENT */}
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div 
          key={activeStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20">
              <activeStep.icon className="h-10 w-10 text-blue-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">{activeStep.label}</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Zone Inspection</p>
            </div>
          </div>

          <div className="space-y-3">
            {activeStep.subtasks.map((task) => (
              <button
                key={task}
                onClick={() => toggleSubtask(task)}
                className={`w-full p-6 rounded-[2rem] border transition-all flex items-center justify-between ${
                  completedSubtasks[task] 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-white/5 border-white/10'
                }`}
              >
                <span className={`font-bold text-lg ${completedSubtasks[task] ? 'text-emerald-500' : 'text-white'}`}>
                  {task}
                </span>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  completedSubtasks[task] ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                }`}>
                  {completedSubtasks[task] && <CheckIcon className="h-5 w-5 text-white" />}
                </div>
              </button>
            ))}
          </div>

          {/* DAMAGE REPORTING */}
          <div className="pt-4">
            <button 
              onClick={() => setShowCamera(true)}
              className="w-full py-6 rounded-[2rem] border-2 border-dashed border-rose-500/30 text-rose-500 flex flex-col items-center gap-2 hover:bg-rose-500/5 transition-all"
            >
              <CameraIcon className="h-8 w-8" />
              <span className="text-[10px] font-black uppercase tracking-widest">Report Defect / Snap Photo</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="p-8 bg-gradient-to-t from-black to-transparent">
        <button 
          onClick={handleNext}
          disabled={!isStepComplete}
          className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl disabled:opacity-30 transition-all active:scale-95"
        >
          {currentStep === INSPECTION_STEPS.length - 1 ? (
            <>SUBMIT LOG <ShieldCheckIcon className="h-7 w-7 text-blue-600" /></>
          ) : (
            <>NEXT ZONE <ChevronRightIcon className="h-7 w-7 text-blue-600" /></>
          )}
        </button>
      </div>

      {/* MOCK CAMERA OVERLAY */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-0 bg-black z-[210] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-full aspect-[3/4] bg-slate-800 rounded-[3rem] border-4 border-white/20 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Align Camera to Defect</p>
            </div>
            <div className="mt-12 flex items-center gap-12">
                <button onClick={() => setShowCamera(false)} className="text-white font-black text-xs uppercase tracking-widest">Cancel</button>
                <button onClick={() => setShowCamera(false)} className="w-20 h-20 bg-white rounded-full border-[6px] border-white/20 active:scale-90 transition-transform" />
                <div className="w-12" /> {/* Spacer */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}