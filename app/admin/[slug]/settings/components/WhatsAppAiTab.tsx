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
} from '@heroicons/react/24/outline';
import { InputGroup, SaveButton } from './SharedUi';

interface WhatsAppAiTabProps {
  companyId: string;
  showStatus: (type: 'success' | 'error', message: string) => void;
  apiBaseUrl: string;
}

export const WhatsAppAiTab: React.FC<WhatsAppAiTabProps> = ({ companyId, showStatus, apiBaseUrl }) => {
  const [loading, setLoading] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<'meta' | 'ai'>('meta');

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

  // Load existing config on mount
  useEffect(() => {
    async function fetchWhatsAppConfig() {
      try {
        const res = await fetch(`${apiBaseUrl}/admin/whatsapp-config?companyId=${companyId}`);
        if (res.ok) {
          const payload = await res.json();
          if (payload.account) {
            setEnvironment(payload.account.environment || 'PRODUCTION');
            setPhoneNumberId(payload.account.phoneNumberId || '');
            setPhoneNumber(payload.account.phoneNumber || '');
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
      }
    }
    fetchWhatsAppConfig();
  }, [companyId, apiBaseUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/whatsapp-config`, {
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
      <div className="border-b pb-3 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-green-600" />
            WhatsApp & AI Automation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure Meta Cloud API credentials and tune your automated AI response persona.
          </p>
        </div>

        {/* Global AI Active Toggle */}
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

      {/* Sub Navigation Controls */}
      <div className="flex gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveSubSection('meta')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubSection === 'meta'
              ? 'bg-green-50 text-green-700 border border-green-200'
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
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <SparklesIcon className="w-4 h-4" /> AI Persona & Capabilities
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {activeSubSection === 'meta' && (
          <div className="space-y-6">
            {/* Gateway Environment */}
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
          </div>
        )}

        {activeSubSection === 'ai' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm"
                >
                  <option value="OPENAI">OpenAI</option>
                  <option value="ANTHROPIC">Anthropic</option>
                  <option value="GOOGLE">Google Gemini</option>
                  <option value="CUSTOM">Custom Provider</option>
                </select>
              </div>

              <InputGroup
                id="ai-model"
                label="Model Variant"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                Icon={CpuChipIcon}
                placeholder="gpt-4o, claude-3-5-sonnet, gemini-1.5-pro"
              />

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

            {/* Prompt Design */}
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

            {/* Fine Tuning & Thresholds */}
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

            {/* Capability Permissions */}
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
          </div>
        )}

        <SaveButton label="Save WhatsApp & AI Parameters" loading={loading} />
      </form>
    </div>
  );
};