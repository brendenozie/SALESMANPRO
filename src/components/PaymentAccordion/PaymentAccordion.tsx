import React from 'react';

interface PaymentSettings {
  mpesaShortcode?: string;
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaCallbackUrl?: string;
}

const PaymentAccordion = ({ form, setForm } : any) => {
  const updateSection = <K extends string>(section: string, key: K, value: any) => {
    setForm((f: any) => ({
      ...f,
      [section]: { ...f[section], [key]: value }
    }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>Payments</span>
        <span className="text-xl">💳</span>
      </h2>

      {/* Payment Settings */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">M‑Pesa (Daraja API)</h3>
        <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-gray-600 px-2">Credentials</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mpesaShortcode" className="block text-xs font-medium text-gray-600">Business Shortcode</label>
              <input
                id="mpesaShortcode"
                type="text"
                value={form.paymentSettings?.mpesaShortcode || ''}
                onChange={e => updateSection('paymentSettings', 'mpesaShortcode', e.target.value)}
                placeholder="123456"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="mpesaConsumerKey" className="block text-xs font-medium text-gray-600">Consumer Key</label>
              <input
                id="mpesaConsumerKey"
                type="text"
                value={form.paymentSettings?.mpesaConsumerKey || ''}
                onChange={e => updateSection('paymentSettings', 'mpesaConsumerKey', e.target.value)}
                placeholder="Daraja Key"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="mpesaConsumerSecret" className="block text-xs font-medium text-gray-600">Consumer Secret</label>
              <input
                id="mpesaConsumerSecret"
                type="text"
                value={form.paymentSettings?.mpesaConsumerSecret || ''}
                onChange={e => updateSection('paymentSettings', 'mpesaConsumerSecret', e.target.value)}
                placeholder="Daraja Secret"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="mpesaCallbackUrl" className="block text-xs font-medium text-gray-600">Callback URL</label>
              <input
                id="mpesaCallbackUrl"
                type="url"
                value={form.paymentSettings?.mpesaCallbackUrl || ''}
                onChange={e => updateSection('paymentSettings', 'mpesaCallbackUrl', e.target.value)}
                placeholder="https://yourdomain.com/callback"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </fieldset>
      </section>

    </div>
  );
};

export default PaymentAccordion;
