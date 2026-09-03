'use client';

import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { InputGroup, SaveButton } from './SharedUi';

interface KraTabProps {
  companyId: string;
  showStatus: (type: 'success' | 'error', message: string) => void;
  apiBaseUrl: string;
}

export const KraTab: React.FC<KraTabProps> = ({ companyId, showStatus, apiBaseUrl }) => {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  // Authoritative Requirement & Modes
  const [invoicingRequirement, setInvoicingRequirement] = useState<'REQUIRED' | 'ENABLED' | 'NOT_APPLICABLE'>('NOT_APPLICABLE');
  const [integrationMode, setIntegrationMode] = useState<'OSCU' | 'VSCU'>('OSCU');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  
  // Taxpayer Identifiers
  const [kraPin, setKraPin] = useState('');
  const [taxpayerName, setTaxpayerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  
  // Branch & Device
  const [branchId, setBranchId] = useState('00');
  const [branchName, setBranchName] = useState('Head Office');
  const [deviceId, setDeviceId] = useState('');
  const [managerKey, setManagerKey] = useState('');
  const [defaultTaxCode, setDefaultTaxCode] = useState('A');
  const [offlineAllowed, setOfflineAllowed] = useState(false);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);

  // Operational Status
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState('NOT_CONFIGURED');
  const [lastInitAt, setLastInitAt] = useState<string | null>(null);

  // Fetch Configuration on Load
  useEffect(() => {
    async function fetchKraConfig() {
      try {
        const res = await fetch(`/api/admin/etims/config?companyId=${companyId}`);
        if (res.ok) {
          const payload = await res.json();
          const cfg = payload.data?.config;
          if (cfg) {
            setInvoicingRequirement(cfg.invoicingRequirement || (cfg.etimsEnabled ? 'REQUIRED' : 'NOT_APPLICABLE'));
            setIntegrationMode(cfg.integrationMode || 'OSCU');
            setEnvironment(cfg.environment || 'sandbox');
            setKraPin(cfg.kraPin || '');
            setTaxpayerName(cfg.taxpayerName || '');
            setBusinessName(cfg.businessName || '');
            setBranchId(cfg.branchId || '00');
            setBranchName(cfg.branchName || 'Head Office');
            setDeviceId(cfg.deviceId || '');
            setDefaultTaxCode(cfg.defaultTaxCode || 'A');
            setOfflineAllowed(Boolean(cfg.offlineAllowed));
            setAutoPrintReceipt(cfg.autoPrintReceipt ?? true);
            setIsInitialized(Boolean(cfg.hasCmcKey || cfg.cmcKey));
            setStatus(cfg.status || 'NOT_CONFIGURED');
            setLastInitAt(cfg.lastInitAt || null);
          }
        }
      } catch (err) {
        console.error('Error tracking KRA config state:', err);
      }
    }
    if (companyId) fetchKraConfig();
  }, [companyId]);

  // Save Config parameters
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/etims/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          invoicingRequirement,
          integrationMode,
          environment,
          kraPin: kraPin.toUpperCase().trim(),
          taxpayerName,
          businessName,
          branchId,
          branchName,
          deviceId,
          managerKey,
          defaultTaxCode,
          offlineAllowed,
          autoPrintReceipt,
          etimsEnabled: invoicingRequirement === 'REQUIRED' || invoicingRequirement === 'ENABLED',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update eTIMS configuration.');
      showStatus('success', 'eTIMS parameters and statutory mode saved successfully.');
    } catch (err: any) {
      showStatus('error', err.message || 'Error occurred during profile persistence.');
    } finally {
      setLoading(false);
    }
  };

  // Run Real-time KRA Initialization Handshake
  const handleDeviceInitialization = async () => {
    setInitLoading(true);
    try {
      const res = await fetch(`/api/admin/kra-config/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Handshake rejected by tax authority.');

      setIsInitialized(true);
      setStatus('ACTIVE');
      setLastInitAt(new Date().toISOString());
      showStatus('success', 'eTIMS Device Handshake completed. Communication key generated & stored securely.');
    } catch (err: any) {
      showStatus('error', err.message || 'Initialization lifecycle sequence failed.');
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">KRA eTIMS Integration</h2>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300'
                  : status === 'PENDING_SETUP'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-300'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Authoritative Kenya Revenue Authority fiscal transmission and dual receipt engine.
          </p>
        </div>

        {slug && (
          <Link
            href={`/admin/${slug}/etims`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-semibold border border-indigo-200 dark:border-indigo-800 transition shadow-sm"
          >
            <DocumentCheckIcon className="w-4 h-4" />
            eTIMS Command Center
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 opacity-70" />
          </Link>
        )}
      </div>

      <form onSubmit={handleSaveConfig} className="space-y-6">
        {/* Statutory Invoicing Requirement */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div>
            <label className="text-sm font-bold text-gray-900 dark:text-white block">
              Business Invoicing Requirement (Statutory Mode)
            </label>
            <p className="text-xs text-gray-500 mt-0.5">
              Determines whether transactions must be transmitted to KRA eTIMS or issued as standard commercial sales receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {[
              {
                id: 'REQUIRED',
                title: 'REQUIRED (Statutory Mandate)',
                desc: 'VAT-registered business. All qualifying POS sales must generate authoritative eTIMS fiscal tax invoices.',
                color: 'border-emerald-500 bg-emerald-50/50 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-300',
              },
              {
                id: 'ENABLED',
                title: 'ENABLED (Voluntary Compliance)',
                desc: 'Voluntarily transmitting fiscal sales to KRA eTIMS while maintaining standard operations.',
                color: 'border-blue-500 bg-blue-50/50 text-blue-950 dark:bg-blue-950/20 dark:text-blue-300',
              },
              {
                id: 'NOT_APPLICABLE',
                title: 'NOT APPLICABLE (Standard POS)',
                desc: 'Sole proprietorship / Non-VAT business. Uses clean SalesmanPro Standard Receipts with no fake tax codes.',
                color: 'border-zinc-500 bg-zinc-50/50 text-zinc-950 dark:bg-zinc-800/40 dark:text-zinc-200',
              },
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => setInvoicingRequirement(option.id as any)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  invoicingRequirement === option.id ? option.color : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="font-bold text-sm mb-1">{option.title}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{option.desc}</div>
                </div>
                <div className="mt-3 text-xs font-semibold text-right">
                  {invoicingRequirement === option.id ? '● Selected' : '○ Select'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Mode & Environment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
              eTIMS Technical Adapter Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIntegrationMode('OSCU')}
                className={`p-3 rounded-lg border text-sm font-semibold text-center transition ${
                  integrationMode === 'OSCU'
                    ? 'border-indigo-600 bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                }`}
              >
                OSCU (Online SDC)
                <span className="block text-[10px] font-normal text-zinc-400 mt-0.5">Real-time HTTP Cloud SDC</span>
              </button>
              <button
                type="button"
                onClick={() => setIntegrationMode('VSCU')}
                className={`p-3 rounded-lg border text-sm font-semibold text-center transition ${
                  integrationMode === 'VSCU'
                    ? 'border-indigo-600 bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                }`}
              >
                VSCU (Virtual SDC)
                <span className="block text-[10px] font-normal text-zinc-400 mt-0.5">Virtual batch & offline queue</span>
              </button>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
              KRA eTIMS Gateway Environment
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEnvironment('sandbox')}
                className={`p-3 rounded-lg border text-sm font-semibold text-center transition ${
                  environment === 'sandbox'
                    ? 'border-indigo-600 bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                }`}
              >
                Sandbox Testbed
                <span className="block text-[10px] font-normal text-zinc-400 mt-0.5">timstst.kra.go.ke</span>
              </button>
              <button
                type="button"
                onClick={() => setEnvironment('production')}
                className={`p-3 rounded-lg border text-sm font-semibold text-center transition ${
                  environment === 'production'
                    ? 'border-emerald-600 bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                }`}
              >
                Live Production
                <span className="block text-[10px] font-normal text-zinc-400 mt-0.5">etims.kra.go.ke</span>
              </button>
            </div>
          </div>
        </div>

        {/* Taxpayer Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            id="kra-pin"
            label="Taxpayer KRA PIN"
            value={kraPin}
            onChange={(e) => setKraPin(e.target.value)}
            Icon={IdentificationIcon}
            placeholder="P051234567Z"
            maxLength={11}
            required={invoicingRequirement === 'REQUIRED'}
          />
          <InputGroup
            id="taxpayer-name"
            label="Registered Taxpayer Name"
            value={taxpayerName}
            onChange={(e) => setTaxpayerName(e.target.value)}
            Icon={BuildingOfficeIcon}
            placeholder="e.g. ACME RETAIL ENTERPRISES LTD"
          />
          <InputGroup
            id="branch-id"
            label="Branch ID (Default: 00)"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            Icon={BuildingOfficeIcon}
            placeholder="00"
            required
          />
          <InputGroup
            id="branch-name"
            label="Branch Name"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            Icon={BuildingOfficeIcon}
            placeholder="e.g. Westlands Main Store"
          />
          <InputGroup
            id="device-id"
            label="eTIMS SDC / Device ID"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            Icon={CpuChipIcon}
            placeholder="OSCU000000"
            required={invoicingRequirement === 'REQUIRED'}
          />
          <InputGroup
            id="manager-key"
            label="Account Manager Key (Encrypted at Rest)"
            type="password"
            value={managerKey}
            onChange={(e) => setManagerKey(e.target.value)}
            Icon={ShieldCheckIcon}
            placeholder="••••••••••••••••"
          />
        </div>

        {/* Default Tax Code & Receipt Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">
              Default Tax Category
            </label>
            <select
              value={defaultTaxCode}
              onChange={(e) => setDefaultTaxCode(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold"
            >
              <option value="A">Code A — Standard 16% VAT</option>
              <option value="B">Code B — Zero Rated 0% VAT</option>
              <option value="C">Code C — VAT Exempt</option>
              <option value="D">Code D — Specialized 8% VAT</option>
              <option value="E">Code E — Other Non-VAT (0%)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <input
              type="checkbox"
              id="auto-print"
              checked={autoPrintReceipt}
              onChange={(e) => setAutoPrintReceipt(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="auto-print" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Auto-print receipt on POS sale completion
            </label>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <input
              type="checkbox"
              id="offline-allowed"
              checked={offlineAllowed}
              onChange={(e) => setOfflineAllowed(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="offline-allowed" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Queue sales when offline (VSCU mode only)
            </label>
          </div>
        </div>

        <SaveButton label="Save eTIMS Settings & Tax Rules" loading={loading} />
      </form>

      {/* Real-time Handshake & Device Initialization Panel */}
      {kraPin && deviceId && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 text-lg flex items-center gap-2">
              {isInitialized ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                  KRA Device Handshake Active
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                  Handshake Required Before Live Sales
                </>
              )}
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-300 max-w-xl leading-relaxed">
              {isInitialized
                ? `Authoritative communication key (cmcKey) is active and securely encrypted in database. Last verified: ${
                    lastInitAt ? new Date(lastInitAt).toLocaleString() : 'Recently'
                  }.`
                : 'Performs device authentication against the KRA eTIMS server to exchange certificate and establish the signed session key.'}
            </p>
          </div>

          <button
            type="button"
            disabled={initLoading}
            onClick={handleDeviceInitialization}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 whitespace-nowrap active:scale-98"
          >
            {initLoading ? 'Authenticating with KRA...' : isInitialized ? 'Re-sync Device Handshake' : 'Initialize Device Handshake'}
          </button>
        </div>
      )}
    </div>
  );
};