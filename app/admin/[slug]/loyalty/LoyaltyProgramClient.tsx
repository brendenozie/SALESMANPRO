"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  StarIcon, GiftIcon, ArrowPathIcon, CheckCircleIcon,
  ChartBarIcon, UserGroupIcon, CogIcon, PencilSquareIcon,
  XMarkIcon, TrophyIcon, SparklesIcon, BoltIcon, FireIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface LoyaltyProgram {
  id?: string;
  name: string;
  pointsPerKes: number;
  kesPerPoint: number;
  minRedeemPoints: number;
  maxRedeemPct: number;
  expiryDays: number | null;
  tierBronzeMin: number;
  tierSilverMin: number;
  tierGoldMin: number;
  tierPlatinumMin: number;
  isActive: boolean;
}

interface Stats {
  totalMembers: number;
  totalPointsIssued: number;
  totalRedeemed: number;
}

const TIER_CONFIG = [
  { name: "BRONZE",   color: "from-amber-700 to-amber-500",  icon: "🥉", min: 0 },
  { name: "SILVER",   color: "from-slate-400 to-slate-300",  icon: "🥈", min: 1000 },
  { name: "GOLD",     color: "from-yellow-500 to-yellow-300",icon: "🥇", min: 5000 },
  { name: "PLATINUM", color: "from-cyan-400 to-indigo-400",  icon: "💎", min: 20000 },
];

const DEFAULTS: LoyaltyProgram = {
  name: "Loyalty Rewards",
  pointsPerKes: 1,
  kesPerPoint: 0.5,
  minRedeemPoints: 100,
  maxRedeemPct: 0.3,
  expiryDays: null,
  tierBronzeMin: 0,
  tierSilverMin: 1000,
  tierGoldMin: 5000,
  tierPlatinumMin: 20000,
  isActive: true,
};

export default function LoyaltyProgramClient({ companyId, slug }: { companyId: string; slug: string }) {
  const [program, setProgram] = useState<LoyaltyProgram>(DEFAULTS);
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, totalPointsIssued: 0, totalRedeemed: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LoyaltyProgram>(DEFAULTS);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/loyalty?companyId=${companyId}`);
      const data = await r.json();
      if (data.program) setProgram(data.program);
      if (data.stats) setStats(data.stats);
    } finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const startEdit = () => { setDraft({ ...program }); setEditing(true); };

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/loyalty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, ...draft }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setProgram(data.program);
      setEditing(false);
      showToast("Loyalty programme saved ✓");
    } catch (e: any) {
      showToast(e.message, false);
    } finally { setSaving(false); }
  };

  const f = (v: number) => v.toLocaleString("en-KE");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <ArrowPathIcon className="h-8 w-8 animate-spin text-violet-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white font-semibold transition-all ${toast.ok ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.ok ? <CheckCircleIcon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-violet-600/30">
              <GiftIcon className="h-7 w-7 text-violet-300" />
            </div>
            <h1 className="text-3xl font-black text-white">Loyalty & Rewards</h1>
          </div>
          <p className="text-slate-400 text-sm ml-14">Configure earn rates, redemption rules, and tier thresholds</p>
        </div>
        <button onClick={startEdit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all">
          <PencilSquareIcon className="h-4 w-4" /> Configure Programme
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Enrolled Members", value: f(stats.totalMembers), icon: UserGroupIcon, color: "from-blue-600 to-blue-400" },
          { label: "Points Issued", value: f(stats.totalPointsIssued), icon: StarIcon, color: "from-violet-600 to-violet-400" },
          { label: "Points Redeemed", value: f(stats.totalRedeemed), icon: GiftIcon, color: "from-emerald-600 to-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-black text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Programme Status Card */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-violet-400" /> Programme Rules
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${program.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {program.isActive ? "● Active" : "● Inactive"}
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Programme Name", value: program.name },
              { label: "Points Earned", value: `${program.pointsPerKes} pts per KES 1 spent` },
              { label: "Redemption Value", value: `KES ${program.kesPerPoint} per point` },
              { label: "Minimum Redemption", value: `${f(program.minRedeemPoints)} points` },
              { label: "Max Redemption", value: `${Math.round(program.maxRedeemPct * 100)}% of order total` },
              { label: "Points Expiry", value: program.expiryDays ? `${program.expiryDays} days` : "Never" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="text-white font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier thresholds */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
            <TrophyIcon className="h-5 w-5 text-yellow-400" /> Loyalty Tiers
          </h2>
          <div className="space-y-3">
            {TIER_CONFIG.map(({ name, color, icon, min }) => {
              const key = `tier${name.charAt(0) + name.slice(1).toLowerCase()}Min` as keyof LoyaltyProgram;
              const threshold = (program[key] as number) ?? min;
              return (
                <div key={name} className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${color} bg-opacity-10`}>
                  <span className="text-xl">{icon}</span>
                  <div className="flex-1">
                    <span className="text-white font-bold text-sm">{name}</span>
                    <div className="text-white/70 text-xs">{f(threshold)}+ points</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                <CogIcon className="h-5 w-5 text-violet-400" /> Configure Programme
              </h2>
              <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Name & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Programme Name</label>
                  <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Status</label>
                  <select value={draft.isActive ? "1" : "0"} onChange={e => setDraft(d => ({ ...d, isActive: e.target.value === "1" }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500">
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Earn & Redeem Rates */}
              <div className="p-4 bg-violet-900/20 rounded-2xl border border-violet-500/20">
                <h3 className="text-violet-300 font-bold text-sm mb-3 flex items-center gap-2"><BoltIcon className="h-4 w-4" /> Earn & Redemption Rates</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Points per KES 1 spent", key: "pointsPerKes", step: 0.1, min: 0.1 },
                    { label: "KES value per 1 point", key: "kesPerPoint", step: 0.1, min: 0.1 },
                    { label: "Min points to redeem", key: "minRedeemPoints", step: 10, min: 10 },
                    { label: "Max % of order (0–1)", key: "maxRedeemPct", step: 0.05, min: 0.05 },
                  ].map(({ label, key, step, min }) => (
                    <div key={key}>
                      <label className="text-slate-400 text-xs font-semibold block mb-1">{label}</label>
                      <input type="number" step={step} min={min}
                        value={(draft as any)[key]}
                        onChange={e => setDraft(d => ({ ...d, [key]: parseFloat(e.target.value) }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Points Expiry (days, blank = never)</label>
                <input type="number" min={1} placeholder="Leave blank for no expiry"
                  value={draft.expiryDays ?? ""}
                  onChange={e => setDraft(d => ({ ...d, expiryDays: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500" />
              </div>

              {/* Tier Thresholds */}
              <div className="p-4 bg-yellow-900/20 rounded-2xl border border-yellow-500/20">
                <h3 className="text-yellow-300 font-bold text-sm mb-3 flex items-center gap-2"><TrophyIcon className="h-4 w-4" /> Tier Thresholds (cumulative points)</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "🥉 Bronze from", key: "tierBronzeMin" },
                    { label: "🥈 Silver from", key: "tierSilverMin" },
                    { label: "🥇 Gold from", key: "tierGoldMin" },
                    { label: "💎 Platinum from", key: "tierPlatinumMin" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-slate-400 text-xs font-semibold block mb-1">{label}</label>
                      <input type="number" min={0}
                        value={(draft as any)[key]}
                        onChange={e => setDraft(d => ({ ...d, [key]: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-slate-400 hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save Programme"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
