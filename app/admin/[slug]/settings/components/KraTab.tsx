'use client';

import React, { useState, useEffect } from 'react';
import { BuildingOfficeIcon, IdentificationIcon, ShieldCheckIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { InputGroup, SaveButton } from './SharedUi';

interface KraTabProps {
  companyId: string;
  showStatus: (type: 'success' | 'error', message: string) => void;
  apiBaseUrl: string;
}

export const KraTab: React.FC<KraTabProps> = ({ companyId, showStatus, apiBaseUrl }) => {
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  // eTIMS States
  const [etimsEnabled, setEtimsEnabled] = useState(false);
  const [environment, setEnvironment] = useState('sandbox');
  const [kraPin, setKraPin] = useState('');
  const [branchId, setBranchId] = useState('00');
  const [deviceId, setDeviceId] = useState('');
  const [managerKey, setManagerKey] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch Existing Configuration on Load
  useEffect(() => {
    async function fetchKraConfig() {
      try {
        const res = await fetch(`${apiBaseUrl}/admin/kra-config?companyId=${companyId}`);
        if (res.ok) {
          const payload = await res.json();
          if (payload.config) {
            setEtimsEnabled(payload.config.etimsEnabled);
            setEnvironment(payload.config.environment || 'sandbox');
            setKraPin(payload.config.kraPin || '');
            setBranchId(payload.config.branchId || '00');
            setDeviceId(payload.config.deviceId || '');
            setIsInitialized(!!payload.config.cmcKey);
          }
        }
      } catch (err) {
        console.error('Error tracking KRA config state:', err);
      }
    }
    fetchKraConfig();
  }, [companyId, apiBaseUrl]);

  // Save Config parameters
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/kra-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          etimsEnabled,
          environment,
          kraPin: kraPin.toUpperCase().trim(),
          branchId,
          deviceId,
          managerKey,
        }),
      });

      if (!res.ok) throw new Error('Failed to update eTIMS foundational variables.');
      showStatus('success', 'eTIMS parameters updated successfully.');
    } catch (err: any) {
      showStatus('error', err.message || 'Error occurred during profile persistence.');
    } finally {
      setLoading(false);
    }
  };

  // Run Real-time KRA Initialization Protocol Sequence
  const handleDeviceInitialization = async () => {
    setInitLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/kra-config/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Handshake rejected by tax authority.');

      setIsInitialized(true);
      showStatus('success', 'eTIMS Device Handshake completed. Communication key generated.');
    } catch (err: any) {
      showStatus('error', err.message || 'Initialization lifecycle sequence failed.');
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-3 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KRA eTIMS Integration</h2>
          <p className="text-sm text-gray-500 mt-1">Configure real-time fiscal invoicing signatures to match compliance standards.</p>
        </div>
        
        {/* Toggle Switch */}
        <label className="inline-flex items-center gap-3 cursor-pointer bg-gray-50 p-2 rounded-lg border">
          <input 
            type="checkbox" 
            checked={etimsEnabled} 
            onChange={(e) => setEtimsEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          <span className="text-sm font-semibold text-gray-700">Integration Active</span>
        </label>
      </div>

      <form onSubmit={handleSaveConfig} className="space-y-6">
        {/* Radio Row for Deployment Environment Context */}
        <div className="bg-gray-50 p-4 rounded-xl border flex items-center gap-6">
          <span className="text-sm font-semibold text-gray-700">Gateway Target:</span>
          <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-900">
            <input type="radio" value="sandbox" checked={environment === 'sandbox'} onChange={() => setEnvironment('sandbox')} name="env" />
            Sandbox Testing
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-900">
            <input type="radio" value="production" checked={environment === 'production'} onChange={() => setEnvironment('production')} name="env" />
            Live Production
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup id="kra-pin" label="Company KRA PIN" value={kraPin} onChange={(e) => setKraPin(e.target.value)} Icon={IdentificationIcon} placeholder="A00XXXXXXXZ" maxLength={11} required />
          <InputGroup id="branch-id" label="Branch Identifier (Default: Head Office)" value={branchId} onChange={(e) => setBranchId(e.target.value)} Icon={BuildingOfficeIcon} placeholder="00" required />
          <InputGroup id="device-id" label="eTIMS Issued Device Serial/ID" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} Icon={CpuChipIcon} placeholder="OSCUXXXXXXXX" required />
          <InputGroup id="manager-key" label="Account Manager API Key" type="password" value={managerKey} onChange={(e) => setManagerKey(e.target.value)} Icon={ShieldCheckIcon} placeholder="••••••••••••••••" />
        </div>

        <SaveButton label="Update eTIMS Profile parameters" loading={loading} />
      </form>

      {/* Dynamic Handshake Interface Panel */}
      {etimsEnabled && kraPin && deviceId && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="font-bold text-blue-900 text-lg flex items-center gap-2">
              Device Sync Status: {isInitialized ? <span className="text-green-600">Active Handshake</span> : <span className="text-amber-600">Pending Sync</span>}
            </h4>
            <p className="text-sm text-blue-800 mt-1">
              {isInitialized 
                ? "Your configuration contains a functional operational session token. Re-run only if keys roll over."
                : "A secure handshake execution with KRA is required to pull and cache your unique local communication key (cmcKey)."}
            </p>
          </div>
          <button
            type="button"
            disabled={initLoading}
            onClick={handleDeviceInitialization}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {initLoading ? 'Authenticating Handshake...' : 'Initialize Device Profile'}
          </button>
        </div>
      )}
    </div>
  );
};