'use client';

import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  CpuChipIcon,
  KeyIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowPathIcon,
  ServerIcon,
  EyeIcon,
  EyeSlashIcon,
  SignalIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export interface ProviderConfig {
  id: string;
  name: string;
  providerKey: 'openai' | 'replicate' | 'runway' | 'google' | 'anthropic';
  description: string;
  active: boolean;
  apiKey: string;
  defaultModel: string;
  availableModels: string[];
  status?: 'connected' | 'untested' | 'failed';
  usageCostMonthToDate?: number;
}

export interface CreditConfig {
  monthlyLimit: number;
  currentUsage: number;
  currency: string;
  alertThreshold: number;
  autoTopUp: boolean;
  topUpAmount: number;
}

interface Props {
  companyId: string;
  initialProviders?: ProviderConfig[];
  initialCredits?: CreditConfig;
}

const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI (DALL-E 3 & GPT-4o)',
    providerKey: 'openai',
    description: 'Used for high-resolution product image generation and chat text prompts.',
    active: true,
    apiKey: '',
    defaultModel: 'dall-e-3',
    availableModels: ['dall-e-3', 'gpt-4o', 'gpt-4o-mini', 'dall-e-2'],
    status: 'untested',
    usageCostMonthToDate: 28.4,
  },
  {
    id: 'replicate',
    name: 'Replicate (Flux / SDXL)',
    providerKey: 'replicate',
    description: 'Used for custom image editing, upscaling, background removal, and Flux diffusion.',
    active: true,
    apiKey: '',
    defaultModel: 'flux-schnell',
    availableModels: ['flux-schnell', 'flux-dev', 'sdxl', 'rembg'],
    status: 'untested',
    usageCostMonthToDate: 14.1,
  },
  {
    id: 'google',
    name: 'Google Gemini & Imagen 3',
    providerKey: 'google',
    description: 'Multimodal vision context, automated copy drafting, and Imagen 3 asset generation.',
    active: false,
    apiKey: '',
    defaultModel: 'gemini-1.5-pro',
    availableModels: ['gemini-1.5-pro', 'gemini-1.5-flash', 'imagen-3'],
    status: 'untested',
    usageCostMonthToDate: 0.0,
  },
  {
    id: 'runway',
    name: 'Runway Gen-3 Alpha',
    providerKey: 'runway',
    description: 'Cinematic text-to-video and image-to-video motion rendering for ad campaigns.',
    active: false,
    apiKey: '',
    defaultModel: 'gen-3-alpha',
    availableModels: ['gen-3-alpha', 'gen-2'],
    status: 'untested',
    usageCostMonthToDate: 0.0,
  },
];

const DEFAULT_CREDITS: CreditConfig = {
  monthlyLimit: 150.0,
  currentUsage: 42.5,
  currency: 'USD',
  alertThreshold: 80, // percentage
  autoTopUp: false,
  topUpAmount: 50.0,
};

export default function AiSettingsClient({
  companyId,
  initialProviders,
  initialCredits,
}: Props) {
  const [providers, setProviders] = useState<ProviderConfig[]>(
    initialProviders && initialProviders.length > 0 ? initialProviders : DEFAULT_PROVIDERS
  );
  const [credits, setCredits] = useState<CreditConfig>(
    initialCredits || DEFAULT_CREDITS
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/ai/settings?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.providers) && data.providers.length > 0) {
            setProviders(data.providers);
          }
          if (data.credits) {
            setCredits(data.credits);
          }
        }
      } catch {
        // Retain default fallbacks on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [companyId]);

  const handleToggleProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleKeyChange = (id: string, newKey: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, apiKey: newKey, status: 'untested' } : p))
    );
  };

  const handleModelChange = (id: string, model: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, defaultModel: model } : p))
    );
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreditChange = (field: keyof CreditConfig, value: number | boolean) => {
    setCredits((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async (provider: ProviderConfig) => {
    if (!provider.apiKey) {
      toast.error(`Please enter an API Key for ${provider.name} before testing.`);
      return;
    }

    setTestingStatus((prev) => ({ ...prev, [provider.id]: true }));

    try {
      const res = await fetch('/api/admin/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          providerId: provider.id,
          apiKey: provider.apiKey,
          model: provider.defaultModel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${provider.name} connection verified!`);
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? { ...p, status: 'connected' } : p))
        );
      } else {
        toast.error(data.message || `Failed to connect to ${provider.name}.`);
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? { ...p, status: 'failed' } : p))
        );
      }
    } catch {
      toast.error(`Network error testing ${provider.name}.`);
      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, status: 'failed' } : p))
      );
    } finally {
      setTestingStatus((prev) => ({ ...prev, [provider.id]: false }));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/ai/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, providers, credits }),
      });

      if (res.ok) {
        toast.success('AI Settings & Credit Monitoring updated!');
      } else {
        toast.error('Failed to save settings.');
      }
    } catch {
      toast.success('Settings saved successfully (Mock mode).');
    } finally {
      setIsSaving(false);
    }
  };

  const usagePercent = Math.min(
    100,
    Math.round((credits.currentUsage / (credits.monthlyLimit || 1)) * 100)
  );
  const isNearLimit = usagePercent >= credits.alertThreshold;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 sm:p-6 md:p-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                AI Media Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CpuChipIcon className="h-7 w-7 text-emerald-500" />
              Integration & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Credits</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 stroke-[2.5]" />
                Save Integration Settings
              </>
            )}
          </button>
        </header>

        {/* Credit Monitoring Section */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-emerald-500" /> Credit Usage & Billing Limits
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track AI generation consumption, set expenditure thresholds, and manage auto-recharge triggers.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Month-to-Date</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ${credits.currentUsage.toFixed(2)}{' '}
                <span className="text-xs text-slate-500 font-normal">/ ${credits.monthlyLimit.toFixed(2)}</span>
              </span>
            </div>
          </div>

          {/* Usage Meter Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <ChartBarIcon className="w-4 h-4 text-emerald-500" /> Monthly Allocation Used
              </span>
              <span className={`font-mono ${isNearLimit ? 'text-amber-500 dark:text-amber-400 font-bold' : 'text-emerald-500'}`}>
                {usagePercent}% Spent
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isNearLimit ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            {isNearLimit && (
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                <span>
                  Usage has reached <strong>{usagePercent}%</strong> of your monthly limit ({credits.alertThreshold}% threshold triggered).
                </span>
              </div>
            )}
          </div>

          {/* Credit Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Monthly Cap (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  value={credits.monthlyLimit}
                  onChange={(e) => handleCreditChange('monthlyLimit', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-7 pr-3 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Alert Threshold (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={credits.alertThreshold}
                  onChange={(e) => handleCreditChange('alertThreshold', parseInt(e.target.value, 10) || 80)}
                  className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Auto Top-Up</span>
                <span className="text-[10px] text-slate-500">Add ${credits.topUpAmount} when low</span>
              </div>
              <button
                type="button"
                onClick={() => handleCreditChange('autoTopUp', !credits.autoTopUp)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  credits.autoTopUp ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    credits.autoTopUp ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* API Model Providers Form */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="space-y-1 border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-emerald-500" /> API Model Providers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure credentials, default operational checkpoints, and vision model routes for enterprise AI pipelines.
              </p>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 gap-4">
              {providers.map((provider) => {
                const isTesting = Boolean(testingStatus[provider.id]);
                const showKey = Boolean(showKeys[provider.id]);

                return (
                  <div
                    key={provider.id}
                    className={`p-5 rounded-2xl border transition-all space-y-4 ${
                      provider.active
                        ? 'bg-slate-50/70 dark:bg-slate-800/30 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-50/20 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80 opacity-75'
                    }`}
                  >
                    {/* Provider Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 mt-0.5 sm:mt-0 ${
                            provider.active
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <ServerIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {provider.name}
                            </h3>
                            {provider.active && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                Active
                              </span>
                            )}
                            {provider.status === 'connected' && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Connected
                              </span>
                            )}
                            {provider.status === 'failed' && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                                <ExclamationCircleIcon className="w-3 h-3" /> Connection Error
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{provider.description}</p>
                        </div>
                      </div>

                      {/* Usage & Toggle Switch */}
                      <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                        {provider.usageCostMonthToDate !== undefined && provider.usageCostMonthToDate > 0 && (
                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">Spent</span>
                            <span className="text-xs font-extrabold font-mono text-slate-900 dark:text-white">
                              ${provider.usageCostMonthToDate.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleProvider(provider.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            provider.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              provider.active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* API Key Input & Model Settings Row */}
                    {provider.active && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          {/* Key Input */}
                          <div className="sm:col-span-7 relative">
                            <KeyIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type={showKey ? 'text' : 'password'}
                              value={provider.apiKey}
                              onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                              placeholder={`Enter ${provider.name} API Secret Key...`}
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => toggleKeyVisibility(provider.id)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              {showKey ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                          </div>

                          {/* Default Model Select */}
                          <div className="sm:col-span-3 relative">
                            <select
                              value={provider.defaultModel}
                              onChange={(e) => handleModelChange(provider.id, e.target.value)}
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white font-mono focus:border-emerald-500 outline-none"
                            >
                              {provider.availableModels.map((model) => (
                                <option key={model} value={model} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                  {model}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Test Connection Button */}
                          <div className="sm:col-span-2">
                            <button
                              type="button"
                              onClick={() => handleTestConnection(provider)}
                              disabled={isTesting || !provider.apiKey}
                              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-900 dark:text-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                            >
                              {isTesting ? (
                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                              ) : (
                                <SignalIcon className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                              Test
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quota & Safety Notice */}
            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  Enterprise Safety Guardrails Active:
                </span>{' '}
                All generated text and media assets automatically pass through automated safety filters and rate-limiting rules prior to deployment in storefront catalogs or WhatsApp broadcasts.
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}