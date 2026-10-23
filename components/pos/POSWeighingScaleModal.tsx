'use client';

import React, { useState, useEffect } from 'react';
import {
  ScaleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { scaleService, ScaleReading } from '@/lib/pos/scaleReader';
import { MarketListingForm } from '@/types/typings';

interface POSWeighingScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketListingForm | null;
  currencySymbol: string;
  onConfirmWeight: (product: MarketListingForm, weight: number, unit: string) => void;
}

export default function POSWeighingScaleModal({
  isOpen,
  onClose,
  product,
  currencySymbol,
  onConfirmWeight,
}: POSWeighingScaleModalProps) {
  const [reading, setReading] = useState<ScaleReading>(scaleService.getCurrentReading());
  const [manualWeight, setManualWeight] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Reset manual input
    setManualWeight('');
    setConnectError(null);

    // Subscribe to live scale events
    const unsubscribe = scaleService.addListener((current) => {
      setReading(current);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const unitPrice = product.finalPrice || product.sellingPrice || 0;
  const activeWeight = manualWeight ? parseFloat(manualWeight) || 0 : reading.weight;
  const calculatedTotal = activeWeight * unitPrice;

  const handleConnectScale = async () => {
    setIsConnecting(true);
    setConnectError(null);
    const res = await scaleService.connect(9600);
    setIsConnecting(false);
    if (!res.success) {
      setConnectError(res.error || 'Connection failed');
    }
  };

  const handleTare = async () => {
    await scaleService.sendTareCommand();
  };

  const handleSimulateWeight = (weight: number) => {
    setIsSimulatedMode(true);
    scaleService.setSimulatedWeight(weight, 'kg');
  };

  const handleConfirm = () => {
    if (activeWeight <= 0) {
      alert('Weight must be greater than zero.');
      return;
    }
    onConfirmWeight(product, activeWeight, reading.unit || 'kg');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ScaleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Digital Produce Scale</h2>
              <p className="text-xs text-emerald-100 font-medium">
                RS-232 / USB Counter Scale Interface
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* PRODUCT OVERVIEW */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
            <img
              src={product.images?.[0] || `https://placehold.co/100x100?text=${product.name}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
              Weighed Item
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate mt-1">
              {product.name}
            </h3>
            <p className="text-xs text-zinc-500 font-semibold">
              Rate: {currencySymbol} {unitPrice.toFixed(2)} / {reading.unit || 'kg'}
            </p>
          </div>
        </div>

        {/* SCALE LCD SCREEN */}
        <div className="p-6 bg-zinc-950 text-white flex flex-col items-center justify-center relative">
          <div className="w-full flex justify-between items-center text-xs font-mono text-zinc-500 mb-2">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  reading.isStable ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                }`}
              />
              {reading.isStable ? 'STABLE' : 'MOTION'}
            </span>
            <span>{isSimulatedMode ? 'SIMULATED SCALE' : 'ONLINE NCI SCALE'}</span>
          </div>

          {/* 7-Segment Digital Readout */}
          <div className="py-6 flex items-baseline gap-3">
            <span className="text-6xl font-mono font-black tracking-tight text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
              {activeWeight.toFixed(3)}
            </span>
            <span className="text-2xl font-mono font-bold text-zinc-400">
              {reading.unit || 'kg'}
            </span>
          </div>

          {/* TOTAL COMPUTATION */}
          <div className="w-full pt-4 border-t border-zinc-800 flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
              Line Subtotal:
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {currencySymbol} {calculatedTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* HARDWARE ACTIONS & FALLBACK */}
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConnectScale}
              disabled={isConnecting}
              className="flex-1 py-2.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <BoltIcon className="w-4 h-4 text-emerald-600" />
              {isConnecting ? 'Connecting...' : 'Connect COM Scale'}
            </button>
            <button
              type="button"
              onClick={handleTare}
              className="py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" /> Tare / Zero
            </button>
          </div>

          {connectError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{connectError}</p>
          )}

          {/* QUICK WEIGHT PRESETS / SIMULATION */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Quick Weight Presets (Demo & Pre-packs)
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[0.25, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSimulateWeight(preset)}
                  className="py-1.5 px-2 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-semibold transition"
                >
                  {preset} kg
                </button>
              ))}
            </div>
          </div>

          {/* MANUAL OVERRIDE INPUT */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Manual Weight Override ({reading.unit || 'kg'})
            </label>
            <input
              type="number"
              step="0.001"
              value={manualWeight}
              onChange={(e) => setManualWeight(e.target.value)}
              placeholder="e.g. 1.250"
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* CONFIRM BUTTON */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Add {activeWeight.toFixed(3)} {reading.unit || 'kg'} to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
