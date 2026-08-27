'use client';

import { useState, useTransition } from 'react';
import { saveKraConfiguration } from '@/app/actions/kra-settings';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  BuildingOfficeIcon, 
  ServerIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface KraSettingsFormProps {
  companyId: string;
  initialData?: any; 
}

export default function KraSettingsForm({ companyId, initialData }: KraSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{success?: boolean, message?: string} | null>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await saveKraConfiguration(companyId, formData);
      setStatus(result);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">KRA eTIMS Integration</h2>
          <p className="text-sm text-slate-500">Configure your OSCU/VSCU credentials</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* KRA PIN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">KRA PIN</label>
            <div className="relative">
              <BuildingOfficeIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input 
                name="kraPin" 
                defaultValue={initialData?.kraPin}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. A000000000Z"
              />
            </div>
          </div>

          {/* Branch ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch ID</label>
            <input 
              name="branchId" 
              defaultValue={initialData?.branchId || '00'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Manager Key */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">eTIMS Manager API Key</label>
          <div className="relative">
            <KeyIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="password"
              name="managerKey" 
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Paste your KRA provided manager key"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Environment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Environment</label>
            <select 
              name="environment"
              defaultValue={initialData?.environment || 'sandbox'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="production">Production (Live)</option>
            </select>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between px-4 py-2 border border-slate-300 rounded-lg mt-6">
            <span className="text-sm font-medium text-slate-700">Enable eTIMS</span>
            <input 
              type="checkbox" 
              name="etimsEnabled"
              value="true"
              defaultChecked={initialData?.etimsEnabled}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          {status && (
            <p className={`text-sm flex items-center gap-1 ${status.success ? 'text-emerald-600' : 'text-rose-600'}`}>
              {status.success && <CheckCircleIcon className="w-4 h-4" />}
              {status.message}
            </p>
          )}
          <button 
            type="submit"
            disabled={isPending}
            className="ml-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}