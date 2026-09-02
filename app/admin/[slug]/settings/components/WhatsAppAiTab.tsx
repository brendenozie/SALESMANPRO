'use client';

import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  KeyIcon,
  PhoneIcon,
  CpuChipIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  CreditCardIcon,
  BoltIcon,
  PlusIcon,
  ArrowPathIcon,
  BanknotesIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { InputGroup, SaveButton } from './SharedUi';

interface WhatsAppAiTabProps {
  companyId: string;
  showStatus: (type: 'success' | 'error', message: string) => void;
  apiBaseUrl: string;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceKes: number;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'pkg_starter', name: 'Starter Pack', credits: 10000, priceKes: 500 },
  { id: 'pkg_growth', name: 'Growth Bundle', credits: 50000, priceKes: 2000, popular: true },
  { id: 'pkg_scale', name: 'Scale Enterprise', credits: 200000, priceKes: 7000 },
];

export const WhatsAppAiTab: React.FC<WhatsAppAiTabProps> = ({ companyId, showStatus, apiBaseUrl }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<'meta' | 'ai' | 'billing'>('meta');

  // Token & Credit States
  const [aiCreditBalance, setAiCreditBalance] = useState<number>(0);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(CREDIT_PACKAGES[1]);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  // Meta Cloud API States
  const [environment, setEnvironment] = useState<'DEVELOPMENT' | 'SANDBOX' | 'PRODUCTION'>('PRODUCTION');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [appId, setAppId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState('');

  // AI Configuration States
  const [aiEnabled, setAiEnabled] = useState(true);
  const [provider, setProvider] = useState<'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'CUSTOM'>('OPENAI');
  const [model, setModel] = useState('gpt-4o');
  const [assistantName, setAssistantName] = useState('Assistant');
  const [tone, setTone] = useState('professional');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [autoReply, setAutoReply] = useState(true);
  const [humanHandoff, setHumanHandoff] = useState(true);
  const [handoffConfidenceThreshold, setHandoffConfidenceThreshold] = useState(0.55);
  const [temperature, setTemperature] = useState(0.3);

  // AI Capabilities
  const [canSearchProducts, setCanSearchProducts] = useState(true);
  const [canCheckOrders, setCanCheckOrders] = useState(true);
  const [canCreateOrders, setCanCreateOrders] = useState(false);

  // Fetch settings & token balance
  const fetchWhatsAppConfig = async () => {
    setFetchingBalance(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/whatsapp/settings?companyId=${companyId}`);
      if (res.ok) {
        const payload = await res.json();

        if (payload.aiCreditBalance !== undefined) {
          setAiCreditBalance(payload.aiCreditBalance);
        }

        if (payload.account) {
          setEnvironment(payload.account.environment || 'PRODUCTION');
          setPhoneNumberId(payload.account.phoneNumberId || '');
          setPhoneNumber(payload.account.phoneNumber || '');
          setPaymentPhone(payload.account.phoneNumber || '');
          setDisplayName(payload.account.displayName || '');
          setAppId(payload.account.appId || '');
        }

        if (payload.aiConfig) {
          setAiEnabled(payload.aiConfig.enabled ?? true);
          setProvider(payload.aiConfig.provider || 'OPENAI');
          setModel(payload.aiConfig.model || 'gpt-4o');
          setAssistantName(payload.aiConfig.assistantName || 'Assistant');
          setTone(payload.aiConfig.tone || 'professional');
          setSystemPrompt(payload.aiConfig.systemPrompt || '');
          setBusinessDescription(payload.aiConfig.businessDescription || '');
          setAutoReply(payload.aiConfig.autoReply ?? true);
          setHumanHandoff(payload.aiConfig.humanHandoff ?? true);
          setHandoffConfidenceThreshold(payload.aiConfig.handoffConfidenceThreshold ?? 0.55);
          setTemperature(payload.aiConfig.temperature ?? 0.3);
          setCanSearchProducts(payload.aiConfig.canSearchProducts ?? true);
          setCanCheckOrders(payload.aiConfig.canCheckOrders ?? true);
          setCanCreateOrders(payload.aiConfig.canCreateOrders ?? false);
        }
      }
    } catch (err) {
      console.error('Failed to load WhatsApp & AI settings:', err);
    } finally {
      setFetchingBalance(false);
    }
  };

  useEffect(() => {
    fetchWhatsAppConfig();
  }, [companyId, apiBaseUrl]);

  // Handle Credit Top-Up Purchase
  const handleInitiateTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/credits/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          packageId: selectedPackage.id,
          credits: selectedPackage.credits,
          amountKes: selectedPackage.priceKes,
          phoneNumber: paymentPhone.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to initiate credit payment.');

      showStatus('success', `M-Pesa payment prompt sent to ${paymentPhone}. Complete payment to add credits.`);
      setIsTopUpModalOpen(false);
      // Refresh balance after short delay
      setTimeout(fetchWhatsAppConfig, 3000);
    } catch (err: any) {
      showStatus('error', err.message || 'Payment initiation failed.');
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/whatsapp/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          account: {
            environment,
            phoneNumberId: phoneNumberId.trim(),
            phoneNumber: phoneNumber.trim(),
            displayName: displayName.trim(),
            appId: appId.trim(),
            ...(accessToken && { accessToken: accessToken.trim() }),
            ...(appSecret && { appSecret: appSecret.trim() }),
            ...(webhookVerifyToken && { webhookVerifyToken: webhookVerifyToken.trim() }),
          },
          aiConfig: {
            enabled: aiEnabled,
            provider,
            model,
            assistantName,
            tone,
            systemPrompt,
            businessDescription,
            autoReply,
            humanHandoff,
            handoffConfidenceThreshold: Number(handoffConfidenceThreshold),
            temperature: Number(temperature),
            canSearchProducts,
            canCheckOrders,
            canCreateOrders,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to update WhatsApp AI configuration.');
      showStatus('success', 'WhatsApp Meta API & AI parameters saved successfully.');
    } catch (err: any) {
      showStatus('error', err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b pb-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-green-600" />
            WhatsApp & AI Automation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure Meta Cloud API credentials, tune AI responses, and manage token credits.
          </p>
        </div>

        {/* Global AI Toggle */}
        <label className="inline-flex items-center gap-3 cursor-pointer bg-gray-50 p-2 rounded-lg border">
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          <span className="text-sm font-semibold text-gray-700">AI Engine Enabled</span>
        </label>
      </div>

      {/* AI Token Balance Card Widget */}
      <div className="bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-200 text-xs font-semibold uppercase tracking-wider">
            <BoltIcon className="w-4 h-4 text-amber-400 animate-pulse" />
            Available AI Credits Balance
            <button
              onClick={fetchWhatsAppConfig}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              title="Refresh Balance"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 text-green-300 ${fetchingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold tracking-tight">
              {aiCreditBalance.toLocaleString()} <span className="text-lg font-medium text-green-200">Credits</span>
            </span>
            <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full text-green-100 border border-white/10">
              ~{Math.floor(aiCreditBalance / 10).toLocaleString()} Messages Capacity
            </span>
          </div>
          <p className="text-xs text-green-200/80">
            Automated customer replies deduct credits based on exact token usage per turn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTopUpModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-950 font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm"
        >
          <PlusIcon className="w-5 h-5 stroke-[2.5]" />
          Buy AI Credits
        </button>
      </div>

      {/* Sub Navigation Controls */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveSubSection('meta')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubSection === 'meta'
              ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <PhoneIcon className="w-4 h-4" /> Meta API Credentials
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubSection === 'ai'
              ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <SparklesIcon className="w-4 h-4" /> AI Persona & Capabilities
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubSection === 'billing'
              ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CreditCardIcon className="w-4 h-4" /> Credit Top-Up & Usage
        </button>
      </div>

      {/* SUB-SECTION 1: META API */}
      {activeSubSection === 'meta' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-700">Environment Target:</span>
            {(['DEVELOPMENT', 'SANDBOX', 'PRODUCTION'] as const).map((env) => (
              <label key={env} className="flex items-center gap-2 text-sm cursor-pointer text-gray-900 capitalize">
                <input
                  type="radio"
                  value={env}
                  checked={environment === env}
                  onChange={() => setEnvironment(env)}
                  name="environment"
                />
                {env.toLowerCase()}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              id="phone-number-id"
              label="WhatsApp Phone Number ID"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              Icon={PhoneIcon}
              placeholder="e.g. 104829102930219"
              required
            />
            <InputGroup
              id="phone-number"
              label="WhatsApp Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              Icon={PhoneIcon}
              placeholder="+254700000000"
            />
            <InputGroup
              id="display-name"
              label="Business Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              Icon={BuildingOfficeIcon}
              placeholder="e.g. Acme Sales Support"
            />
            <InputGroup
              id="app-id"
              label="Meta App ID"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              Icon={CpuChipIcon}
              placeholder="e.g. 987654321012345"
            />
            <InputGroup
              id="access-token"
              label="Permanent Access Token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              Icon={KeyIcon}
              placeholder="••••••••••••••••"
            />
            <InputGroup
              id="app-secret"
              label="Meta App Secret"
              type="password"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              Icon={ShieldCheckIcon}
              placeholder="••••••••••••••••"
            />
            <InputGroup
              id="webhook-verify-token"
              label="Webhook Verification Token"
              type="password"
              value={webhookVerifyToken}
              onChange={(e) => setWebhookVerifyToken(e.target.value)}
              Icon={KeyIcon}
              placeholder="Set a secret token for Meta webhook validation"
            />
          </div>

          <SaveButton label="Save Meta API Settings" loading={loading} />
        </form>
      )}

      {/* SUB-SECTION 2: AI PERSONA */}
      {activeSubSection === 'ai' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* SalesmanPro Managed AI Engine Banner */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
                <CpuChipIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">
                    SalesmanPro Managed Intelligence
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                    Platform Optimized
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Underlying AI engines, model versioning, and provider failover are managed centrally by SalesmanPro. Stores configure their persona, context, and manage credits below.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-xs text-gray-500 block">Balance</span>
              <span className="text-sm font-bold text-green-600 font-mono">
                {aiCreditBalance.toLocaleString()} Credits
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <InputGroup
              id="assistant-name"
              label="Assistant Persona Name"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              Icon={SparklesIcon}
              placeholder="e.g. Sarah"
            />

            <InputGroup
              id="ai-tone"
              label="Communication Tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              Icon={AdjustmentsHorizontalIcon}
              placeholder="professional, friendly, casual"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Context & Description</label>
              <textarea
                rows={3}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                placeholder="Summarize your company's core operations, products, and customer policies..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom System Instructions</label>
              <textarea
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                placeholder="Define strict boundary guidelines and response expectations for the agent..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature / Creativity: <span className="font-semibold">{temperature}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Human Handoff Confidence Threshold: <span className="font-semibold">{handoffConfidenceThreshold}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={handoffConfidenceThreshold}
                onChange={(e) => setHandoffConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700 block">AI Agent Functional Tooling</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-pointer">
                <input
                  type="checkbox"
                  checked={canSearchProducts}
                  onChange={(e) => setCanSearchProducts(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-800">Search Product Catalog</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-pointer">
                <input
                  type="checkbox"
                  checked={canCheckOrders}
                  onChange={(e) => setCanCheckOrders(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-800">Check Order Status</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-pointer">
                <input
                  type="checkbox"
                  checked={canCreateOrders}
                  onChange={(e) => setCanCreateOrders(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-800">Draft Customer Orders</span>
              </label>
            </div>
          </div>

          <SaveButton label="Save AI Parameters" loading={loading} />
        </form>
      )}

      {/* SUB-SECTION 3: CREDITS & BILLING */}
      {activeSubSection === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-xl p-5 border transition-all flex flex-col justify-between ${
                  pkg.popular ? 'border-green-500 bg-green-50/40 shadow-sm' : 'border-gray-200 bg-white'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 right-4 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{pkg.name}</h3>
                  <p className="text-2xl font-extrabold text-green-700 mt-2">
                    {pkg.credits.toLocaleString()} <span className="text-xs font-semibold text-gray-500">Credits</span>
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">KES {pkg.priceKes.toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setIsTopUpModalOpen(true);
                  }}
                  className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                    pkg.popular
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  Buy Package
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP-UP MODAL */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setIsTopUpModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 text-green-700 rounded-xl">
                <BanknotesIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Purchase AI Credits</h3>
                <p className="text-xs text-gray-500">Instant top-up via M-Pesa STK Push</p>
              </div>
            </div>

            {/* Select Package Grid inside Modal */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Select Bundle</label>
              <div className="grid grid-cols-1 gap-2">
                {CREDIT_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                      selectedPackage.id === pkg.id
                        ? 'border-green-600 bg-green-50/60 ring-2 ring-green-600/20'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon
                        className={`w-5 h-5 ${selectedPackage.id === pkg.id ? 'text-green-600' : 'text-gray-300'}`}
                      />
                      <div>
                        <p className="font-bold text-sm text-gray-900">{pkg.name}</p>
                        <p className="text-xs text-gray-500">{pkg.credits.toLocaleString()} AI Credits</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-green-700">KES {pkg.priceKes.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Phone Number */}
            <form onSubmit={handleInitiateTopUp} className="space-y-4">
              <InputGroup
                id="payment-phone"
                label="M-Pesa Express Phone Number"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                Icon={PhoneIcon}
                placeholder="254712345678"
                required
              />

              <button
                type="submit"
                disabled={topUpLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {topUpLoading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Sending M-Pesa Prompt...
                  </>
                ) : (
                  <>Pay KES {selectedPackage.priceKes.toLocaleString()} Now</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};