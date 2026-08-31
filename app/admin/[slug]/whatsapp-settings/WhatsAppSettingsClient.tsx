'use client';

import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  KeyIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  PhoneIcon,
  CommandLineIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  CheckIcon,
  CreditCardIcon,
  BoltIcon,
  PlusIcon,
  BanknotesIcon,
  XMarkIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
} from '@heroicons/react/24/outline';
import {
  useAICredits,
  useAIModels,
  useAICreditTransactions,
  useAIUsageAnalytics,
  useBuyAICredits,
} from '@/hooks/useAI';

export interface WhatsAppUnifiedSettings {
  companyId: string;
  // Meta API Credentials
  environment: 'DEVELOPMENT' | 'SANDBOX' | 'PRODUCTION';
  phoneNumberId: string;
  wabaAccountId: string;
  phoneNumber: string;
  displayName: string;
  appId: string;
  appSecret?: string;
  accessToken?: string;
  webhookVerifyToken?: string;

  // AI Persona & Model Config
  enableAiAgent: boolean;
  provider: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'CUSTOM';
  model: string;
  assistantName: string;
  aiTone: 'professional' | 'friendly' | 'concise' | 'persuasive';
  temperature: number;
  businessDescription: string;
  aiSystemPrompt: string;

  // Agent Capabilities
  canSearchProducts: boolean;
  canCheckOrders: boolean;
  canCreateOrders: boolean;

  // Handoff & Guardrails
  humanHandoff: boolean;
  handoffConfidenceThreshold: number;
  maxAutoRepliesPerUser: number;
  autoHandoffKeywords: string;

  // Business Hours & Automation
  enableBusinessHours: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  offHoursMessage: string;
}

const DEFAULT_PACKAGES = [
  // { id: 'pkg_starter', name: 'Starter Tier', credits: 500, price: 10, popular: false },
  // { id: 'pkg_growth', name: 'Growth Tier', credits: 2000, price: 40, popular: true },
  // { id: 'pkg_scale', name: 'Scale Tier', credits: 5000, price: 120, popular: false },
];

interface Props {
  initialSettings: WhatsAppUnifiedSettings;
  companyId: string;
  initialCredits?: number;
}

export default function WhatsAppSettingsClient({
  initialSettings,
  companyId,
  initialCredits = 0,
}: Props) {
  const [settings, setSettings] = useState<WhatsAppUnifiedSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'ai' | 'tooling' | 'handoff' | 'hours' | 'billing'>('api');

  // Central AI Platform Hooks & Accounting
  const { data: creditsData, isLoading: creditsLoading, refetch: refetchCredits } = useAICredits();
  const { data: modelsData } = useAIModels();
  const { data: transactionsData } = useAICreditTransactions(1, 10);
  const { data: usageData } = useAIUsageAnalytics('month');
  const buyCreditsMutation = useBuyAICredits();

  // Unified Credit Balance from Central Ledger
  const aiCreditBalance = creditsData?.balance ?? initialCredits;
  const packages = creditsData?.packages && creditsData.packages.length > 0 ? creditsData.packages : [];

  // Top-Up Modal State
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(packages[1] || packages[0]);
  const [paymentPhone, setPaymentPhone] = useState(initialSettings.phoneNumber || '');

  const handleChange = <K extends keyof WhatsAppUnifiedSettings>(
    field: K,
    value: WhatsAppUnifiedSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/whatsapp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, companyId }),
      });

      const result = await res.json();
      if (res.ok && (result.success || result.status === 200)) {
        toast.success('WhatsApp and AI settings saved successfully!');
      } else {
        toast.error(result.message || 'Failed to update settings');
      }
    } catch {
      toast.error('Network error while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitiateTopUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await buyCreditsMutation.mutateAsync({
        packageId: selectedPackage.id,
        phone: paymentPhone.trim() || undefined,
        paymentMethod: 'MPESA',
      });

      toast.success(
        `AI Credits top-up initiated! Credited ${selectedPackage.credits.toLocaleString()} credits.`
      );
      setIsTopUpModalOpen(false);
      refetchCredits();
    } catch (err: any) {
      toast.error(err.message || 'Payment initiation failed.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-6 md:p-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                System Control
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              WhatsApp & AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Automation Engine</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4 stroke-[3]" />}
            Save Parameters
          </button>
        </header>

        {/* AI Credit & Token Balance Widget - Authoritative Central Wallet */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 dark:from-slate-900 dark:via-black dark:to-emerald-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <BoltIcon className="w-4 h-4 text-amber-400 animate-pulse" />
              Centralized AI Credit Wallet (Shared Platform Balance)
              <button
                type="button"
                onClick={() => refetchCredits()}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Refresh Credit Balance"
              >
                <ArrowPathIcon className={`w-3.5 h-3.5 text-emerald-400 ${creditsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight">
                {creditsLoading ? '...' : aiCreditBalance.toLocaleString()} <span className="text-xs font-semibold text-slate-400 uppercase">Credits</span>
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
                ~{Math.floor(aiCreditBalance / 10).toLocaleString()} Messages Capacity
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronized in real-time with Central AI Studio, Marketing AI, and WhatsApp Concierge.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPackage(packages[1] || packages[0]);
              setIsTopUpModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer active:scale-95"
          >
            <PlusIcon className="w-4 h-4 stroke-[3]" />
            Top Up Credits
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto">
          {[
            { id: 'api', label: 'Meta Cloud API', icon: KeyIcon },
            { id: 'ai', label: 'AI Persona & LLM', icon: SparklesIcon },
            { id: 'tooling', label: 'Capabilities & Tools', icon: CpuChipIcon },
            { id: 'handoff', label: 'Handoff & Safety Rules', icon: ShieldCheckIcon },
            { id: 'hours', label: 'Business Hours', icon: ClockIcon },
            { id: 'billing', label: 'Credits & Central Ledger', icon: CreditCardIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shrink-0 cursor-pointer ${isActive
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400 shadow-md'
                  : 'bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* TAB 1: Meta Cloud API */}
          {activeTab === 'api' && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <KeyIcon className="h-5 w-5 text-emerald-500" /> Meta Cloud API Setup
              </h3>

              <div className="flex items-center gap-4 bg-slate-50 dark:bg-black/30 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase">Target Environment:</span>
                {(['DEVELOPMENT', 'SANDBOX', 'PRODUCTION'] as const).map((env) => (
                  <label key={env} className="flex items-center gap-2 text-xs font-semibold cursor-pointer capitalize">
                    <input
                      type="radio"
                      name="environment"
                      value={env}
                      checked={settings.environment === env}
                      onChange={() => handleChange('environment', env)}
                      className="accent-emerald-500"
                    />
                    {env.toLowerCase()}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Phone Number ID</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={settings.phoneNumberId}
                      onChange={(e) => handleChange('phoneNumberId', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">WABA Account ID</label>
                  <div className="relative">
                    <CommandLineIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={settings.wabaAccountId}
                      onChange={(e) => handleChange('wabaAccountId', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                  <input
                    type="text"
                    value={settings.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Display Name</label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={settings.displayName}
                      onChange={(e) => handleChange('displayName', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Permanent Access Token</label>
                  <input
                    type="password"
                    value={settings.accessToken || ''}
                    onChange={(e) => handleChange('accessToken', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Webhook Verify Token</label>
                  <input
                    type="text"
                    value={settings.webhookVerifyToken || ''}
                    onChange={(e) => handleChange('webhookVerifyToken', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI Persona & Model Config */}
          {activeTab === 'ai' && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-emerald-500" /> Autonomous AI Persona & Intelligence
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-xs font-bold">{settings.enableAiAgent ? 'AI Active' : 'AI Paused'}</span>
                  <input
                    type="checkbox"
                    checked={settings.enableAiAgent}
                    onChange={(e) => handleChange('enableAiAgent', e.target.checked)}
                    className="h-5 w-5 accent-emerald-500 rounded"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Provider Engine</label>
                  <select
                    value={settings.provider}
                    onChange={(e) => handleChange('provider', e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs"
                  >
                    <option value="OPENAI">OpenAI (GPT-4o, GPT-4o-mini)</option>
                    <option value="GOOGLE">Google Gemini (Gemini 2.5 Flash / Pro)</option>
                    <option value="ANTHROPIC">Anthropic (Claude 3.5 Sonnet)</option>
                    <option value="CUSTOM">Groq / Custom High-Speed LLM</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Model Variant</label>
                  <input
                    type="text"
                    value={settings.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    placeholder="e.g. gpt-4o-mini, llama-3.3-70b-versatile"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Assistant Name</label>
                  <input
                    type="text"
                    value={settings.assistantName}
                    onChange={(e) => handleChange('assistantName', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Communication Tone</label>
                  <select
                    value={settings.aiTone}
                    onChange={(e) => handleChange('aiTone', e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs"
                  >
                    <option value="professional">Professional & Authoritative</option>
                    <option value="friendly">Friendly & Conversational</option>
                    <option value="concise">Concise & Direct</option>
                    <option value="persuasive">Sales & Conversion Focused</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Temperature / Creativity: <span className="text-emerald-500">{settings.temperature}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.temperature}
                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Business Context & Description</label>
                  <textarea
                    rows={3}
                    value={settings.businessDescription}
                    onChange={(e) => handleChange('businessDescription', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">System Instructions Prompt</label>
                  <textarea
                    rows={5}
                    value={settings.aiSystemPrompt}
                    onChange={(e) => handleChange('aiSystemPrompt', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Tooling Permissions */}
          {activeTab === 'tooling' && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CpuChipIcon className="h-5 w-5 text-emerald-500" /> Functional Tool Permissions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'canSearchProducts', label: 'Search Product Catalog' },
                  { key: 'canCheckOrders', label: 'Check Order Status' },
                  { key: 'canCreateOrders', label: 'Draft Customer Orders' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(settings[key as keyof WhatsAppUnifiedSettings])}
                      onChange={(e) => handleChange(key as keyof WhatsAppUnifiedSettings, e.target.checked as any)}
                      className="h-4 w-4 accent-emerald-500 rounded"
                    />
                    <span className="text-xs font-bold">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Handoff & Safety Triggers */}
          {activeTab === 'handoff' && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-500" /> Human Handoff Guardrails
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Confidence Handoff Threshold: <span className="text-emerald-500">{settings.handoffConfidenceThreshold}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.handoffConfidenceThreshold}
                    onChange={(e) => handleChange('handoffConfidenceThreshold', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Max Auto Replies Per User Session</label>
                  <input
                    type="number"
                    value={settings.maxAutoRepliesPerUser}
                    onChange={(e) => handleChange('maxAutoRepliesPerUser', parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Auto Handoff Trigger Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={settings.autoHandoffKeywords}
                    onChange={(e) => handleChange('autoHandoffKeywords', e.target.value)}
                    placeholder="agent, human, support, representative, manager"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Business Hours */}
          {activeTab === 'hours' && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-emerald-500" /> Business Hours Routing
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-xs font-bold">{settings.enableBusinessHours ? 'Active' : 'Disabled'}</span>
                  <input
                    type="checkbox"
                    checked={settings.enableBusinessHours}
                    onChange={(e) => handleChange('enableBusinessHours', e.target.checked)}
                    className="h-5 w-5 accent-emerald-500 rounded"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Opening Time</label>
                  <input
                    type="time"
                    value={settings.businessHoursStart}
                    onChange={(e) => handleChange('businessHoursStart', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Closing Time</label>
                  <input
                    type="time"
                    value={settings.businessHoursEnd}
                    onChange={(e) => handleChange('businessHoursEnd', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Off-Hours Auto Reply Message</label>
                  <textarea
                    rows={3}
                    value={settings.offHoursMessage}
                    onChange={(e) => handleChange('offHoursMessage', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Credits & Central AI Ledger */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <BoltIcon className="w-6 h-6 stroke-2" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Available Balance</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                      {creditsLoading ? '...' : aiCreditBalance.toLocaleString()} Credits
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 stroke-2" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Used This Month</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                      {(creditsData?.stats?.usedThisMonth || 0).toLocaleString()} Credits
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 stroke-2" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Monthly Inferences</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                      {(usageData?.totalRequests || creditsData?.stats?.requestsThisMonth || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Package Bundles */}
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5 text-emerald-500" /> Central AI Credit Bundles
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((pkg: any) => (
                    <div
                      key={pkg.id}
                      className={`relative rounded-2xl p-6 border transition-all flex flex-col justify-between ${pkg.popular
                        ? 'border-emerald-500/80 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20'
                        }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-3 right-6 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{pkg.name}</h4>
                        <p className="text-3xl font-black text-emerald-500 dark:text-emerald-400 mt-2">
                          {pkg.credits.toLocaleString()} <span className="text-xs font-medium text-slate-500 uppercase">Credits</span>
                        </p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                          {pkg.price ? `$${pkg.price}` : `KES ${(pkg.priceKes || pkg.price * 130 || 1000).toLocaleString()}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setIsTopUpModalOpen(true);
                        }}
                        className={`mt-6 w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${pkg.popular
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20'
                          : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                          }`}
                      >
                        Buy Package
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BanknotesIcon className="h-5 w-5 text-emerald-500" /> Recent Central Ledger Transactions
                </h3>

                {transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Balance After</th>
                          <th className="pb-3">Description</th>
                          <th className="pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                        {transactionsData.transactions.map((tx: any) => {
                          const isPositive = tx.amount > 0;
                          return (
                            <tr key={tx.id} className="text-slate-700 dark:text-slate-300">
                              <td className="py-3 flex items-center gap-2 font-sans font-bold">
                                {isPositive ? (
                                  <ArrowDownLeftIcon className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <ArrowUpRightIcon className="w-4 h-4 text-amber-500" />
                                )}
                                {tx.type}
                              </td>
                              <td className={`py-3 font-bold ${isPositive ? 'text-emerald-500' : 'text-slate-500'}`}>
                                {isPositive ? '+' : ''}{tx.amount.toLocaleString()}
                              </td>
                              <td className="py-3 font-semibold">{tx.balanceAfter?.toLocaleString() ?? '-'}</td>
                              <td className="py-3 font-sans text-xs text-slate-500 max-w-xs truncate">
                                {tx.description || tx.referenceId || 'AI Charge'}
                              </td>
                              <td className="py-3 text-slate-400 text-[11px]">
                                {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4">No recent credit wallet transactions recorded.</p>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* TOP-UP MODAL */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6">
            <button
              type="button"
              onClick={() => setIsTopUpModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                <BanknotesIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Purchase AI Credits</h3>
                <p className="text-xs text-slate-500">Central Multi-Tenant Credit Wallet Top-Up</p>
              </div>
            </div>

            {/* Select Package List */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Select Bundle</label>
              <div className="space-y-2">
                {packages.map((pkg: any) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${selectedPackage?.id === pkg.id
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-black/20'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon
                        className={`w-5 h-5 ${selectedPackage?.id === pkg.id ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`}
                      />
                      <div>
                        <p className="font-extrabold text-xs text-slate-900 dark:text-white">{pkg.name}</p>
                        <p className="text-[10px] text-slate-500">{pkg.credits.toLocaleString()} AI Credits</p>
                      </div>
                    </div>
                    <span className="font-black text-xs text-emerald-500">
                      {pkg.price ? `$${pkg.price}` : `KES ${(pkg.priceKes || 1000).toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* M-Pesa Phone Input & Submit */}
            <form onSubmit={handleInitiateTopUp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">
                  M-Pesa Express Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="254712345678"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={buyCreditsMutation.isPending}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {buyCreditsMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Processing Credit Top-Up...
                  </>
                ) : (
                  <>
                    Top-Up {selectedPackage?.credits?.toLocaleString() || ''} Credits Now
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}